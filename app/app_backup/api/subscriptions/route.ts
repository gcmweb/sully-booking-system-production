
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from "../../../lib/auth";
import { getUserSubscription } from "../../../lib/subscription-utils";
import { getUserSubscriptionSummary } from "../../../lib/subscription";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔵 [SUBSCRIPTION-API] Starting subscription request');
    
    const user = await getUserFromToken(request);
    if (!user) {
      console.log('🔴 [SUBSCRIPTION-API] No user found, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔵 [SUBSCRIPTION-API] Getting subscription for user:', user.id);

    const subscriptionData = await getUserSubscription(user.id);
    console.log('🔵 [SUBSCRIPTION-API] Subscription data retrieved:', {
      plan: subscriptionData.plan,
      venuesCount: subscriptionData.venues.length,
      hasSubscription: !!subscriptionData.subscription
    });

    const summary = await getUserSubscriptionSummary(user.id);
    console.log('🔵 [SUBSCRIPTION-API] Subscription summary retrieved:', summary);

    const response = {
      subscription: subscriptionData.subscription,
      plan: subscriptionData.plan,
      venues: subscriptionData.venues,
      summary,
    };

    console.log('🟢 [SUBSCRIPTION-API] Returning successful response');
    return NextResponse.json(response);
  } catch (error) {
    console.error('🔴 [SUBSCRIPTION-API] Error:', error);
    console.error('🔴 [SUBSCRIPTION-API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to get subscription', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
