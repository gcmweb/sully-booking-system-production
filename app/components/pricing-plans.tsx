'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from './auth-provider';
import { useRouter } from 'next/navigation';
import { useToast } from '../hooks/use-toast';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  icon: React.ComponentType<any>;
  stripePriceId: string;
  maxVenues: number;
  maxBookingsPerMonth: number;
}

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small venue owners getting started',
    price: 29,
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || '',
    maxVenues: 1,
    maxBookingsPerMonth: 50,
    icon: Star,
    features: [
      '1 venue listing',
      'Up to 50 bookings/month',
      'Basic analytics',
      'Email support',
      'Mobile-friendly booking widget',
      'Payment processing',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing businesses with multiple venues',
    price: 79,
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID || '',
    maxVenues: 5,
    maxBookingsPerMonth: 200,
    icon: Zap,
    popular: true,
    features: [
      '5 venue listings',
      'Up to 200 bookings/month',
      'Advanced analytics & reporting',
      'Priority email & phone support',
      'Custom booking widget',
      'Payment processing',
      'Calendar integrations',
      'Custom branding',
      'Automated confirmations',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with extensive venue portfolios',
    price: 199,
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || '',
    maxVenues: -1, // Unlimited
    maxBookingsPerMonth: -1, // Unlimited
    icon: Crown,
    features: [
      'Unlimited venue listings',
      'Unlimited bookings',
      'Enterprise analytics & insights',
      'Dedicated account manager',
      'White-label solution',
      'Payment processing',
      'API access',
      'Custom integrations',
      'Advanced security features',
      'SLA guarantee',
    ],
  },
];

interface PricingPlansProps {
  currentPlan?: string;
  onPlanSelect?: (planId: string) => void;
}

export function PricingPlans({ currentPlan, onPlanSelect }: PricingPlansProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePlanSelect = async (plan: PricingPlan) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (onPlanSelect) {
      onPlanSelect(plan.id);
      return;
    }

    setLoading(plan.id);

    try {
      const response = await fetch('/api/subscriptions/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          planType: plan.id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to start subscription upgrade. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentPlan === planId;
  };

  const getPlanButtonText = (plan: PricingPlan) => {
    if (isCurrentPlan(plan.id)) {
      return 'Current Plan';
    }
    if (currentPlan && currentPlan !== 'free') {
      return 'Switch Plan';
    }
    return 'Get Started';
  };

  const isPlanDisabled = (plan: PricingPlan) => {
    return isCurrentPlan(plan.id) || loading === plan.id;
  };

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your venue business. Upgrade or downgrade at any time.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const isCurrent = isCurrentPlan(plan.id);
          const isDisabled = isPlanDisabled(plan);

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`relative ${plan.popular ? 'md:-mt-4' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full ${plan.popular ? 'border-orange-500 shadow-xl scale-105' : 'border-gray-200'} ${isCurrent ? 'ring-2 ring-orange-500' : ''} transition-all duration-300 hover:shadow-lg`}>
                <CardHeader className="text-center pb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto ${
                    plan.popular ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-8 w-8 ${
                      plan.popular ? 'text-orange-600' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {plan.name}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-600 mt-2">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600 ml-2">/{plan.interval}</span>
                    </div>
                    
                    {isCurrent && (
                      <Badge variant="outline" className="mt-2 border-orange-500 text-orange-700">
                        Current Plan
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handlePlanSelect(plan)}
                    disabled={isDisabled}
                    className={`w-full ${
                      plan.popular
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    } ${isCurrent ? 'opacity-50 cursor-not-allowed' : ''}`}
                    size="lg"
                  >
                    {loading === plan.id ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      getPlanButtonText(plan)
                    )}
                  </Button>
                  
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      {plan.maxVenues === -1 ? 'Unlimited' : plan.maxVenues} venue{plan.maxVenues !== 1 ? 's' : ''} • {' '}
                      {plan.maxBookingsPerMonth === -1 ? 'Unlimited' : plan.maxBookingsPerMonth} bookings/month
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-center mt-12"
      >
        <p className="text-gray-600 mb-4">
          All plans include a 14-day free trial. No credit card required to start.
        </p>
        <p className="text-sm text-gray-500">
          Need a custom solution? {' '}
          <a href="/contact" className="text-orange-600 hover:text-orange-700 underline">
            Contact our sales team
          </a>
        </p>
      </motion.div>
    </div>
  );
}