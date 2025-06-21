
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from "../../../../lib/auth";
import { ensureStripeCustomer } from "../../../../lib/subscription-utils";
import { createCheckoutSession, STRIPE_PRICE_IDS, validateStripeConfig } from "../../../../lib/stripe-live";

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

    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, successUrl, cancelUrl } = await request.json();

    if (!plan || !['PAID', 'PREMIUM'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    const priceId = STRIPE_PRICE_IDS[plan as keyof typeof STRIPE_PRICE_IDS];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for this plan' },
        { status: 500 }
      );
    }

    // Ensure Stripe customer exists
    const stripeCustomerId = await ensureStripeCustomer(
      user.id,
      user.email,
      `${user.firstName} ${user.lastName}`
    );

    // Get app base URL
    const baseUrl = new URL(request.url).origin;
    const defaultSuccessUrl = `${baseUrl}/dashboard/subscription?success=true&plan=${plan}`;
    const defaultCancelUrl = `${baseUrl}/dashboard/subscription?canceled=true`;

    // Create checkout session
    const session = await createCheckoutSession(
      stripeCustomerId,
      priceId,
      successUrl || defaultSuccessUrl,
      cancelUrl || defaultCancelUrl,
      {
        userId: user.id,
        targetPlan: plan,
        userEmail: user.email,
      }
    );

    console.log(`✅ Checkout session created for user ${user.id}, plan: ${plan}`);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      plan,
      priceId,
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    
    // Return user-friendly error messages
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
