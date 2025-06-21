
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SubscriptionSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Fetch updated subscription data
    const fetchData = async () => {
      try {
        const response = await fetch('/api/subscriptions');
        if (response.ok) {
          const data = await response.json();
          setSubscriptionData(data);
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-green-600">
            Subscription Updated Successfully!
          </h1>
          <p className="text-muted-foreground mt-2">
            Thank you for upgrading your subscription. Your new features are now active.
          </p>
        </div>

        {subscriptionData && (
          <Card>
            <CardHeader>
              <CardTitle>Your New Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {subscriptionData.plan} Plan
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  You now have access to all {subscriptionData.plan.toLowerCase()} features
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold">Venues</div>
                  <div className="text-muted-foreground">
                    {subscriptionData.summary.venues.limit || 'Unlimited'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">Monthly Bookings</div>
                  <div className="text-muted-foreground">
                    {subscriptionData.summary.features.bookingsPerMonth || 'Unlimited'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <Link href="/dashboard">
            <Button className="w-full">
              <ArrowRight className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          
          <Link href="/dashboard/subscription">
            <Button variant="outline" className="w-full">
              Manage Subscription
            </Button>
          </Link>
        </div>

        {sessionId && (
          <p className="text-xs text-muted-foreground">
            Session ID: {sessionId}
          </p>
        )}
      </div>
    </div>
  );
}
