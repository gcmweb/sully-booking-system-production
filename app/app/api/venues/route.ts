
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../lib/db";
import { requireAuth } from "../../../lib/auth";
import { venueSchema } from "../../../lib/validations";
import { checkVenueCreationLimits } from "../../../lib/subscription";
import { Role, SubscriptionPlan, SubscriptionStatus, VenueImageType } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Type definitions for better type safety
interface VenueWithImages {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  postcode: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  capacity: number | null;
  pricePerHour: number | null;
  currency: string;
  featured: boolean;
  cuisine: string | null;
  venueType: string | null;
  amenities: string[];
  isActive: boolean;
  openingHours: any;
  latitude: number | null;
  longitude: number | null;
  slug: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  subscriptionId: string | null;
  images: {
    id: string;
    url: string;
    type: VenueImageType;
    isActive: boolean;
  }[];
  _count: {
    bookings: number;
    tables: number;
  };
  owner?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  headerImageUrl?: string | null;
  logoUrl?: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    let venues: VenueWithImages[];
    
    if (user.role === Role.SUPER_ADMIN) {
      venues = await prisma.venue.findMany({
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          images: {
            where: { isActive: true },
            select: {
              id: true,
              url: true,
              type: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              bookings: true,
              tables: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }) as VenueWithImages[];
    } else {
      venues = await prisma.venue.findMany({
        where: { ownerId: user.id },
        include: {
          images: {
            where: { isActive: true },
            select: {
              id: true,
              url: true,
              type: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              bookings: true,
              tables: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }) as VenueWithImages[];
    }

    // Ensure venues is always an array
    const safeVenues = Array.isArray(venues) ? venues : [];

    // Map images to expected fields for backward compatibility
    const venuesWithMappedImages = safeVenues.map(venue => {
      const headerImage = venue.images?.find(img => img.type === VenueImageType.MAIN && img.isActive);
      const logoImage = venue.images?.find(img => img.type === VenueImageType.THUMBNAIL && img.isActive);
      
      return {
        ...venue,
        headerImageUrl: headerImage?.url || null,
        logoUrl: logoImage?.url || null,
      };
    });

    return NextResponse.json({ 
      success: true,
      venues: venuesWithMappedImages 
    });
  } catch (error: any) {
    console.error('Get venues error:', error);
    
    // Handle authentication errors
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          venues: [] // Always provide fallback array
        },
        { status: 401 }
      );
    }
    
    if (error.message === 'Account is inactive') {
      return NextResponse.json(
        { 
          error: 'Account is inactive',
          venues: [] // Always provide fallback array
        },
        { status: 403 }
      );
    }
    
    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions',
          venues: [] // Always provide fallback array
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch venues',
        venues: [] // Always provide fallback array
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth([Role.VENUE_OWNER, Role.SUPER_ADMIN]);
    
    // Check venue creation limits (skip for super admin)
    if (user.role !== Role.SUPER_ADMIN) {
      const venueCheck = await checkVenueCreationLimits(user.id);
      if (!venueCheck.canCreateVenue) {
        return NextResponse.json(
          { 
            error: 'Venue limit reached',
            message: venueCheck.message,
            plan: venueCheck.plan,
            venuesUsed: venueCheck.venuesUsed,
            venuesLimit: venueCheck.venuesLimit
          },
          { status: 403 }
        );
      }
    }
    
    // Parse JSON body with error handling
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }
    
    // FIXED: Ensure all required fields have defaults if not provided
    const venueDataWithDefaults = {
      ...body,
      // Ensure required fields have sensible defaults
      state: body.state || 'Unknown',
      zipCode: body.zipCode || '00000',
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      country: body.country || 'US',
      currency: body.currency || 'USD',
      featured: body.featured || false,
      isActive: body.isActive !== undefined ? body.isActive : true,
    };
    
    // Validate request body with comprehensive schema
    const venueData = venueSchema.parse(venueDataWithDefaults);

    // Generate slug from name
    const slug = venueData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug is unique
    const existingVenue = await prisma.venue.findUnique({
      where: { slug },
    });

    if (existingVenue) {
      return NextResponse.json(
        { error: 'A venue with this name already exists' },
        { status: 409 }
      );
    }

    // First, create the subscription separately
    const subscription = await prisma.subscription.create({
      data: {
        plan: SubscriptionPlan.STARTER,
        status: SubscriptionStatus.ACTIVE.toString(), // Convert enum to string
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        planType: 'starter',
        amount: 0,
        userId: user.id,
      },
    });

    // FIXED: Create venue with ALL required fields from Prisma schema
    const venue = await prisma.venue.create({
      data: {
        // Core required fields
        name: venueData.name,
        address: venueData.address,
        city: venueData.city,
        state: venueData.state, // FIXED: Now included
        zipCode: venueData.zipCode, // FIXED: Now included
        amenities: venueData.amenities, // FIXED: Now included
        ownerId: user.id, // Required relation
        
        // Optional fields with defaults
        description: venueData.description || null,
        postcode: venueData.postcode || null,
        country: venueData.country,
        phone: venueData.phone || null,
        email: venueData.email || null,
        website: venueData.website || null,
        capacity: venueData.capacity || null,
        pricePerHour: venueData.pricePerHour || null,
        currency: venueData.currency,
        featured: venueData.featured,
        cuisine: venueData.cuisine || null,
        venueType: venueData.venueType || null,
        isActive: venueData.isActive,
        latitude: venueData.latitude || null,
        longitude: venueData.longitude || null,
        slug,
        metaTitle: venueData.metaTitle || null,
        metaDescription: venueData.metaDescription || null,
        subscriptionId: subscription.id, // Link to the created subscription
      },
      include: {
        subscription: true,
        images: {
          where: { isActive: true },
          select: {
            id: true,
            url: true,
            type: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            tables: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      venue 
    });
  } catch (error: any) {
    console.error('Create venue error:', error);
    
    // Handle authentication errors
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (error.message === 'Account is inactive') {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }
    
    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A venue with this information already exists' },
        { status: 409 }
      );
    }
    
    // Generic server error
    return NextResponse.json(
      { error: 'Failed to create venue' },
      { status: 500 }
    );
  }
}
