
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../lib/db";
import { bookingSchema } from "../../../../lib/validations";
import { checkAvailability } from "../../../../lib/booking-utils";
import { checkSubscriptionLimits, incrementBookingUsage } from "../../../../lib/subscription";
import { sendBookingConfirmation, createNotification } from "../../../../lib/notifications";
import { BookingStatus, NotificationType, BookingSource } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bookingData = bookingSchema.parse(body);

    // Check venue exists and is active
    const venue = await prisma.venue.findUnique({
      where: { 
        id: bookingData.venueId,
        isActive: true,
      },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found or not available for bookings' },
        { status: 404 }
      );
    }

    // Check subscription limits
    const subscriptionCheck = await checkSubscriptionLimits(bookingData.venueId);
    if (!subscriptionCheck.canCreateBooking) {
      return NextResponse.json(
        { error: 'This venue has reached its booking limit. Please contact the venue directly.' },
        { status: 403 }
      );
    }

    // Check availability
    const bookingDate = new Date(bookingData.date);
    const availability = await checkAvailability(
      bookingData.venueId,
      bookingDate,
      bookingData.time,
      bookingData.partySize,
      bookingData.serviceType,
      bookingData.tableId
    );

    if (!availability.available) {
      return NextResponse.json(
        { error: availability.reason },
        { status: 409 }
      );
    }

    // Calculate start and end times
    const [hours, minutes] = bookingData.time.split(':').map(Number);
    const startTime = new Date(bookingDate);
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1); // Default 1 hour booking
    
    const totalHours = 1; // Default duration
    const pricePerHour = venue.pricePerHour || 50; // Default price
    const totalAmount = totalHours * pricePerHour;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        venueId: bookingData.venueId,
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        customerPhone: bookingData.customerPhone,
        startTime,
        endTime,
        totalHours,
        pricePerHour,
        totalAmount,
        partySize: bookingData.partySize,
        serviceType: bookingData.serviceType,
        date: bookingDate,
        time: bookingData.time,
        tableId: bookingData.tableId,
        notes: bookingData.specialRequests,
        status: BookingStatus.PENDING,
        source: BookingSource.DIRECT,
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            phone: true,
            email: true,
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

    // Increment booking usage
    await incrementBookingUsage(bookingData.venueId);

    // Send confirmation email
    await sendBookingConfirmation(bookingData.customerEmail, {
      bookingId: booking.id,
      customerName: bookingData.customerName,
      venueName: venue.name,
      venueAddress: `${venue.address}, ${venue.city}`,
      venuePhone: venue.phone,
      date: bookingDate.toDateString(),
      time: bookingData.time,
      partySize: bookingData.partySize,
      serviceType: bookingData.serviceType,
      specialRequests: bookingData.specialRequests,
    });

    // Create notification for venue owner
    await createNotification(
      venue.ownerId,
      NotificationType.BOOKING_CONFIRMATION,
      'New Booking Received',
      `New ${bookingData.serviceType.toLowerCase()} booking from ${bookingData.customerName} for ${bookingDate.toDateString()} at ${bookingData.time}`,
      { bookingId: booking.id }
    );

    return NextResponse.json({ 
      booking: {
        id: booking.id,
        status: booking.status,
        date: booking.date,
        time: booking.time,
        partySize: booking.partySize,
        serviceType: booking.serviceType,
        venue: booking.venue,
        table: booking.table,
      },
      message: 'Booking created successfully! You will receive a confirmation email shortly.',
    });
  } catch (error) {
    console.error('Create public booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking. Please try again.' },
      { status: 500 }
    );
  }
}
