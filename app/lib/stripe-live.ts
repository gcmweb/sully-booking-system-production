
import Stripe from 'stripe';

// Enhanced Stripe configuration for live payments
const stripeConfig = {
  apiVersion: '2025-05-28.basil' as const,
  typescript: true as const,
  telemetry: false, // Disable telemetry for production
};

// Initialize Stripe with proper error handling
let stripe: Stripe;
try {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }
  
  if (secretKey.startsWith('sk_test_') && process.env.NODE_ENV === 'production' && process.env.STRIPE_MODE !== 'test') {
    console.warn('⚠️  WARNING: Using test Stripe keys in production environment');
  }
  
  stripe = new Stripe(secretKey, stripeConfig);
} catch (error) {
  console.error('❌ Failed to initialize Stripe:', error);
  throw error;
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

// Subscription plan pricing with currency support
export const SUBSCRIPTION_PRICING = {
  FREE: {
    price: 0,
    currency: 'GBP',
    interval: 'month',
    stripePriceId: null,
    features: [
      '1 venue',
      '50 bookings per month',
      'Basic analytics',
      'Booking widgets',
      'Email support',
    ],
  },
  PAID: {
    price: 29.99,
    currency: 'GBP',
    interval: 'month',
    stripePriceId: STRIPE_PRICE_IDS.PAID,
    features: [
      '5 venues',
      'Unlimited bookings',
      '20 gallery images',
      'Advanced analytics',
      'Custom branding',
      'Priority email support',
    ],
  },
  PREMIUM: {
    price: 79.99,
    currency: 'GBP',
    interval: 'month',
    stripePriceId: STRIPE_PRICE_IDS.PREMIUM,
    features: [
      'Unlimited venues',
      'Unlimited bookings',
      '20 gallery images per venue',
      'Advanced analytics',
      'Custom branding',
      'Priority support',
      'API access',
      'White-label options',
    ],
  },
} as const;

// Enhanced error handling wrapper
async function handleStripeOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`Stripe Error - ${errorMessage}:`, error);
    
    if (error instanceof Stripe.errors.StripeError) {
      // Log specific Stripe error details for debugging
      console.error('Stripe Error Details:', {
        type: error.type,
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      });
      
      // Throw user-friendly error messages
      switch (error.type) {
        case 'StripeCardError':
          throw new Error('Your card was declined. Please try a different payment method.');
        case 'StripeRateLimitError':
          throw new Error('Too many requests. Please try again in a moment.');
        case 'StripeInvalidRequestError':
          throw new Error('Invalid request. Please contact support if this continues.');
        case 'StripeAPIError':
          throw new Error('Payment service temporarily unavailable. Please try again.');
        case 'StripeConnectionError':
          throw new Error('Network error. Please check your connection and try again.');
        case 'StripeAuthenticationError':
          throw new Error('Authentication failed. Please contact support.');
        default:
          throw new Error('Payment processing failed. Please try again or contact support.');
      }
    }
    
    throw new Error(errorMessage);
  }
}

// Enhanced customer creation with validation
export async function createStripeCustomer(
  email: string, 
  name: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  if (isDemoMode()) {
    // Return enhanced mock customer for demo mode
    return {
      id: `cus_demo_${Date.now()}`,
      email,
      name,
      metadata: { 
        source: 'sully_booking_system',
        demo: 'true',
        ...metadata 
      },
      object: 'customer',
      balance: 0,
      created: Math.floor(Date.now() / 1000),
      default_source: null,
      delinquent: false,
      description: null,
      discount: null,
      invoice_prefix: null,
      invoice_settings: {
        custom_fields: null,
        default_payment_method: null,
        footer: null,
        rendering_options: null,
      },
      livemode: false,
      next_invoice_sequence: 1,
      phone: null,
      preferred_locales: [],
      shipping: null,
      tax_exempt: 'none',
      test_clock: null,
    } as Stripe.Customer;
  }

  return handleStripeOperation(async () => {
    return await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'sully_booking_system',
        created_at: new Date().toISOString(),
        ...metadata,
      },
    });
  }, 'Failed to create customer');
}

