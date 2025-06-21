'use client';

import { useState, useEffect } from 'react';
import { X, Crown, Zap, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useAuth } from './auth-provider';
import Link from 'next/link';

interface SubscriptionBannerProps {
  className?: string;
}

export function SubscriptionBanner({ className = '' }: SubscriptionBannerProps) {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if banner was previously dismissed
    const isDismissed = localStorage.getItem('subscription-banner-dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('subscription-banner-dismissed', 'true');
  };

  // Don't render on server or if dismissed
  if (!mounted || dismissed) {
    return null;
  }

  // Don't show if user has an active subscription
  if (user?.subscriptionStatus === 'active') {
    return null;
  }

  const getBannerContent = () => {
    if (!user?.subscriptionStatus || user.subscriptionStatus === 'inactive') {
      return {
        icon: Star,
        title: 'Start Your Free Trial',
        description: 'Get 14 days free access to all premium features. No credit card required.',
        buttonText: 'Start Free Trial',
        buttonHref: '/dashboard/subscription',
        gradient: 'from-orange-500 to-orange-600'
      };
    }

    if (user.subscriptionStatus === 'past_due') {
      return {
        icon: Zap,
        title: 'Payment Required',
        description: 'Your subscription payment is overdue. Update your payment method to continue.',
        buttonText: 'Update Payment',
        buttonHref: '/dashboard/subscription',
        gradient: 'from-red-500 to-red-600'
      };
    }

    if (user.subscriptionStatus === 'canceled') {
      return {
        icon: Crown,
        title: 'Reactivate Your Subscription',
        description: 'Your subscription was canceled. Reactivate to continue using premium features.',
        buttonText: 'Reactivate',
        buttonHref: '/dashboard/subscription',
        gradient: 'from-orange-500 to-orange-600'
      };
    }

    return null;
  };

  const content = getBannerContent();
  if (!content) return null;

  const Icon = content.icon;

  return (
    <Card className={`relative overflow-hidden border-0 shadow-lg ${className}`}>
      <div className={`bg-gradient-to-r ${content.gradient} p-6 text-white`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white hover:bg-white/20 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex items-start space-x-4 pr-8">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full">
              <Icon className="h-6 w-6" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-1">
              {content.title}
            </h3>
            <p className="text-white/90 text-sm mb-4">
              {content.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={content.buttonHref}>
                <Button 
                  size="sm"
                  className="bg-white text-gray-900 hover:bg-gray-100 font-medium"
                >
                  {content.buttonText}
                </Button>
              </Link>
              
              {user?.subscriptionStatus === 'inactive' && (
                <Link href="/pricing">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 border border-white/30"
                  >
                    View Pricing
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 translate-x-10"></div>
      </div>
    </Card>
  );
}