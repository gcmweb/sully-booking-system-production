
import { prisma } from './db';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { createStripeCustomer } from './stripe';

export async function getUserSubscription(userId: string) {
  try {
    // Get user's venues with subscriptions
    const userVenues = await prisma.venue.findMany({
      where: { ownerId: userId },
      include: {
        subscription: true,
      },
    });

    // Find the highest tier subscription
    let highestSubscription = null;
    let highestPlan: SubscriptionPlan = SubscriptionPlan.FREE;

    for (const venue of userVenues) {
      if (venue.subscription) {
        if (venue.subscription.plan === SubscriptionPlan.PREMIUM) {
          highestSubscription = venue.subscription;
          highestPlan = SubscriptionPlan.PREMIUM;
          break;
        } else if (venue.subscription.plan === SubscriptionPlan.PAID && highestPlan === SubscriptionPlan.FREE) {
          highestSubscription = venue.subscription;
          highestPlan = SubscriptionPlan.PAID;
        }
      }
    }

    return {
      subscription: highestSubscription,
      plan: highestPlan,
      venues: userVenues,
    };
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    throw error;
  }
}

export async function createUserSubscription(
  userId: string,
  plan: SubscriptionPlan,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
) {
  // Get user's first venue or create a default one for subscription tracking
  let venue = await prisma.venue.findFirst({
    where: { ownerId: userId },
  });

  if (!venue) {
    // Create a default venue for subscription tracking
    venue = await prisma.venue.create({
      data: {
        name: 'Default Venue',
        slug: `default-${userId}`,
        address: 'TBD',
        city: 'TBD',
        postcode: 'TBD',
        phone: 'TBD',
        email: 'TBD',
        venueType: 'RESTAURANT',
        ownerId: userId,
        isActive: false, // Mark as inactive until properly configured
      },
    });
  }

  // Create or update subscription
  const subscription = await prisma.subscription.upsert({
    where: { venueId: venue.id },
    update: {
      plan,
      status: SubscriptionStatus.ACTIVE,
      stripeCustomerId,
      stripeSubscriptionId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    create: {
      venueId: venue.id,
      plan,
      status: SubscriptionStatus.ACTIVE,
      stripeCustomerId,
      stripeSubscriptionId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      bookingsLimit: plan === SubscriptionPlan.FREE ? 50 : null,
    },
  });

  return subscription;
}

export async function updateUserSubscriptionPlan(
  userId: string,
  newPlan: SubscriptionPlan,
  stripeSubscriptionId?: string
) {
  const { subscription } = await getUserSubscription(userId);
  
  if (!subscription) {
    throw new Error('No subscription found for user');
  }

  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      plan: newPlan,
      stripeSubscriptionId: stripeSubscriptionId || subscription.stripeSubscriptionId,
      bookingsLimit: newPlan === SubscriptionPlan.FREE ? 50 : null,
      updatedAt: new Date(),
    },
  });

  return updatedSubscription;
}

export async function cancelUserSubscription(userId: string) {
  const { subscription } = await getUserSubscription(userId);
  
  if (!subscription) {
    throw new Error('No subscription found for user');
  }

  const canceledSubscription = await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: SubscriptionStatus.CANCELLED,
      updatedAt: new Date(),
    },
  });

  return canceledSubscription;
}

export async function ensureStripeCustomer(userId: string, email: string, name: string) {
  const { subscription } = await getUserSubscription(userId);
  
  if (subscription?.stripeCustomerId) {
    return subscription.stripeCustomerId;
  }

  // Create Stripe customer
  const customer = await createStripeCustomer(email, name);
  
  // Update subscription with customer ID
  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { stripeCustomerId: customer.id },
    });
  }

  return customer.id;
}

export function getSubscriptionFeatures(plan: SubscriptionPlan) {
  const features = {
    FREE: [
      '1 venue',
      '50 bookings per month',
      'Basic analytics',
      'Booking widgets',
      'Email support',
    ],
    PAID: [
      '5 venues',
      'Unlimited bookings',
      '20 gallery images',
      'Advanced analytics',
      'Custom branding',
      'Priority email support',
    ],
    PREMIUM: [
      'Unlimited venues',
      'Unlimited bookings',
      '20 gallery images per venue',
      'Advanced analytics',
      'Custom branding',
      'Priority support',
      'API access',
      'White-label options',
    ],
  };

  return features[plan] || features.FREE;
}

export function getSubscriptionBenefits(currentPlan: SubscriptionPlan, targetPlan: SubscriptionPlan) {
  const allFeatures = {
    venues: {
      FREE: 1,
      PAID: 5,
      PREMIUM: 'Unlimited',
    },
    bookings: {
      FREE: '50/month',
      PAID: 'Unlimited',
      PREMIUM: 'Unlimited',
    },
    images: {
      FREE: '0',
      PAID: '20 per venue',
      PREMIUM: '20 per venue',
    },
    support: {
      FREE: 'Email',
      PAID: 'Priority Email',
      PREMIUM: 'Priority + Phone',
    },
  };

  const benefits = [];
  
  if (targetPlan !== currentPlan) {
    benefits.push(`Upgrade from ${currentPlan} to ${targetPlan}`);
    
    Object.entries(allFeatures).forEach(([feature, values]) => {
      const currentValue = values[currentPlan];
      const targetValue = values[targetPlan];
      
      if (currentValue !== targetValue) {
        benefits.push(`${feature}: ${currentValue} → ${targetValue}`);
      }
    });
  }

  return benefits;
}
