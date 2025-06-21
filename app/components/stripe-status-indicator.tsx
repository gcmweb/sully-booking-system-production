'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useAuth } from './auth-provider';

interface StripeStatus {
  connected: boolean;
  accountId?: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requiresAction: boolean;
  actionUrl?: string;
  errors?: string[];
}

export function StripeStatusIndicator() {
  const { user } = useAuth();
  const [status, setStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStripeStatus();
    }
  }, [user]);

  const fetchStripeStatus = async () => {
    try {
      const response = await fetch('/api/stripe/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch Stripe status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (error) {
      console.error('Failed to connect Stripe:', error);
    } finally {
      setConnecting(false);
    }
  };

  const getStatusIcon = () => {
    if (loading) {
      return <Loader2 className="h-5 w-5 animate-spin text-gray-400" />;
    }
    
    if (!status?.connected) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    
    if (status.requiresAction) {
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    }
    
    if (status.chargesEnabled && status.payoutsEnabled) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    return <AlertCircle className="h-5 w-5 text-orange-500" />;
  };

  const getStatusText = () => {
    if (loading) return 'Checking status...';
    
    if (!status?.connected) {
      return 'Not connected';
    }
    
    if (status.requiresAction) {
      return 'Action required';
    }
    
    if (status.chargesEnabled && status.payoutsEnabled) {
      return 'Fully activated';
    }
    
    return 'Setup in progress';
  };

  const getStatusDescription = () => {
    if (loading) return 'Verifying your Stripe account status...';
    
    if (!status?.connected) {
      return 'Connect your Stripe account to start accepting payments for your venue bookings.';
    }
    
    if (status.requiresAction) {
      return 'Your Stripe account requires additional information to complete setup.';
    }
    
    if (status.chargesEnabled && status.payoutsEnabled) {
      return 'Your Stripe account is fully set up and ready to process payments.';
    }
    
    return 'Your Stripe account is being reviewed. This usually takes a few minutes.';
  };

  const getStatusBadge = () => {
    if (loading) {
      return <Badge variant="outline">Checking...</Badge>;
    }
    
    if (!status?.connected) {
      return <Badge variant="destructive">Disconnected</Badge>;
    }
    
    if (status.requiresAction) {
      return <Badge variant="outline" className="border-orange-500 text-orange-700">Action Required</Badge>;
    }
    
    if (status.chargesEnabled && status.payoutsEnabled) {
      return <Badge variant="default" className="bg-green-600">Active</Badge>;
    }
    
    return <Badge variant="outline" className="border-orange-500 text-orange-700">Pending</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Payment Processing</span>
          </div>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          {getStatusDescription()}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {status?.errors && status.errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-2">Issues to resolve:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {status.errors.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="space-y-3">
          {status?.connected && (
            <>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Accept Payments</span>
                <div className="flex items-center space-x-2">
                  {status.chargesEnabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {status.chargesEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Receive Payouts</span>
                <div className="flex items-center space-x-2">
                  {status.payoutsEnabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {status.payoutsEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-6 flex gap-3">
          {!status?.connected ? (
            <Button 
              onClick={handleConnect}
              disabled={connecting}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {connecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Stripe Account'
              )}
            </Button>
          ) : (
            <>
              {status.requiresAction && status.actionUrl && (
                <Button 
                  onClick={() => window.open(status.actionUrl, '_blank')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Complete Setup
                </Button>
              )}
              
              <Button 
                variant="outline"
                onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                View Stripe Dashboard
              </Button>
            </>
          )}
        </div>
        
        {status?.accountId && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Account ID: {status.accountId}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}