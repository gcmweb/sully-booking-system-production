
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from "../../../../lib/auth";
import { getUserSubscription, ensureStripeCustomer } from "../../../../lib/subscription-utils";
import { createBillingPortalSession } from "../../../../lib/stripe";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { returnUrl } = await request.json();
    const baseUrl = new URL(request.url).origin;
    const defaultReturnUrl = `${baseUrl}/dashboard/subscription`;

    const stripeCustomerId = await ensureStripeCustomer(
      user.id,
      user.email,
      `${user.firstName} ${user.lastName}`
    );

    const session = await createBillingPortalSession(
      stripeCustomerId,
      returnUrl || defaultReturnUrl
    );

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error('Billing portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
