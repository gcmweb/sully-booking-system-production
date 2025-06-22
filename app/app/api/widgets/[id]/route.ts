
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const widget = await prisma.bookingWidget.findUnique({
      where: { id: params.id },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            description: true,
            address: true,
            city: true,
            phone: true,
            email: true,
            venueType: true,
            cuisine: true,
            isActive: true,
          },
        },
      },
    });

    if (!widget || !widget.venue.isActive) {
      return NextResponse.json(
        { error: 'Widget not found or venue not active' },
        { status: 404 }
      );
    }

    return NextResponse.json({ widget });
  } catch (error) {
    console.error('Get widget error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch widget' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { name, settings, ...otherFields } = await request.json();

    // Get widget with venue info to check ownership
    const widget = await prisma.bookingWidget.findUnique({
      where: { id: params.id },
      include: {
        venue: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (user.role === 'VENUE_OWNER' && widget.venue.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Prepare update data by mapping settings to individual fields
    const updateData: any = {};
    
    if (name !== undefined) {
      updateData.name = name;
    }

    // Map settings object to individual schema fields
    if (settings) {
      if (settings.theme !== undefined) {
        updateData.theme = settings.theme;
      }
      if (settings.primaryColor !== undefined) {
        updateData.primaryColor = settings.primaryColor;
      }
      if (settings.backgroundColor !== undefined) {
        updateData.backgroundColor = settings.backgroundColor;
      }
      if (settings.textColor !== undefined) {
        updateData.textColor = settings.textColor;
      }
      if (settings.allowGuestBooking !== undefined) {
        updateData.allowGuestBooking = settings.allowGuestBooking;
      }
      if (settings.requirePhone !== undefined) {
        updateData.requirePhone = settings.requirePhone;
      }
      if (settings.maxAdvanceBooking !== undefined) {
        updateData.maxAdvanceBooking = settings.maxAdvanceBooking;
      }
      if (settings.minAdvanceBooking !== undefined) {
        updateData.minAdvanceBooking = settings.minAdvanceBooking;
      }
    }

    // Include any other direct field updates
    Object.assign(updateData, otherFields);

    const updatedWidget = await prisma.bookingWidget.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ widget: updatedWidget });
  } catch (error) {
    console.error('Update widget error:', error);
    return NextResponse.json(
      { error: 'Failed to update widget' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    // Get widget with venue info to check ownership
    const widget = await prisma.bookingWidget.findUnique({
      where: { id: params.id },
      include: {
        venue: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (user.role === 'VENUE_OWNER' && widget.venue.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    await prisma.bookingWidget.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Widget deleted successfully' });
  } catch (error) {
    console.error('Delete widget error:', error);
    return NextResponse.json(
      { error: 'Failed to delete widget' },
      { status: 500 }
    );
  }
}
