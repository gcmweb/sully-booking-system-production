
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../../lib/db";
import { requireAuth } from "../../../../../lib/auth";
import { venueOpeningHoursSchema } from "../../../../../lib/validations";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    // Verify venue ownership or allow public access for active venues
    const venue = await prisma.venue.findUnique({
      where: { id: params.id },
      include: {
        venueOpeningHours: {
          orderBy: [
            { dayOfWeek: 'asc' },
            { openTime: 'asc' }
          ]
        }
      }
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Check ownership for private access
    if (venue.ownerId !== user.id && user.role !== 'SUPER_ADMIN') {
      // For non-owners, only return opening hours if venue is active
      if (!venue.isActive) {
        return NextResponse.json(
          { error: 'Venue not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ 
      openingHours: venue.venueOpeningHours 
    });
  } catch (error) {
    console.error('Get venue opening hours error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venue opening hours' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔵 [OPENING_HOURS_API] POST request received for venue:', params.id);
    
    const user = await requireAuth();
    console.log('🔵 [OPENING_HOURS_API] User authenticated:', user.id);
    
    let body;
    try {
      body = await request.json();
      console.log('🔵 [OPENING_HOURS_API] Request body:', body);
    } catch (parseError) {
      console.error('🔴 [OPENING_HOURS_API] JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON format in request body' },
        { status: 400 }
      );
    }
    
    let validatedData;
    try {
      validatedData = venueOpeningHoursSchema.parse(body);
      console.log('🔵 [OPENING_HOURS_API] Data validated successfully:', validatedData);
    } catch (validationError) {
      console.error('🔴 [OPENING_HOURS_API] Validation error:', validationError);
      return NextResponse.json(
        { error: 'Invalid opening hours data format', details: validationError },
        { status: 400 }
      );
    }
    
    const { openingHours } = validatedData;

    // Verify venue ownership
    const venue = await prisma.venue.findUnique({
      where: { id: params.id, ownerId: user.id },
    });

    if (!venue) {
      console.error('🔴 [OPENING_HOURS_API] Venue not found or access denied for user:', user.id, 'venue:', params.id);
      return NextResponse.json(
        { error: 'Venue not found or access denied' },
        { status: 404 }
      );
    }

    // Validate time slots don't overlap for the same day
    const dayGroups = openingHours.reduce((acc, slot) => {
      if (!acc[slot.dayOfWeek]) acc[slot.dayOfWeek] = [];
      acc[slot.dayOfWeek].push(slot);
      return acc;
    }, {} as Record<number, typeof openingHours>);

    for (const [day, slots] of Object.entries(dayGroups)) {
      const sortedSlots = slots.sort((a, b) => a.openTime.localeCompare(b.openTime));
      
      for (let i = 0; i < sortedSlots.length - 1; i++) {
        const current = sortedSlots[i];
        const next = sortedSlots[i + 1];
        
        if (current.closeTime > next.openTime) {
          return NextResponse.json(
            { error: `Overlapping time slots on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(day)]}` },
            { status: 400 }
          );
        }
      }
    }

    // Delete existing opening hours for this venue
    await prisma.venueOpeningHours.deleteMany({
      where: { venueId: params.id }
    });

    // Create new opening hours
    const createdHours = await prisma.venueOpeningHours.createMany({
      data: openingHours.map(hour => ({
        venueId: params.id,
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        name: hour.name || null,
        isActive: hour.isActive,
      }))
    });

    // Fetch the created opening hours
    const newOpeningHours = await prisma.venueOpeningHours.findMany({
      where: { venueId: params.id },
      orderBy: [
        { dayOfWeek: 'asc' },
        { openTime: 'asc' }
      ]
    });

    return NextResponse.json({ 
      openingHours: newOpeningHours,
      message: 'Opening hours updated successfully'
    });
  } catch (error: any) {
    console.error('🔴 [OPENING_HOURS_API] Create venue opening hours error:', error);
    
    // Handle specific error types
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid opening hours data format', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicate opening hours entry' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update venue opening hours', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return POST(request, { params });
}
