
// Netlify Function for Stripe Webhooks
// Handles Stripe webhook events for subscription and payment processing

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');

let prisma;

const initPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
};

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event, context) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  
  if (!sig) {
    console.error('No Stripe signature found');
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'No Stripe signature' }),
    };
  }

  let stripeEvent;

  try {
    // Verify webhook signature
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
  }

  console.log('Received Stripe event:', stripeEvent.type);

  try {
    const db = initPrisma();

    // Handle different event types
    switch (stripeEvent.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object, db);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object, db);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object, db);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object, db);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object, db);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(stripeEvent.data.object, db);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Webhook handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Webhook handler failed' }),
    };
  }
};

// Handle subscription creation
async function handleSubscriptionCreated(subscription, db) {
  console.log('Processing subscription created:', subscription.id);

  try {
    // Find venue by customer ID
    const existingSubscription = await db.subscription.findFirst({
      where: {
        stripeCustomerId: subscription.customer,
      },
      include: {
        venue: true,
      },
    });

    if (!existingSubscription) {
      console.error('No venue found for customer:', subscription.customer);
      return;
    }

    // Determine subscription plan based on price ID
    let plan = 'FREE';
    if (subscription.items.data[0]?.price?.id === process.env.STRIPE_PAID_PRICE_ID) {
      plan = 'PAID';
    } else if (subscription.items.data[0]?.price?.id === process.env.STRIPE_PREMIUM_PRICE_ID) {
      plan = 'PREMIUM';
    }

    // Update subscription
    await db.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        plan,
        status: subscription.status.toUpperCase(),
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        bookingsLimit: plan === 'PAID' ? 1000 : plan === 'PREMIUM' ? 10000 : 100,
      },
    });

    console.log('Subscription created successfully for venue:', existingSubscription.venueId);
  } catch (error) {
    console.error('Error handling subscription created:', error);
    throw error;
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription, db) {
  console.log('Processing subscription updated:', subscription.id);

  try {
    const existingSubscription = await db.subscription.findFirst({
      where: {
        stripeSubscriptionId: subscription.id,
      },
    });

    if (!existingSubscription) {
      console.error('Subscription not found:', subscription.id);
      return;
    }

    // Determine subscription plan
    let plan = 'FREE';
    if (subscription.items.data[0]?.price?.id === process.env.STRIPE_PAID_PRICE_ID) {
      plan = 'PAID';
    } else if (subscription.items.data[0]?.price?.id === process.env.STRIPE_PREMIUM_PRICE_ID) {
      plan = 'PREMIUM';
    }

    // Update subscription
    await db.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        plan,
        status: subscription.status.toUpperCase(),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        bookingsLimit: plan === 'PAID' ? 1000 : plan === 'PREMIUM' ? 10000 : 100,
      },
    });

    console.log('Subscription updated successfully:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}

// Handle subscription deletion/cancellation
async function handleSubscriptionDeleted(subscription, db) {
  console.log('Processing subscription deleted:', subscription.id);

  try {
    const existingSubscription = await db.subscription.findFirst({
      where: {
        stripeSubscriptionId: subscription.id,
      },
    });

    if (!existingSubscription) {
      console.error('Subscription not found:', subscription.id);
      return;
    }

    // Update subscription to cancelled
    await db.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        plan: 'FREE',
        status: 'CANCELLED',
        bookingsLimit: 100, // Free tier limit
      },
    });

    console.log('Subscription cancelled successfully:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice, db) {
  console.log('Processing payment succeeded:', invoice.id);

  try {
    // Record payment in database
    const subscription = await db.subscription.findFirst({
      where: {
        stripeSubscriptionId: invoice.subscription,
      },
    });

    if (subscription) {
      await db.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: invoice.amount_paid / 100, // Convert from cents
          currency: invoice.currency.toUpperCase(),
          status: 'COMPLETED',
          provider: 'STRIPE',
          providerPaymentId: invoice.payment_intent,
          metadata: {
            invoiceId: invoice.id,
            customerId: invoice.customer,
          },
        },
      });

      console.log('Payment recorded successfully:', invoice.id);
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
    throw error;
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice, db) {
  console.log('Processing payment failed:', invoice.id);

  try {
    // Update subscription status if needed
    const subscription = await db.subscription.findFirst({
      where: {
        stripeSubscriptionId: invoice.subscription,
      },
    });

    if (subscription) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'PAST_DUE',
        },
      });

      // Record failed payment
      await db.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: invoice.amount_due / 100,
          currency: invoice.currency.toUpperCase(),
          status: 'FAILED',
          provider: 'STRIPE',
          providerPaymentId: invoice.payment_intent,
          metadata: {
            invoiceId: invoice.id,
            customerId: invoice.customer,
            failureReason: 'Payment failed',
          },
        },
      });

      console.log('Failed payment recorded:', invoice.id);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
}

// Handle trial ending soon
async function handleTrialWillEnd(subscription, db) {
  console.log('Processing trial will end:', subscription.id);

  try {
    // You could send notification emails here
    // For now, just log the event
    console.log('Trial ending for subscription:', subscription.id);
  } catch (error) {
    console.error('Error handling trial will end:', error);
    throw error;
  }
}
