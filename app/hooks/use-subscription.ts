
'use client';

import { useState, useEffect } from 'react';
import { SubscriptionPlan } from '@prisma/client';
import { useAuth } from "../components/auth-provider";

interface SubscriptionData {
  subscription: any;
  plan: SubscriptionPlan;
  venues: any[];
  summary: any;
}

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/subscriptions');
      
      if (response.status === 401) {
        // User is not authenticated, this is expected behavior
        // Don't set this as an error, just return null data
        setData(null);
        setError(null);
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch subscription data');
      }
      
      const subscriptionData = await response.json();
      setData(subscriptionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch subscription data if user is authenticated and auth is not loading
    if (!authLoading && user) {
      fetchSubscription();
    } else if (!authLoading && !user) {
      // User is not authenticated, clear data and stop loading
      setData(null);
      setError(null);
      setLoading(false);
    }
  }, [user, authLoading]);

  const refetch = () => {
    fetchSubscription();
  };

  return {
    data,
    loading: loading || authLoading,
    error,
    refetch,
  };
}
