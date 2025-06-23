import Stripe from 'stripe';

// Enhanced Stripe configuration for live payments
const stripeConfig = {
  apiVersion: '2025-05-28.basil' as const,
  typescript: true as const,
  telemetry: false, // Disable telemetry for production
};

// Lazy Stripe initialization to avoid build-time errors
let stripe: Stripe | null = null;

function getStripeInstance(): Stripe {
  if (stripe) {
    return stripe;
  }
  
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }
  
  if (secretKey.startsWith('sk_test_') && process.env.NODE_ENV === 'production' && process.env.STRIPE_MODE !== 'test') {
    console.warn('⚠️  WARNING: Using test Stripe keys in production environment');
  }
  
  try {
    stripe = new Stripe(secretKey, stripeConfig);
    return stripe;
  } catch (error) {
    console.error('❌ Failed to initialize Stripe:', error);
    throw error;
  }
}

// Determine if we're in demo/test mode
export const isLiveMode = (): boolean => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const stripeMode = process.env.STRIPE_MODE;
  
  // Explicit mode setting takes precedence
  if (stripeMode === 'live') return true;
  if (stripeMode === 'test') return false;
  
  // Auto-detect based on key prefix
  return secretKey?.startsWith('sk_live_') || false;
};

export const isDemoMode = (): boolean => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return !secretKey || 
         secretKey === 'sk_test_mock_key' || 
         secretKey === 'sk_test_mock_key_for_demo' ||
         secretKey.includes('mock');
};

// Environment validation
export const validateStripeConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!process.env.STRIPE_SECRET_KEY) {
    errors.push('STRIPE_SECRET_KEY is required');
  }
  
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    errors.push('STRIPE_PUBLISHABLE_KEY is required');
  }
  
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    errors.push('STRIPE_WEBHOOK_SECRET is required for webhook security');
  }
  
  if (!isLiveMode() && !isDemoMode()) {
    if (!process.env.STRIPE_PAID_PRICE_ID) {
      errors.push('STRIPE_PAID_PRICE_ID is required');
    }
    if (!process.env.STRIPE_PREMIUM_PRICE_ID) {
      errors.push('STRIPE_PREMIUM_PRICE_ID is required');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Enhanced price configuration with validation
export const STRIPE_PRICE_IDS = {
  PAID: process.env.STRIPE_PAID_PRICE_ID || (isDemoMode() ? 'price_paid_mock' : undefined),
  PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID || (isDemoMode() ? 'price_premium_mock' : undefined),
} as const;

// Subscription pricing configuration
export const SUBSCRIPTION_PRICING = {
  PAID: {
    name: 'Paid Plan',
    price: 29.99,
    currency: 'usd',
    interval: 'month',
    features: ['Basic features', 'Email support', 'Up to 100 bookings/month']
  },
  PREMIUM: {
    name: 'Premium Plan', 
    price: 99.99,
    currency: 'usd',
    interval: 'month',
    features: ['All features', 'Priority support', 'Unlimited bookings', 'Advanced analytics']
  }
} as const;

// Create Stripe customer
export async function createStripeCustomer(email: string, name?: string): Promise<Stripe.Customer> {
  const stripeInstance = getStripeInstance();
  
  return await stripeInstance.customers.create({
    email,
    name,
  });
}

// Create subscription
export async function createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
  const stripeInstance = getStripeInstance();
  
  return await stripeInstance.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
}

// Create checkout session
export async function createCheckoutSession(priceId: string, customerId?: string, successUrl?: string, cancelUrl?: string): Promise<Stripe.Checkout.Session> {
  const stripeInstance = getStripeInstance();
  
  return await stripeInstance.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer: customerId,
    success_url: successUrl || `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL}/pricing`,
  });
}

// Create billing portal session
export async function createBillingPortalSession(customerId: string, returnUrl?: string): Promise<Stripe.BillingPortal.Session> {
  const stripeInstance = getStripeInstance();
  
  return await stripeInstance.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || process.env.NEXTAUTH_URL,
  });
}

// Create payment intent
export async function createPaymentIntent(amount: number, currency: string = 'usd', customerId?: string): Promise<Stripe.PaymentIntent> {
  const stripeInstance = getStripeInstance();
  
  return await stripeInstance.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    customer: customerId,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

// Update subscription
export async function updateSubscription(subscriptionId: string, action: 'pause' | 'resume' | 'cancel' | 'reactivate'): Promise<Stripe.Subscription> {
  const stripeInstance = getStripeInstance();
  
  switch (action) {
    case 'pause':
      return await stripeInstance.subscriptions.update(subscriptionId, {
        pause_collection: {
          behavior: 'mark_uncollectible',
        },
      });
    case 'resume':
      return await stripeInstance.subscriptions.update(subscriptionId, {
        pause_collection: null,
      });
    case 'cancel':
      return await stripeInstance.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    case 'reactivate':
      return await stripeInstance.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<Stripe.Subscription> {
  const stripeInstance = getStripeInstance();
  
  if (immediately) {
    return await stripeInstance.subscriptions.cancel(subscriptionId);
  } else {
    return await stripeInstance.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

// Retrieve subscription
export async function retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const stripeInstance = getStripeInstance();
  
  return await stripeInstance.subscriptions.retrieve(subscriptionId);
}

// Construct webhook event
export function constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
  const stripeInstance = getStripeInstance();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is required');
  }
  
  return stripeInstance.webhooks.constructEvent(payload, signature, webhookSecret);
}

// Get Stripe configuration
export function getStripeConfig() {
  return {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    isLiveMode: isLiveMode(),
    isDemoMode: isDemoMode(),
    priceIds: STRIPE_PRICE_IDS,
  };
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

export { getStripeInstance as stripe };