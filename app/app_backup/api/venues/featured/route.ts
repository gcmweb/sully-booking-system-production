
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../lib/db";

export const dynamic = 'force-dynamic';

// GET /api/venues/featured - Get all featured venues (public endpoint)
export async function GET() {
  try {
    const featuredVenues = await prisma.venue.findMany({
      where: {
        featured: true,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        city: true,
        postcode: true,
        phone: true,
        email: true,
        website: true,
        cuisine: true,
        venueType: true,
        logoUrl: true,
        headerImageUrl: true,
        isActive: true,
        featured: true,
        capacity: true,
        branding: true,
        images: {
          select: {
            id: true,
            url: true,
            alt: true,
          },
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
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
      take: 3,
    });

    return NextResponse.json({
      success: true,
      data: featuredVenues,
    });
  } catch (error) {
    console.error('Error fetching featured venues:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch featured venues',
      },
      { status: 500 }
    );
  }
}
