
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/auth";
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth([Role.SUPER_ADMIN]);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    let whereClause: any = {};
    
    if (type && type !== 'all') {
      whereClause.venueType = type;
    }
    
    if (status && status !== 'all') {
      whereClause.isActive = status === 'active';
    }

    const venues = await prisma.venue.findMany({
      where: whereClause,
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
        venueType: true,
        capacity: true,
        isActive: true,
        featured: true,
        createdAt: true,
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            tables: true,
            events: true,
          },
        },
        subscription: {
          select: {
            plan: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.venue.count({ where: whereClause });

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
    console.error('Get venues error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    );
  }
}
