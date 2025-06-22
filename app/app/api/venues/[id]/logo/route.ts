
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../../lib/db";
import { checkImageUploadPermissions } from "../../../../../lib/subscription";

// Update venue logo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = params.id;
    const body = await request.json();
    const { logoUrl } = body;

    if (!logoUrl) {
      return NextResponse.json(
        { error: 'Logo URL is required' },
        { status: 400 }
      );
    }

    // Check if venue exists
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: { images: true }
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Check upload permissions
    const permissions = await checkImageUploadPermissions(venueId);
    
    if (!permissions.canUploadLogo) {
      return NextResponse.json(
        { error: 'Logo uploads not available on your current plan' },
        { status: 403 }
      );
    }

    // Remove existing logo/thumbnail image if it exists
    await prisma.venueImage.deleteMany({
      where: { 
        venueId: venueId,
        type: 'THUMBNAIL'
      }
    });

    // Create new logo image
    const logoImage = await prisma.venueImage.create({
      data: {
        url: logoUrl,
        type: 'THUMBNAIL',
        isPrimary: true,
        venueId: venueId,
        alt: `${venue.name} logo`
      }
    });

    // Get updated venue with images
    const updatedVenue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: { images: true }
    });

    return NextResponse.json({
      success: true,
      venue: updatedVenue,
      logoImage: logoImage
    });
  } catch (error) {
    console.error('Error updating venue logo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Remove venue logo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = params.id;

    // Remove logo/thumbnail image
    await prisma.venueImage.deleteMany({
      where: { 
        venueId: venueId,
        type: 'THUMBNAIL'
      }
    });

    // Get updated venue with images
    const updatedVenue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: { images: true }
    });

    return NextResponse.json({
      success: true,
      venue: updatedVenue,
    });
  } catch (error) {
    console.error('Error removing venue logo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
