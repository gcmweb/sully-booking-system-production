
import { NextRequest, NextResponse } from 'next/server';
import { getStripeConfig } from "../../../../lib/stripe-live";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const config = getStripeConfig();
    
    // Only return safe, public configuration
    return NextResponse.json({
      publishableKey: config.publishableKey,
      isLiveMode: config.isLiveMode,
      isDemoMode: config.isDemoMode,
      priceIds: config.priceIds,
      configValid: config.validation.valid,
      // Don't expose specific validation errors to client for security
      hasConfigErrors: config.validation.errors.length > 0,
    });
  } catch (error) {
    console.error('Stripe config error:', error);
    return NextResponse.json(
      { error: 'Failed to get Stripe configuration' },
      { status: 500 }
    );
  }
}
