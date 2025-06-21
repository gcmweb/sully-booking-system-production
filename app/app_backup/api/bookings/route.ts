
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../lib/db";
import { requireAuth } from "../../../lib/auth";
import { bookingSchema } from "../../../lib/validations";
import { checkAvailability } from "../../../lib/booking-utils";
import { checkSubscriptionLimits, incrementBookingUsage } from "../../../lib/subscription";
import { sendBookingConfirmation, createNotification } from "../../../lib/notifications";
import { Role, ServiceType, BookingStatus, NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venueId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let whereClause: any = {};

    if (user.role === Role.CUSTOMER) {
      whereClause.customerId = user.id;
    } else if (user.role === Role.VENUE_OWNER) {
      if (venueId) {
        // Verify venue ownership
        const venue = await prisma.venue.findUnique({
          where: { id: venueId, ownerId: user.id },
        });
        if (!venue) {
          return NextResponse.json(
            { 
              error: 'Access denied',
              bookings: [], // Always provide fallback array
              pagination: {
                page: 1,
                limit: 10,
                total: 0,
                pages: 0,
              }
            },
            { status: 403 }
          );
        }
        whereClause.venueId = venueId;
      } else {
        // Get all bookings for user's venues
        const userVenues = await prisma.venue.findMany({
          where: { ownerId: user.id },
          select: { id: true },
        });
        
        // Ensure userVenues is an array and extract IDs safely
        const venueIds = Array.isArray(userVenues) ? userVenues.map(v => v?.id).filter(Boolean) : [];
        
        if (venueIds.length > 0) {
          whereClause.venueId = {
            in: venueIds,
          };
        } else {
          // No venues found, return empty result
          return NextResponse.json({
            success: true,
            bookings: [],
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
              pages: 0,
            },
          });
        }
      }
    } else if (user.role === Role.SUPER_ADMIN) {
      if (venueId) {
        whereClause.venueId = venueId;
      }
    }

    if (status) {
      whereClause.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
        table: {
          select: {
            id: true,
            name: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.booking.count({ where: whereClause });

    // Ensure bookings is always an array
    const safeBookings = Array.isArray(bookings) ? bookings : [];

    return NextResponse.json({
      success: true,
      bookings: safeBookings,
      pagination: {
        page: page || 1,
        limit: limit || 10,
        total: total || 0,
        pages: Math.ceil((total || 0) / (limit || 10)),
      },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch bookings',
        bookings: [], // Always provide fallback array
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bookingData = bookingSchema.parse(body);

    // Check venue exists
    const venue = await prisma.venue.findUnique({
      where: { id: bookingData.venueId },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Check subscription limits
    const subscriptionCheck = await checkSubscriptionLimits(bookingData.venueId);
    if (!subscriptionCheck.canCreateBooking) {
      return NextResponse.json(
        { error: 'Booking limit exceeded for this venue' },
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

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        ...bookingData,
        date: bookingDate,
        status: BookingStatus.PENDING,
      },
      include: {
        venue: true,
        table: true,
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
      `New booking from ${bookingData.customerName} for ${bookingDate.toDateString()} at ${bookingData.time}`
    );

    return NextResponse.json({ 
      success: true,
      booking 
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
