
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../../lib/db";
import { requireAuth } from "../../../../../lib/auth";
import { availabilitySchema } from "../../../../../lib/validations";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    // Verify venue ownership
    const venue = await prisma.venue.findUnique({
      where: { id: params.id, ownerId: user.id },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found or access denied' },
        { status: 404 }
      );
    }

    const availability = await prisma.venueAvailability.findMany({
      where: { venueId: params.id },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json({ availability });
  } catch (error) {
    console.error('Get venue availability error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venue availability' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const availabilityData = availabilitySchema.parse(body);

    // Verify venue ownership
    const venue = await prisma.venue.findUnique({
      where: { id: params.id, ownerId: user.id },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found or access denied' },
        { status: 404 }
      );
    }

    // Create or update availability
    const availability = await prisma.venueAvailability.upsert({
      where: {
        venueId_dayOfWeek: {
          venueId: params.id,
          dayOfWeek: availabilityData.dayOfWeek,
        },
      },
      update: {
        openTime: availabilityData.openTime,
        closeTime: availabilityData.closeTime,
        isOpen: availabilityData.isOpen,
      },
      create: {
        venueId: params.id,
        dayOfWeek: availabilityData.dayOfWeek,
        openTime: availabilityData.openTime,
        closeTime: availabilityData.closeTime,
        isOpen: availabilityData.isOpen,
      },
    });

    return NextResponse.json({ availability });
  } catch (error) {
    console.error('Create venue availability error:', error);
    return NextResponse.json(
      { error: 'Failed to create venue availability' },
      { status: 500 }
    );
  }
}
