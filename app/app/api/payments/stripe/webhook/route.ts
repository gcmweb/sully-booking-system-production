
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../../lib/db";
import { PaymentStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    // In a real application, you would verify the webhook signature:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    // For demo purposes, we'll parse the mock webhook data
    const event = JSON.parse(body);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  try {
    // Find payment by provider payment ID
    const payment = await prisma.payment.findFirst({
      where: {
        providerPaymentId: paymentIntent.id,
      },
      include: {
        booking: {
          include: {
            venue: true,
          },
        },
      },
    });

    if (!payment) {
      console.error('Payment not found for payment intent:', paymentIntent.id);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        metadata: {
          ...(payment.metadata as object || {}),
          paymentIntentStatus: paymentIntent.status,
          completedAt: new Date().toISOString(),
        },
      },
    });

    // Update booking payment status
    await prisma.booking.update({
      where: { id: payment.bookingId! },
      data: {
        isPaid: true,
        status: 'CONFIRMED', // Auto-confirm paid bookings
      },
    });

    console.log(`Payment succeeded for booking ${payment.bookingId}`);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  try {
    // Find payment by provider payment ID
    const payment = await prisma.payment.findFirst({
      where: {
        providerPaymentId: paymentIntent.id,
      },
    });

    if (!payment) {
      console.error('Payment not found for payment intent:', paymentIntent.id);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        metadata: {
          ...(payment.metadata as object || {}),
          paymentIntentStatus: paymentIntent.status,
          failedAt: new Date().toISOString(),
          failureReason: paymentIntent.last_payment_error?.message,
        },
      },
    });

    console.log(`Payment failed for booking ${payment.bookingId}`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}
