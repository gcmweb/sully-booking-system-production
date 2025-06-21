// This file is kept for backward compatibility
// New live implementation is in stripe-live.ts

// Re-export everything from the enhanced live implementation
export {
  stripe,
  isLiveMode,
  isDemoMode,
  STRIPE_PRICE_IDS,
  SUBSCRIPTION_PRICING,
  createStripeCustomer,
  createSubscription,
  createCheckoutSession,
  createBillingPortalSession,
  createPaymentIntent,
  updateSubscription,
  cancelSubscription,
  retrieveSubscription,
  constructWebhookEvent,
  validateStripeConfig,
  getStripeConfig,
  formatCurrency,
} from './stripe-live';

// Legacy function for backward compatibility
export async function reactivateSubscription(subscriptionId: string) {
  const { updateSubscription } = await import('./stripe-live');
  return await updateSubscription(subscriptionId, 'reactivate');
}
