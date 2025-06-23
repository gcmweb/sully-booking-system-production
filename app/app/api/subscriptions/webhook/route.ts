
import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, validateStripeConfig } from "../../../../lib/stripe-live";
import { updateUserSubscriptionPlan, createUserSubscription } from "../../../../lib/subscription-utils";
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { prisma } from "../../../../lib/db";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe configuration before processing webhook
    const stripeConfig = validateStripeConfig();
    if (!stripeConfig.valid) {
      console.error('❌ Stripe configuration errors in webhook:', stripeConfig.errors);
      return NextResponse.json(
        { error: 'Payment system configuration error' },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ No Stripe signature provided');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    try {
      event = await constructWebhookEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Received webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
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
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: any) {
  try {
    const userId = session.metadata?.userId;
    const targetPlan = session.metadata?.targetPlan;

    if (!userId || !targetPlan) {
      console.error('Missing metadata in checkout session:', session.id);
      return;
    }

    console.log(`Checkout completed for user ${userId}, plan: ${targetPlan}`);

    // The subscription will be handled by the subscription.created event
    // This is just for logging and any immediate actions needed
  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

async function handleSubscriptionCreated(subscription: any) {
  try {
    const customerId = subscription.customer;
    
    // Find user by Stripe customer ID
    const existingSubscription = await prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
      include: { venue: { include: { owner: true } } },
    });

    if (!existingSubscription) {
      console.error('No subscription found for customer:', customerId);
      return;
    }

    const userId = existingSubscription.userId;
    const plan = getPlanFromPriceId(subscription.items.data[0].price.id);

    await updateUserSubscriptionPlan(userId, plan, subscription.id);

    console.log(`Subscription created for user ${userId}, plan: ${plan}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
    
    // Find subscription by Stripe subscription ID
    const existingSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      include: { },
    });

    if (!existingSubscription) {
      console.error('No subscription found for Stripe subscription:', subscription.id);
      return;
    }

    const userId = existingSubscription.userId;

    // Update subscription status based on Stripe status
    let status: SubscriptionStatus = SubscriptionStatus.ACTIVE;
    if (subscription.status === 'canceled') {
      status = SubscriptionStatus.CANCELED;
    } else if (subscription.status === 'past_due') {
      status = SubscriptionStatus.PAST_DUE;
    } else if (subscription.status === 'unpaid') {
      status = SubscriptionStatus.INACTIVE;
    }

    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        plan,
        status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
    });

    console.log(`Subscription updated for user ${userId}, plan: ${plan}, status: ${status}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    // Find subscription by Stripe subscription ID
    const existingSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      include: { },
    });

    if (!existingSubscription) {
      console.error('No subscription found for Stripe subscription:', subscription.id);
      return;
    }

    const userId = existingSubscription.userId;

    // Downgrade to FREE plan
    await updateUserSubscriptionPlan(userId, SubscriptionPlan.STARTER);

    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        status: SubscriptionStatus.CANCELED,
        stripeSubscriptionId: null,
      },
    });

    console.log(`Subscription deleted for user ${userId}, downgraded to FREE`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice: any) {
  try {
    const subscriptionId = invoice.subscription;
    
    if (!subscriptionId) {
      return; // Not a subscription payment
    }

    // Find subscription by Stripe subscription ID
    const existingSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!existingSubscription) {
      console.error('No subscription found for Stripe subscription:', subscriptionId);
      return;
    }

    // Reset monthly usage on successful payment
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        bookingsUsed: 0, // Reset monthly usage
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        subscriptionId: existingSubscription.id,
        amount: invoice.amount_paid / 100, // Convert from cents
        currency: invoice.currency.toUpperCase(),
        status: 'COMPLETED',
        provider: 'STRIPE',
        providerPaymentId: invoice.payment_intent,
        metadata: {
          invoiceId: invoice.id,
          subscriptionId: subscriptionId,
        },
      },
    });

    console.log(`Payment succeeded for subscription ${subscriptionId}`);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    const subscriptionId = invoice.subscription;
    
    if (!subscriptionId) {
      return; // Not a subscription payment
    }

    // Find subscription by Stripe subscription ID
    const existingSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!existingSubscription) {
      console.error('No subscription found for Stripe subscription:', subscriptionId);
      return;
    }

    // Update subscription status
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        status: SubscriptionStatus.PAST_DUE,
      },
    });

    // Create failed payment record
    await prisma.payment.create({
      data: {
        subscriptionId: existingSubscription.id,
        amount: invoice.amount_due / 100, // Convert from cents
        currency: invoice.currency.toUpperCase(),
        status: 'FAILED',
        provider: 'STRIPE',
        providerPaymentId: invoice.payment_intent,
        metadata: {
          invoiceId: invoice.id,
          subscriptionId: subscriptionId,
          failureReason: invoice.last_payment_error?.message,
        },
      },
    });

    console.log(`Payment failed for subscription ${subscriptionId}`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

function getPlanFromPriceId(priceId: string): SubscriptionPlan {
  const priceIdMap: Record<string, SubscriptionPlan> = {
    [process.env.STRIPE_PAID_PRICE_ID || 'price_paid_mock']: SubscriptionPlan.PROFESSIONAL,
    [process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_mock']: SubscriptionPlan.ENTERPRISE,
  };

  return priceIdMap[priceId] || SubscriptionPlan.STARTER;
}