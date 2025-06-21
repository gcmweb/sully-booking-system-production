
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../../lib/db";
import { requireAuth } from "../../../../../lib/auth";
import { BookingStatus, NotificationType } from '@prisma/client';
import { createNotification } from "../../../../../lib/notifications";

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { status } = await request.json();

    if (!Object.values(BookingStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid booking status' },
        { status: 400 }
      );
    }

    // Get booking with venue info
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (user.role === 'VENUE_OWNER' && booking.venue.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    if (user.role === 'CUSTOMER' && booking.customerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
          },
        },
        table: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create notifications based on status change
    let notificationType: NotificationType;
    let notificationTitle: string;
    let notificationMessage: string;

    switch (status) {
      case BookingStatus.CONFIRMED:
        notificationType = NotificationType.BOOKING_CONFIRMATION;
        notificationTitle = 'Booking Confirmed';
        notificationMessage = `Your booking at ${booking.venue.name} has been confirmed for ${booking.date?.toDateString() || booking.startTime.toDateString()} at ${booking.time || booking.startTime.toLocaleTimeString()}`;
        break;
      case BookingStatus.CANCELLED:
        notificationType = NotificationType.BOOKING_CANCELLED;
        notificationTitle = 'Booking Cancelled';
        notificationMessage = `Your booking at ${booking.venue.name} for ${booking.date?.toDateString() || booking.startTime.toDateString()} at ${booking.time || booking.startTime.toLocaleTimeString()} has been cancelled`;
        break;
      default:
        notificationType = NotificationType.SYSTEM_ALERT;
        notificationTitle = 'Booking Updated';
        notificationMessage = `Your booking status has been updated to ${status.toLowerCase()}`;
    }

    // Send notification to customer if booking has a customer ID
    if (booking.customerId) {
      await createNotification(
        booking.customerId,
        notificationType,
        notificationTitle,
        notificationMessage,
        { bookingId: booking.id }
      );
    }

    // Send notification to venue owner if status changed by customer
    if (user.role === 'CUSTOMER') {
      await createNotification(
        booking.venue.ownerId,
        NotificationType.SYSTEM_ALERT,
        'Booking Status Changed',
        `Customer ${booking.customerName} has ${status.toLowerCase()} their booking for ${booking.date?.toDateString() || booking.startTime.toDateString()} at ${booking.time || booking.startTime.toLocaleTimeString()}`,
        { bookingId: booking.id }
      );
    }

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error('Update booking status error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    );
  }
}
