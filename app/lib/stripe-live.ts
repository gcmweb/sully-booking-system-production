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

// Rest of the file continues with all functions updated to use getStripeInstance()...

export { getStripeInstance as stripe };