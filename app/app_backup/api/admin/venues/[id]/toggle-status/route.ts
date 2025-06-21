
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../../../lib/db";
import { requireAuth } from "../../../../../../lib/auth";
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth([Role.SUPER_ADMIN]);
    const { id } = params;
    const { isActive } = await request.json();

    // Check if venue exists
    const venue = await prisma.venue.findUnique({
      where: { id },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Update venue status
    const updatedVenue = await prisma.venue.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    return NextResponse.json({ 
      message: `Venue ${isActive ? 'enabled' : 'disabled'} successfully`,
      venue: updatedVenue 
    });
  } catch (error) {
    console.error('Toggle venue status error:', error);
    return NextResponse.json(
      { error: 'Failed to update venue status' },
      { status: 500 }
    );
  }
}
