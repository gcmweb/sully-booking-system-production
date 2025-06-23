'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Crown, Star, Zap, Check, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  planType: 'FREE' | 'PAID' | 'PREMIUM';
  subscriptionStatus: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | null;
  subscriptionEndsAt: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

interface SubscriptionData {
  user: User;
  limits: {
    venues: number;
    bookingsPerMonth: number;
    customization: boolean;
    analytics: boolean;
    support: string;
  };
  usage: {
    venues: number;
    bookingsThisMonth: number;
  };
}

const planFeatures = {
  FREE: {
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: Star,
    color: 'bg-gray-100 text-gray-800',
    features: [
      '1 venue',
      '50 bookings per month',
      'Basic customization',
      'Email support',
      'Standard analytics'
    ],
    limits: {
      venues: 1,
      bookingsPerMonth: 50,
      customization: false,
      analytics: false,
      support: 'Email'
    }
  },
  PAID: {
    name: 'Professional',
    price: '$29',
    period: 'per month',
    icon: Zap,
    color: 'bg-blue-100 text-blue-800',
    features: [
      '5 venues',
      '500 bookings per month',
      'Advanced customization',
      'Priority email support',
      'Advanced analytics',
      'Custom branding'
    ],
    limits: {
      venues: 5,
      bookingsPerMonth: 500,
      customization: true,
      analytics: true,
      support: 'Priority Email'
    }
  },
  PREMIUM: {
    name: 'Enterprise',
    price: '$99',
    period: 'per month',
    icon: Crown,
    color: 'bg-purple-100 text-purple-800',
    features: [
      'Unlimited venues',
      'Unlimited bookings',
      'Full customization',
      'Phone & email support',
      'Premium analytics',
      'White-label solution',
      'API access'
    ],
    limits: {
      venues: 999,
      bookingsPerMonth: 999999,
      customization: true,
      analytics: true,
      support: 'Phone & Email'
    }
  }
};

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [managingBilling, setManagingBilling] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchSubscriptionData();
    }
  }, [session]);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      } else {
        toast.error('Failed to load subscription data');
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planType: 'PAID' | 'PREMIUM') => {
    setUpgrading(planType);
    try {
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session');
    } finally {
      setUpgrading(null);
    }
  };

  const handleManageBilling = async () => {
    setManagingBilling(true);
    try {
      const response = await fetch('/api/subscriptions/billing-portal', {
        method: 'POST',
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to access billing portal');
      }
    } catch (error) {
      console.error('Error accessing billing portal:', error);
      toast.error('Failed to access billing portal');
    } finally {
      setManagingBilling(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'PAST_DUE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'ACTIVE':
        return <Check className="h-4 w-4" />;
      case 'CANCELLED':
        return <X className="h-4 w-4" />;
      case 'PAST_DUE':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load subscription data</p>
      </div>
    );
  }

  const { user, limits, usage } = subscriptionData;
  const currentPlan = planFeatures[user.planType];
  const Icon = currentPlan.icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-gray-600 mt-2">
          Manage your subscription and billing settings
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your current subscription details and usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={currentPlan.color}>
                {currentPlan.name}
              </Badge>
              {user.subscriptionStatus && (
                <Badge className={getStatusColor(user.subscriptionStatus)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(user.subscriptionStatus)}
                    {user.subscriptionStatus}
                  </div>
                </Badge>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{currentPlan.price}</div>
              <div className="text-sm text-gray-500">{currentPlan.period}</div>
            </div>
          </div>

          {user.subscriptionEndsAt && (
            <div className="text-sm text-gray-600">
              {user.subscriptionStatus === 'CANCELLED' ? 'Ends' : 'Renews'} on{' '}
              {new Date(user.subscriptionEndsAt).toLocaleDateString()}
            </div>
          )}

          <Separator />

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Venues</span>
                <span>{usage.venues} / {limits.venues === 999 ? '∞' : limits.venues}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: limits.venues === 999 ? '20%' : `${Math.min((usage.venues / limits.venues) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Bookings this month</span>
                <span>{usage.bookingsThisMonth} / {limits.bookingsPerMonth === 999999 ? '∞' : limits.bookingsPerMonth}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: limits.bookingsPerMonth === 999999 ? '20%' : `${Math.min((usage.bookingsThisMonth / limits.bookingsPerMonth) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {user.stripeCustomerId && (
            <div className="pt-4">
              <Button 
                variant="outline" 
                onClick={handleManageBilling}
                disabled={managingBilling}
              >
                {managingBilling && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Manage Billing
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {user.planType !== 'PREMIUM' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Upgrade Your Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(planFeatures).map(([planType, plan]) => {
              const PlanIcon = plan.icon;
              const isCurrentPlan = user.planType === planType;
              const canUpgrade = !isCurrentPlan && (
                (user.planType === 'FREE' && (planType === 'PAID' || planType === 'PREMIUM')) ||
                (user.planType === 'PAID' && planType === 'PREMIUM')
              );

              return (
                <Card key={planType} className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}>
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">
                        Current Plan
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                      <PlanIcon className="h-8 w-8 text-gray-600" />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">{plan.price}</div>
                    <div className="text-sm text-gray-500">{plan.period}</div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    {canUpgrade && (
                      <Button 
                        className="w-full" 
                        onClick={() => handleUpgrade(planType as 'PAID' | 'PREMIUM')}
                        disabled={upgrading === planType}
                      >
                        {upgrading === planType && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Upgrade to {plan.name}
                      </Button>
                    )}
                    
                    {isCurrentPlan && (
                      <Button className="w-full" variant="outline" disabled>
                        Current Plan
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Billing Alerts */}
      {user.subscriptionStatus === 'PAST_DUE' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your subscription payment is past due. Please update your payment method to continue using premium features.
          </AlertDescription>
        </Alert>
      )}

      {user.subscriptionStatus === 'CANCELLED' && user.subscriptionEndsAt && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your subscription has been cancelled and will end on {new Date(user.subscriptionEndsAt).toLocaleDateString()}. 
            You can reactivate it anytime before this date.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
