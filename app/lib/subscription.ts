
import { prisma } from './db';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export async function checkSubscriptionLimits(venueId: string): Promise<{
  canCreateBooking: boolean;
  bookingsUsed: number;
  bookingsLimit: number | null;
  plan: SubscriptionPlan;
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { venueId },
  });

  if (!subscription) {
    // Create free subscription if none exists
    const newSubscription = await prisma.subscription.create({
      data: {
        venueId,
        plan: SubscriptionPlan.STARTER,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        bookingsLimit: 50,
      },
    });

    return {
      canCreateBooking: true,
      bookingsUsed: 0,
      bookingsLimit: 50,
      plan: SubscriptionPlan.STARTER,
    };
  }

  const canCreateBooking = subscription.plan === SubscriptionPlan.PROFESSIONAL || 
    subscription.plan === SubscriptionPlan.ENTERPRISE ||
    (subscription.bookingsLimit !== null && subscription.bookingsUsed < subscription.bookingsLimit);

  return {
    canCreateBooking,
    bookingsUsed: subscription.bookingsUsed,
    bookingsLimit: subscription.bookingsLimit,
    plan: subscription.plan,
  };
}

export async function checkImageUploadPermissions(venueId: string): Promise<{
  canUploadLogo: boolean;
  canUploadHeader: boolean;
  canUploadGallery: boolean;
  maxGalleryImages: number;
  plan: SubscriptionPlan;
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { venueId },
  });

  const plan = subscription?.plan || SubscriptionPlan.STARTER;

  // Free tier: Logo + Header image only
  // Premium/Paid tier: Logo + Header + Gallery (up to 20 images)
  const permissions = {
    canUploadLogo: true, // All tiers can upload logo
    canUploadHeader: true, // All tiers can upload header
    canUploadGallery: plan === SubscriptionPlan.ENTERPRISE || plan === SubscriptionPlan.PROFESSIONAL,
    maxGalleryImages: plan === SubscriptionPlan.ENTERPRISE || plan === SubscriptionPlan.PROFESSIONAL ? 20 : 0,
    plan,
  };

  return permissions;
}

export async function incrementBookingUsage(venueId: string): Promise<void> {
  await prisma.subscription.update({
    where: { venueId },
    data: {
      bookingsUsed: {
        increment: 1,
      },
    },
  });
}

export async function resetMonthlyUsage(venueId: string): Promise<void> {
  await prisma.subscription.update({
    where: { venueId },
    data: {
      bookingsUsed: 0,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
}

// Subscription plan limits configuration
export const SUBSCRIPTION_LIMITS = {
  FREE: {
    venues: 1,
    bookingsPerMonth: 50,
    galleryImages: 0,
    analytics: true,
    widgets: true,
    customBranding: false,
    prioritySupport: false,
  },
  PAID: {
    venues: 5,
    bookingsPerMonth: null, // unlimited
    galleryImages: 20,
    analytics: true,
    widgets: true,
    customBranding: true,
    prioritySupport: false,
  },
  PREMIUM: {
    venues: null, // unlimited
    bookingsPerMonth: null, // unlimited
    galleryImages: 20,
    analytics: true,
    widgets: true,
    customBranding: true,
    prioritySupport: true,
  },
} as const;

export async function checkVenueCreationLimits(userId: string): Promise<{
  canCreateVenue: boolean;
  venuesUsed: number;
  venuesLimit: number | null;
  plan: SubscriptionPlan;
  message?: string;
}> {
  // Get user's venues count
  const venuesCount = await prisma.venue.count({
    where: { ownerId: userId },
  });

  // Get user's highest subscription plan across all venues
  const userVenues = await prisma.venue.findMany({
    where: { ownerId: userId },
    include: {
      subscription: true,
    },
  });

  // Determine the highest plan the user has
  let highestPlan: SubscriptionPlan = SubscriptionPlan.STARTER;
  for (const venue of userVenues) {
    if (venue.subscription) {
      if (venue.subscription.plan === SubscriptionPlan.ENTERPRISE) {
        highestPlan = SubscriptionPlan.ENTERPRISE;
        break;
      } else if (venue.subscription.plan === SubscriptionPlan.PROFESSIONAL && highestPlan === SubscriptionPlan.STARTER) {
        highestPlan = SubscriptionPlan.PROFESSIONAL;
      }
    }
  }

  const limits = SUBSCRIPTION_LIMITS[highestPlan];
  const canCreateVenue = limits.venues === null || venuesCount < limits.venues;

  let message;
  if (!canCreateVenue) {
    message = `You've reached the venue limit for your ${highestPlan} plan (${limits.venues} venue${limits.venues === 1 ? '' : 's'}). Upgrade to create more venues.`;
  }

  return {
    canCreateVenue,
    venuesUsed: venuesCount,
    venuesLimit: limits.venues,
    plan: highestPlan,
    message,
  };
}

export async function getUserSubscriptionSummary(userId: string): Promise<{
  plan: SubscriptionPlan;
  venues: {
    used: number;
    limit: number | null;
  };
  features: {
    bookingsPerMonth: number | null;
    galleryImages: number;
    analytics: boolean;
    widgets: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
  };
}> {
  const venueCheck = await checkVenueCreationLimits(userId);
  const limits = SUBSCRIPTION_LIMITS[venueCheck.plan];

  return {
    plan: venueCheck.plan,
    venues: {
      used: venueCheck.venuesUsed,
      limit: venueCheck.venuesLimit,
    },
    features: {
      bookingsPerMonth: limits.bookingsPerMonth,
      galleryImages: limits.galleryImages,
      analytics: limits.analytics,
      widgets: limits.widgets,
      customBranding: limits.customBranding,
      prioritySupport: limits.prioritySupport,
    },
  };
}
