
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from "../../../../lib/auth";
import { getUserSubscription, cancelUserSubscription } from "../../../../lib/subscription-utils";
import { cancelSubscription } from "../../../../lib/stripe";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription } = await getUserSubscription(user.id);
    
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Cancel Stripe subscription if it exists
    if (subscription.stripeSubscriptionId) {
      try {
        await cancelSubscription(subscription.stripeSubscriptionId);
      } catch (error) {
        console.error('Error canceling Stripe subscription:', error);
        // Continue with local cancellation even if Stripe fails
      }
    }

    // Cancel local subscription
    const canceledSubscription = await cancelUserSubscription(user.id);

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully',
      subscription: canceledSubscription,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
