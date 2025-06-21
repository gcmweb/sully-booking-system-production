
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../lib/db";
import { requireAuth } from "../../../lib/auth";
import { widgetSchema } from "../../../lib/validations";
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venueId');

    if (venueId) {
      // Fetch widgets for a specific venue
      const venue = await prisma.venue.findUnique({
        where: { id: venueId },
      });

      if (!venue) {
        return NextResponse.json(
          { error: 'Venue not found' },
          { status: 404 }
        );
      }

      // Check permissions
      if (user.role !== Role.SUPER_ADMIN && venue.ownerId !== user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      const widgets = await prisma.bookingWidget.findMany({
        where: { venueId },
        include: {
          venue: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ widgets });
    } else {
      // Fetch all widgets for the authenticated user's venues
      const whereClause = user.role === Role.SUPER_ADMIN 
        ? {} 
        : { venue: { ownerId: user.id } };

      const widgets = await prisma.bookingWidget.findMany({
        where: whereClause,
        include: {
          venue: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ widgets });
    }
  } catch (error) {
    console.error('Get widgets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch widgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { venueId, ...widgetData } = body;
    const parsedData = widgetSchema.parse(widgetData);

    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (user.role !== Role.SUPER_ADMIN && venue.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Generate embed code
    const embedCode = `<iframe src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/widget/${venueId}" width="100%" height="600" frameborder="0"></iframe>`;

    const widget = await prisma.bookingWidget.create({
      data: {
        ...parsedData,
        venueId,
        embedCode,
      },
    });

    return NextResponse.json({ widget });
  } catch (error) {
    console.error('Create widget error:', error);
    return NextResponse.json(
      { error: 'Failed to create widget' },
      { status: 500 }
    );
  }
}
