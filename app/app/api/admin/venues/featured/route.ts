
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../../lib/db";
import { requireAuth } from "../../../../../lib/auth";

export const dynamic = 'force-dynamic';

// POST /api/admin/venues/featured - Toggle featured status of a venue
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(['SUPER_ADMIN']);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { venueId, featured } = await request.json();

    if (!venueId || typeof featured !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // If trying to feature a venue, check if we already have 3 featured venues
    if (featured) {
      const currentFeaturedCount = await prisma.venue.count({
        where: {
          isActive: true,
          id: { not: venueId }, // Exclude current venue from count
        },
      });

      if (currentFeaturedCount >= 3) {
        return NextResponse.json(
          {
            success: false,
            error: 'Maximum of 3 venues can be featured at a time. Please unfeature another venue first.',
          },
          { status: 400 }
        );
      }
    }

    // Update the venue's featured status
    const updatedVenue = await prisma.venue.update({
      where: { id: venueId },
      data: { isActive: featured },
      include: {
        images: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          take: 1,
        },
        owner: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedVenue,
      message: `Venue ${featured ? 'featured' : 'unfeatured'} successfully`,
    });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update featured status',
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/venues/featured - Get featured venues count and list for admin
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(['SUPER_ADMIN']);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [featuredVenues, featuredCount] = await Promise.all([
      prisma.venue.findMany({
        where: {
          featured: true,
          isActive: true,
        },
        include: {
          images: {
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
            take: 1,
          },
          owner: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      prisma.venue.count({
        where: {
          featured: true,
          isActive: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        venues: featuredVenues,
        count: featuredCount,
        maxAllowed: 3,
      },
    });
  } catch (error) {
    console.error('Error fetching featured venues for admin:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch featured venues',
      },
      { status: 500 }
    );
  }
}
