
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../lib/db";

// Get public venues list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const venueType = searchParams.get('venueType') || '';

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { cuisine: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (city && city !== 'all') {
      where.city = city;
    }

    if (venueType && venueType !== 'all') {
      where.venueType = venueType;
    }

    // Get total count for pagination
    const total = await prisma.venue.count({ where });

    // Calculate pagination
    const skip = (page - 1) * limit;
    const pages = Math.ceil(total / limit);

    // Get venues with pagination
    const venues = await prisma.venue.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        city: true,
        phone: true,
        email: true,
        website: true,
        cuisine: true,
        venueType: true,
        isActive: true,
        capacity: true,
        branding: true,
        images: {
          select: {
            id: true,
            url: true,
            alt: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      skip,
      take: limit,
    });

    // Get unique cities for filter dropdown
    const citiesResult = await prisma.venue.findMany({
      where: { isActive: true },
      select: { city: true },
      distinct: ['city'],
      orderBy: { city: 'asc' },
    });

    const cities = citiesResult
      .map(v => v.city)
      .filter(city => city && city.trim() !== '')
      .sort();

    return NextResponse.json({
      success: true,
      venues: venues || [],
      cities: cities || [],
      pagination: {
        page,
        limit,
        total: total || 0,
        pages: pages || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching public venues:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        venues: [],
        cities: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          pages: 0,
        },
      },
      { status: 500 }
    );
  }
}
