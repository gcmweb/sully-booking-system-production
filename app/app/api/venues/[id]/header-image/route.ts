
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../../lib/db";
import { checkImageUploadPermissions } from "../../../../../lib/subscription";

// Update venue header image
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = params.id;
    const body = await request.json();
    const { headerImageUrl } = body;

    if (!headerImageUrl) {
      return NextResponse.json(
        { error: 'Header image URL is required' },
        { status: 400 }
      );
    }

    // Check if venue exists
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Check upload permissions
    const permissions = await checkImageUploadPermissions(venueId);
    
    if (!permissions.canUploadHeader) {
      return NextResponse.json(
        { error: 'Header image uploads not available on your current plan' },
        { status: 403 }
      );
    }

    // Update venue header image
    const updatedVenue = await prisma.venue.update({
      where: { id: venueId },
      data: { headerImageUrl },
    });

    return NextResponse.json({
      success: true,
      venue: updatedVenue,
    });
  } catch (error) {
    console.error('Error updating venue header image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Remove venue header image
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = params.id;

    // Update venue to remove header image
    const updatedVenue = await prisma.venue.update({
      where: { id: venueId },
      data: { headerImageUrl: null },
    });

    return NextResponse.json({
      success: true,
      venue: updatedVenue,
    });
  } catch (error) {
    console.error('Error removing venue header image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
