
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from "../../../../lib/auth";
import { SubscriptionPlan } from '@prisma/client';
import { 
  ensureStripeCustomer, 
  getUserSubscription, 
  updateUserSubscriptionPlan 
} from "../../../../lib/subscription-utils";
import { 
  createCheckoutSession, 
  updateSubscription, 
  STRIPE_PRICE_IDS 
} from "../../../../lib/stripe";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, returnUrl } = await request.json();

    if (!plan || !Object.values(SubscriptionPlan).includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (plan === SubscriptionPlan.STARTER) {
      return NextResponse.json({ error: 'Cannot upgrade to FREE plan' }, { status: 400 });
    }

    const { subscription } = await getUserSubscription(user.id);
    const stripeCustomerId = await ensureStripeCustomer(
      user.id, 
      user.email, 
      `${user.firstName} ${user.lastName}`
    );

    const priceId = STRIPE_PRICE_IDS[plan as keyof typeof STRIPE_PRICE_IDS];
    
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid subscription plan' }, { status: 400 });
    }

    const baseUrl = new URL(request.url).origin;
    const successUrl = returnUrl || `${baseUrl}/dashboard/subscription?success=true`;
    const cancelUrl = returnUrl || `${baseUrl}/dashboard/subscription?canceled=true`;

    // If user already has a Stripe subscription, update it
    if (subscription?.stripeSubscriptionId) {
      try {
        const updatedSubscription = await updateSubscription(
          subscription.stripeSubscriptionId,
          priceId
        );

        // Update local subscription
        await updateUserSubscriptionPlan(user.id, plan, updatedSubscription.id);

        return NextResponse.json({
          success: true,
          message: 'Subscription updated successfully',
          subscription: updatedSubscription,
        });
      } catch (error) {
        console.error('Error updating existing subscription:', error);
        // Fall back to creating new checkout session
      }
    }

    // Create new checkout session
    const checkoutSession = await createCheckoutSession(
      stripeCustomerId,
      priceId,
      successUrl,
      cancelUrl,
      {
        userId: user.id,
        targetPlan: plan,
      }
    );

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    );
  }
}
