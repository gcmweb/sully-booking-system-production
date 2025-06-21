
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../../lib/db";
import { createPaymentIntent, validateStripeConfig } from "../../../../../lib/stripe-live";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe configuration
    const stripeConfig = validateStripeConfig();
    if (!stripeConfig.valid) {
      console.error('Stripe configuration errors:', stripeConfig.errors);
      return NextResponse.json(
        { 
          error: 'Payment system configuration error',
          details: 'Please contact support',
        },
        { status: 500 }
      );
    }

    const { bookingId, amount, currency = 'gbp' } = await request.json();

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: 'Booking ID and amount are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        venue: {
          select: {
            name: true,
            ownerId: true,
          },
        },
        customer: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
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

    // Check if payment already exists
    const existingPayment = await prisma.payment.findFirst({
      where: { 
        bookingId,
        status: { in: ['PENDING', 'COMPLETED'] }
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already exists for this booking' },
        { status: 400 }
      );
    }

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(
      amount,
      currency,
      {
        bookingId,
        venueId: booking.venueId,
        venueName: booking.venue.name,
        customerEmail: booking.customer?.email || 'guest',
        customerName: booking.customer ? `${booking.customer.firstName} ${booking.customer.lastName}` : 'Guest',
        bookingDate: booking.date?.toISOString() || booking.startTime.toISOString(),
        bookingTime: booking.time || booking.startTime.toLocaleTimeString(),
        source: 'sully_booking_system',
      }
    );

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        currency: currency.toUpperCase(),
        status: 'PENDING',
        provider: 'STRIPE',
        providerPaymentId: paymentIntent.id,
        metadata: {
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          venueName: booking.venue.name,
          customerEmail: booking.customer?.email,
          createdAt: new Date().toISOString(),
        },
      },
    });

    console.log(`✅ Payment intent created for booking ${bookingId}, amount: ${amount} ${currency.toUpperCase()}`);

    return NextResponse.json({
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
      },
      booking: {
        id: booking.id,
        venueName: booking.venue.name,
        date: booking.date,
        time: booking.time,
      },
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    
    // Return user-friendly error messages
    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
