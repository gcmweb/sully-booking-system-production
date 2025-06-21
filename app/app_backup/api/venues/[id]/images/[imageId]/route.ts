
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../../../lib/db";

// Delete venue image
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const venueId = params.id;
    const imageId = params.imageId;

    // Check if image exists and belongs to the venue
    const image = await prisma.venueImage.findFirst({
      where: {
        id: imageId,
        venueId,
      },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Soft delete the image
    await prisma.venueImage.update({
      where: { id: imageId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting venue image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update venue image
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const venueId = params.id;
    const imageId = params.imageId;
    const body = await request.json();
    const { alt, type, displayOrder } = body;

    // Check if image exists and belongs to the venue
    const existingImage = await prisma.venueImage.findFirst({
      where: {
        id: imageId,
        venueId,
      },
    });

    if (!existingImage) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Update the image
    const updatedImage = await prisma.venueImage.update({
      where: { id: imageId },
      data: {
        ...(alt !== undefined && { alt }),
        ...(type !== undefined && { type }),
        ...(displayOrder !== undefined && { displayOrder }),
      },
    });

    return NextResponse.json({
      success: true,
      image: updatedImage,
    });
  } catch (error) {
    console.error('Error updating venue image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
