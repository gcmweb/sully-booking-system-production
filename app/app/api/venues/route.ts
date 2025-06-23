import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VenueStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    const where: any = {
      userId: session.user.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { cuisine: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status as VenueStatus;
    }

    const [venues, total] = await Promise.all([
      prisma.venue.findMany({
        where,
        include: {
          images: {
            take: 1,
          },
          _count: {
            select: {
              bookings: true,
              tables: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.venue.count({ where }),
    ]);

    return NextResponse.json({
      venues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      address,
      phone,
      email,
      website,
      cuisine,
      priceRange,
      capacity,
    } = body;

    // Validate required fields
    if (!name || !description || !address) {
      return NextResponse.json(
        { error: 'Name, description, and address are required' },
        { status: 400 }
      );
    }

    // Check venue limits based on user's subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        _count: {
          select: {
            venues: {
              where: {
                status: {
                  not: VenueStatus.INACTIVE,
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check venue limits
    const venueCount = user._count.venues;
    let maxVenues = 1; // FREE plan
    
    if (user.planType === 'PAID') {
      maxVenues = 5;
    } else if (user.planType === 'PREMIUM') {
      maxVenues = 999; // Unlimited
    }

    if (venueCount >= maxVenues) {
      return NextResponse.json(
        { 
          error: `Venue limit reached. Your ${user.planType} plan allows ${maxVenues === 999 ? 'unlimited' : maxVenues} venue${maxVenues === 1 ? '' : 's'}.`,
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const venue = await prisma.venue.create({
      data: {
        name,
        description,
        address,
        phone,
        email,
        website,
        cuisine,
        priceRange,
        capacity: capacity ? parseInt(capacity) : null,
        userId: session.user.id,
        status: VenueStatus.ACTIVE,
      },
      include: {
        images: true,
        openingHours: true,
        tables: true,
      },
    });

    return NextResponse.json(venue, { status: 201 });
  } catch (error) {
    console.error('Error creating venue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
