
'use client';

import { useState, useEffect } from 'react';

interface SubscriptionBannerProps {
  plan: any;
  venuesUsed: any;
  venuesLimit: any;
  showUpgradeButton?: boolean;
}

interface PricingPlansProps {
  currentPlan: any;
  onUpgrade: (plan: any) => Promise<void>;
  loading: boolean;
}

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Separator } from "../../../components/ui/separator";
import { PricingPlans } from "../../../components/pricing-plans";
import { SubscriptionStatus } from "../../../components/subscription-status";
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Loader2,
  Settings
} from 'lucide-react';
import { SubscriptionPlan, SubscriptionStatus as Status } from '@prisma/client';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

interface SubscriptionData {
  subscription: any;
  plan: SubscriptionPlan;
  venues: any[];
  summary: any;
}

export default function SubscriptionPage() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchSubscriptionData();
    
    // Handle success/cancel from Stripe checkout
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      toast.success('Subscription updated successfully!');
    } else if (canceled === 'true') {
      toast.error('Subscription update was canceled.');
    }
  }, [searchParams]);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscriptions');
      if (!response.ok) throw new Error('Failed to fetch subscription data');
      
      const data = await response.json();
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (!subscriptionData) return;
    
    setActionLoading(true);
    try {
      const response = await fetch('/api/subscriptions/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan,
          returnUrl: window.location.href 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upgrade subscription');
      }

      if (data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else if (data.success) {
        // Subscription updated directly
        toast.success('Subscription updated successfully!');
        fetchSubscriptionData();
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upgrade subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!subscriptionData?.subscription) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.'
    );
    
    if (!confirmed) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      toast.success('Subscription canceled successfully');
      fetchSubscriptionData();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBillingPortal = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/subscriptions/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          returnUrl: window.location.href 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to open billing portal');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load subscription data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { subscription, plan, summary } = subscriptionData;
  const hasActiveSubscription = subscription && subscription.status === 'ACTIVE';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription plan and billing settings
          </p>
        </div>

        {/* Current Status */}
        <div className="grid md:grid-cols-2 gap-6">
          <SubscriptionStatus
            plan={plan}
            venuesUsed={summary.venues.used}
            venuesLimit={summary.venues.limit}
            showUpgradeButton={false}
          />

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasActiveSubscription ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  
                  {subscription.currentPeriodEnd && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Next billing</span>
                      <span className="text-sm font-medium">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <Button
                      onClick={handleBillingPortal}
                      disabled={actionLoading}
                      variant="outline"
                      className="w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Billing
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>

                    {plan !== SubscriptionPlan.STARTER && (
                      <Button
                        onClick={handleCancel}
                        disabled={actionLoading}
                        variant="destructive"
                        className="w-full"
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    No active subscription. Upgrade to unlock premium features.
                  </p>
                  <Badge variant="outline">
                    Free Plan
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usage Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {summary.venues.used}
                </div>
                <div className="text-sm text-muted-foreground">
                  Venues Created
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Limit: {summary.venues.limit || 'Unlimited'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {summary.features.bookingsPerMonth || '∞'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Monthly Bookings
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {summary.features.bookingsPerMonth ? 'Per month' : 'Unlimited'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {summary.features.galleryImages}
                </div>
                <div className="text-sm text-muted-foreground">
                  Gallery Images
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Per venue
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
          <PricingPlans
            currentPlan={plan}
            onUpgrade={handleUpgrade}
            loading={actionLoading}
          />
        </div>

        {/* Features Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Feature</th>
                    <th className="text-center py-2">Free</th>
                    <th className="text-center py-2">Professional</th>
                    <th className="text-center py-2">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b">
                    <td className="py-2">Venues</td>
                    <td className="text-center py-2">1</td>
                    <td className="text-center py-2">5</td>
                    <td className="text-center py-2">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Monthly Bookings</td>
                    <td className="text-center py-2">50</td>
                    <td className="text-center py-2">Unlimited</td>
                    <td className="text-center py-2">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Gallery Images</td>
                    <td className="text-center py-2">0</td>
                    <td className="text-center py-2">20 per venue</td>
                    <td className="text-center py-2">20 per venue</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Analytics</td>
                    <td className="text-center py-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center py-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center py-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Custom Branding</td>
                    <td className="text-center py-2">
                      <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                    </td>
                    <td className="text-center py-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center py-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Priority Support</td>
                    <td className="text-center py-2">
                      <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                    </td>
                    <td className="text-center py-2">
                      <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                    </td>
                    <td className="text-center py-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
