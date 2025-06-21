'use client';

import { useEffect, useState } from 'react';
import { Crown, Calendar, CreditCard, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useAuth } from './auth-provider';
import Link from 'next/link';

interface SubscriptionInfo {
  status: string;
  planType: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

export function SubscriptionStatus() {
  const { user } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptionInfo();
    }
  }, [user]);

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch('/api/subscriptions/status');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!subscriptionInfo) return <Clock className="h-5 w-5 text-gray-400" />;
    
    switch (subscriptionInfo.status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'trialing':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'past_due':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'canceled':
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
      default:
        return <Crown className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    if (!subscriptionInfo) {
      return <Badge variant="outline">Free Plan</Badge>;
    }
    
    switch (subscriptionInfo.status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600">Active</Badge>;
      case 'trialing':
        return <Badge variant="outline" className="border-orange-500 text-orange-700">Trial</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Canceled</Badge>;
      default:
        return <Badge variant="outline">Inactive</Badge>;
    }
  };

  const getPlanName = () => {
    if (!subscriptionInfo?.planType) return 'Free Plan';
    
    switch (subscriptionInfo.planType) {
      case 'starter':
        return 'Starter Plan';
      case 'professional':
        return 'Professional Plan';
      case 'enterprise':
        return 'Enterprise Plan';
      default:
        return 'Unknown Plan';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusDescription = () => {
    if (!subscriptionInfo) {
      return 'You are currently on the free plan with limited features.';
    }
    
    switch (subscriptionInfo.status) {
      case 'active':
        if (subscriptionInfo.cancelAtPeriodEnd) {
          return `Your subscription will end on ${formatDate(subscriptionInfo.currentPeriodEnd)}.`;
        }
        return `Your subscription will renew on ${formatDate(subscriptionInfo.currentPeriodEnd)}.`;
      case 'trialing':
        return `Your free trial ends on ${formatDate(subscriptionInfo.trialEnd || subscriptionInfo.currentPeriodEnd)}.`;
      case 'past_due':
        return 'Your payment is overdue. Please update your payment method to continue service.';
      case 'canceled':
        return 'Your subscription has been canceled. You can reactivate it at any time.';
      default:
        return 'Your subscription status is unclear. Please contact support.';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Subscription Status</span>
          </div>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          {getStatusDescription()}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Current Plan</span>
            <span className="font-medium">{getPlanName()}</span>
          </div>
          
          {subscriptionInfo && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="font-medium capitalize">{subscriptionInfo.status}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {subscriptionInfo.status === 'trialing' ? 'Trial Ends' : 
                   subscriptionInfo.cancelAtPeriodEnd ? 'Ends' : 'Renews'}
                </span>
                <span className="font-medium">
                  {formatDate(subscriptionInfo.trialEnd || subscriptionInfo.currentPeriodEnd)}
                </span>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-6 flex gap-3">
          {!subscriptionInfo || subscriptionInfo.status === 'canceled' ? (
            <Link href="/dashboard/subscription">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
          ) : (
            <>
              {subscriptionInfo.status === 'past_due' && (
                <Link href="/dashboard/subscription">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Update Payment
                  </Button>
                </Link>
              )}
              
              <Link href="/dashboard/subscription">
                <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
              </Link>
            </>
          )}
        </div>
        
        {subscriptionInfo?.cancelAtPeriodEnd && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Your subscription is set to cancel at the end of the current period.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}