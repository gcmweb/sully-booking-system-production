
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../../lib/db";
import { checkImageUploadPermissions } from "../../../../../lib/subscription";
import { VenueImageType } from '@prisma/client';

// Get venue images
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = params.id;

    // Check if venue exists and user has access
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        images: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      images: venue.images,
    });
  } catch (error) {
    console.error('Error fetching venue images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Upload venue images
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = params.id;
    const body = await request.json();
    const { url, alt, type, displayOrder } = body;

    // Validate required fields
    if (!url || !type) {
      return NextResponse.json(
        { error: 'URL and type are required' },
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
    
    if (!permissions.canUploadGallery) {
      return NextResponse.json(
        { error: 'Gallery uploads not available on your current plan' },
        { status: 403 }
      );
    }

    // Check current gallery image count
    const currentImageCount = await prisma.venueImage.count({
      where: {
        venueId,
        isActive: true,
      },
    });

    if (currentImageCount >= permissions.maxGalleryImages) {
      return NextResponse.json(
        { error: `Maximum of ${permissions.maxGalleryImages} images allowed on your plan` },
        { status: 403 }
      );
    }

    // Create the image record
    const image = await prisma.venueImage.create({
      data: {
        venueId,
        url,
        alt: alt || '',
        type: type as VenueImageType,
        displayOrder: displayOrder || 0,
      },
    });

    return NextResponse.json({
      success: true,
      image,
    });
  } catch (error) {
    console.error('Error uploading venue image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update image order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = params.id;
    const body = await request.json();
    const { images } = body;

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Images array is required' },
        { status: 400 }
      );
    }

    // Update display order for each image
    const updatePromises = images.map((image: any, index: number) =>
      prisma.venueImage.update({
        where: {
          id: image.id,
          venueId, // Ensure image belongs to this venue
        },
        data: {
          displayOrder: index,
        },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Image order updated successfully',
    });
  } catch (error) {
    console.error('Error updating image order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
