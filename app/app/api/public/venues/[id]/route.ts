import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VenueStatus } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venue = await prisma.venue.findUnique({
      where: {
        id: params.id,
        status: VenueStatus.ACTIVE,
      },
      include: {
        images: true,
        openingHours: true,
        tables: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Transform the venue data for public consumption
    const publicVenue = {
      id: venue.id,
      name: venue.name,
      description: venue.description,
      address: venue.address,
      phone: venue.phone,
      email: venue.email,
      website: venue.website,
      cuisine: venue.cuisine,
      priceRange: venue.priceRange,
      capacity: venue.capacity,
      headerImageUrl: venue.headerImageUrl,
      logoUrl: venue.logoUrl,
      images: venue.images,
      openingHours: venue.openingHours,
      tables: venue.tables,
      owner: venue.user,
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt,
    };

    return NextResponse.json(publicVenue);
  } catch (error) {
    console.error('Error fetching venue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
