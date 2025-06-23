import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const sig = headersList.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string;
          const customerId = session.customer as string;
          const userId = session.metadata?.userId;

          if (userId) {
            // Get subscription details from Stripe
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0]?.price.id;

            // Determine plan type based on price ID
            let planType = 'FREE';
            if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
              planType = 'PREMIUM';
            } else if (priceId === process.env.STRIPE_PAID_PRICE_ID) {
              planType = 'PAID';
            }

            // Update user subscription
            await prisma.user.update({
              where: { id: userId },
              data: {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                subscriptionStatus: SubscriptionStatus.ACTIVE,
                planType: planType as any,
                subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
              },
            });
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          const priceId = subscription.items.data[0]?.price.id;
          
          // Determine plan type
          let planType = 'FREE';
          if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
            planType = 'PREMIUM';
          } else if (priceId === process.env.STRIPE_PAID_PRICE_ID) {
            planType = 'PAID';
          }

          // Determine status
          let status = SubscriptionStatus.ACTIVE;
          if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
            status = SubscriptionStatus.CANCELLED;
          } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
            status = SubscriptionStatus.PAST_DUE;
          }

          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: status,
              planType: planType as any,
              subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: SubscriptionStatus.CANCELLED,
              planType: 'FREE',
              subscriptionEndsAt: new Date(),
            },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user by customer ID
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: SubscriptionStatus.PAST_DUE,
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
