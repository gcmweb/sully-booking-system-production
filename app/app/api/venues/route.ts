
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../lib/db";
import { requireAuth } from "../../../lib/auth";
import { venueSchema } from "../../../lib/validations";
import { checkVenueCreationLimits } from "../../../lib/subscription";
import { Role, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    let venues;
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
          _count: {
            select: {
              bookings: true,
              tables: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      venues = await prisma.venue.findMany({
        where: { ownerId: user.id },
        include: {
          _count: {
            select: {
              bookings: true,
              tables: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Ensure venues is always an array
    const safeVenues = Array.isArray(venues) ? venues : [];

    return NextResponse.json({ 
      success: true,
      venues: safeVenues 
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
    
    // Validate request body
    const venueData = venueSchema.parse(body);

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

    // Create venue with subscription
    const venue = await prisma.venue.create({
      data: {
        ...venueData,
        slug,
        ownerId: user.id,
        subscription: {
          create: {
            plan: SubscriptionPlan.STARTER,
            status: SubscriptionStatus.ACTIVE,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            bookingsLimit: 50,
          },
        },
      },
      include: {
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
