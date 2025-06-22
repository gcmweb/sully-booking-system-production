'use client';

import { useState, useEffect } from 'react';
import { X, Star, Zap, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from './auth-provider';
import Link from 'next/link';

export function SubscriptionBanner() {
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

  // Clear dismissal when user logs out
  useEffect(() => {
    if (!user) {
      localStorage.removeItem('subscription-banner-dismissed');
      setDismissed(false);
    }
  }, [user]);

  if (!mounted || dismissed) {
    return null;
  }

  const getBannerContent = () => {
    if (!user) {
      return {
        icon: Star,
        title: 'Start Your Free Trial',
        description: 'Get 14 days free access to all premium features. No credit card required.',
        buttonText: 'Start Free Trial',
        buttonHref: '/dashboard/subscription',
        gradient: 'from-orange-500 to-orange-600'
      };
    }

    // Default case for users without subscription info
    return {
      icon: Star,
      title: 'Upgrade Your Plan',
      description: 'Unlock premium features with our professional plans.',
      buttonText: 'View Plans',
      buttonHref: '/dashboard/subscription',
      gradient: 'from-orange-500 to-orange-600'
    };
  };

  const content = getBannerContent();
  if (!content) return null;

  const IconComponent = content.icon;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-r ${content.gradient} text-white shadow-lg`}>
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <IconComponent className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {content.title}
              </p>
              <p className="text-xs text-white/90 mt-1 hidden sm:block">
                {content.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 flex-shrink-0 ml-3">
            <div className="flex items-center space-x-2">
              <Link href={content.buttonHref}>
                <Button 
                  size="sm" 
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                >
                  {content.buttonText}
                </Button>
              </Link>
              
              {user && (
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
            
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-md hover:bg-white/20 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 translate-x-10"></div>
      </div>
    </div>
  );
}