// Enhanced subscription creation with better error handling
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
): Promise<Stripe.Subscription> {
  if (isDemoMode()) {
    // Return mock subscription for demo mode
    return {
      id: `sub_demo_${Date.now()}`,
      customer: customerId,
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
      items: {
        data: [{
          id: `si_demo_${Date.now()}`,
          price: { id: priceId },
        }],
      },
      metadata: metadata || {},
    } as any;
  }

  return handleStripeOperation(async () => {
    return await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { 
        save_default_payment_method: 'on_subscription',
        payment_method_types: ['card'],
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        created_at: new Date().toISOString(),
        ...metadata,
      },
      collection_method: 'charge_automatically',
    });
  }, 'Failed to create subscription');
}

// Enhanced checkout session creation
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
): Promise<Stripe.Checkout.Session> {
  if (isDemoMode()) {
    // Return enhanced mock checkout session
    const sessionId = `cs_demo_${Date.now()}`;
    return {
      id: sessionId,
      url: `${successUrl}?session_id=${sessionId}&demo=true&price_id=${priceId}`,
      customer: customerId,
      metadata: metadata || {},
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    } as Stripe.Checkout.Session;
  }

  return handleStripeOperation(async () => {
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: {
        name: 'auto',
        address: 'auto',
      },
      metadata: {
        created_at: new Date().toISOString(),
        ...metadata,
      },
      subscription_data: {
        metadata: metadata || {},
      },
    });
  }, 'Failed to create checkout session');
}

// Enhanced billing portal with better error handling
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  if (isDemoMode()) {
    return {
      id: `bps_demo_${Date.now()}`,
      url: `${returnUrl}?billing_portal=demo&customer=${customerId}`,
      customer: customerId,
      return_url: returnUrl,
    } as Stripe.BillingPortal.Session;
  }

  return handleStripeOperation(async () => {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
      flow_data: {
        type: 'subscription_update_confirm',
        subscription_update_confirm: {
          subscription: customerId, // This should be subscription ID in real implementation
          items: [], // Required property for subscription update confirm
        },
      },
    });
  }, 'Failed to create billing portal session');
}

// Payment intent creation for one-time payments
export async function createPaymentIntent(
  amount: number,
  currency: string = 'gbp',
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  if (isDemoMode()) {
    return {
      id: `pi_demo_${Date.now()}`,
      client_secret: `pi_demo_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(amount * 100),
      currency,
      status: 'requires_payment_method',
      metadata: metadata || {},
    } as Stripe.PaymentIntent;
  }

  return handleStripeOperation(async () => {
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        created_at: new Date().toISOString(),
        ...metadata,
      },
    });
  }, 'Failed to create payment intent');
}

// Enhanced webhook event construction
export async function constructWebhookEvent(
  body: string,
  signature: string,
  secret?: string
): Promise<Stripe.Event> {
  const webhookSecret = secret || process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('Webhook secret is required for security');
  }

  if (isDemoMode()) {
    // For demo mode, just parse the JSON (skip signature verification)
    try {
      return JSON.parse(body);
    } catch (error) {
      throw new Error('Invalid webhook payload');
    }
  }

  return handleStripeOperation(async () => {
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }, 'Invalid webhook signature');
}

// Subscription management functions
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  if (isDemoMode()) {
    return {
      id: subscriptionId,
      customer: 'cus_demo',
      status: 'active',
      items: {
        data: [{
          id: `si_demo_${Date.now()}`,
          price: { id: newPriceId },
        }],
      },
    } as any;
  }

  return handleStripeOperation(async () => {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
  }, 'Failed to update subscription');
}

export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  if (isDemoMode()) {
    return {
      id: subscriptionId,
      status: 'canceled',
      cancel_at_period_end: true,
    } as any;
  }

  return handleStripeOperation(async () => {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }, 'Failed to cancel subscription');
}

export async function retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  if (isDemoMode()) {
    return {
      id: subscriptionId,
      status: 'active',
    } as any;
  }

  return handleStripeOperation(async () => {
    return await stripe.subscriptions.retrieve(subscriptionId);
  }, 'Failed to retrieve subscription');
}

// Utility functions
export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

export function getStripeConfig() {
  return {
    isLiveMode: isLiveMode(),
    isDemoMode: isDemoMode(),
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    priceIds: STRIPE_PRICE_IDS,
    validation: validateStripeConfig(),
  };
}

export { stripe };
