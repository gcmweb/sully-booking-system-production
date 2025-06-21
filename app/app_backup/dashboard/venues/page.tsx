
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "../../../components/auth-provider";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { CalendarDays, Users, Plus, Settings, BarChart3, ArrowLeft, Crown, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Venue {
  id: string;
  name: string;
  venueType: string;
  isActive: boolean;
  logoUrl: string | null;
  headerImageUrl: string | null;
  subscription: {
    plan: string;
    bookingsUsed: number;
    bookingsLimit: number | null;
  };
  _count: {
    bookings: number;
    tables: number;
  };
}

interface VenueLimits {
  canCreateVenue: boolean;
  venuesUsed: number;
  venuesLimit: number | null;
  plan: string;
  message?: string;
}

export default function VenuesListPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  // Initialize venues with empty array to prevent undefined access
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [venueLimits, setVenueLimits] = useState<VenueLimits | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchVenues();
      fetchVenueLimits();
    }
  }, [user]);

  const fetchVenues = async () => {
    try {
      const response = await fetch('/api/venues', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Comprehensive null/undefined checks with fallback arrays
        const safeVenues = Array.isArray(data?.venues) ? data.venues : [];
        setVenues(safeVenues);
      } else {
        console.error('Failed to fetch venues:', response.status);
        setVenues([]);
      }
    } catch (error) {
      console.error('Network error fetching venues:', error);
      setVenues([]);
    } finally {
      setLoadingVenues(false);
    }
  };

  const fetchVenueLimits = async () => {
    try {
      const response = await fetch('/api/venues/limits', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setVenueLimits(data);
      } else {
        console.error('Failed to fetch venue limits:', response.status);
      }
    } catch (error) {
      console.error('Network error fetching venue limits:', error);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Ensure venues is always an array for safe operations
  const safeVenues = Array.isArray(venues) ? venues : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <CalendarDays className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">Sully</span>
              </Link>
              <Badge variant="secondary">Venues</Badge>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Venues</h1>
              <p className="text-gray-600">
                Manage all your venues and their settings
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {venueLimits && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {venueLimits.venuesUsed}/{venueLimits.venuesLimit || '∞'} venues
                  </div>
                  <Badge variant={venueLimits.plan === 'FREE' ? 'secondary' : 'default'} className="text-xs">
                    {venueLimits.plan === 'SUPER_ADMIN' ? 'Admin' : venueLimits.plan}
                  </Badge>
                </div>
              )}
              {venueLimits?.canCreateVenue ? (
                <Link href="/dashboard/venues/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Venue
                  </Button>
                </Link>
              ) : (
                <Button disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Venue
                </Button>
              )}
            </div>
          </div>

          {/* Subscription Limit Warning */}
          {venueLimits && !venueLimits.canCreateVenue && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <div className="flex justify-between items-center">
                  <span>{venueLimits.message}</span>
                  <Button size="sm" className="ml-4">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Upgrade Prompt for FREE users */}
          {venueLimits && venueLimits.plan === 'FREE' && venueLimits.canCreateVenue && (
            <Alert className="border-blue-200 bg-blue-50">
              <Crown className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="flex justify-between items-center">
                  <span>You're on the FREE plan. Upgrade to create up to 5 venues and unlock premium features!</span>
                  <Button size="sm" variant="outline" className="ml-4">
                    <Crown className="h-4 w-4 mr-2" />
                    View Plans
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </motion.div>

        {/* Venues Grid */}
        {loadingVenues ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : safeVenues.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No venues yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first venue
                </p>
                <Link href="/dashboard/venues/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Venue
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeVenues.map((venue, index) => (
              <motion.div
                key={venue?.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Venue Header Image */}
                  {venue?.headerImageUrl && (
                    <div className="relative h-32 bg-gray-100">
                      <Image
                        src={venue.headerImageUrl}
                        alt={`${venue?.name || 'Venue'} header`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        {venue?.logoUrl && (
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-white shadow-sm flex-shrink-0">
                            <Image
                              src={venue.logoUrl}
                              alt={`${venue?.name || 'Venue'} logo`}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{venue?.name || 'Unknown Venue'}</CardTitle>
                          <CardDescription>{venue?.venueType || 'Unknown Type'}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={venue?.isActive ? 'default' : 'secondary'}>
                        {venue?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Plan:</span>
                        <Badge variant="outline">
                          {venue?.subscription?.plan || 'Unknown'}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Bookings:</span>
                        <span>
                          {venue?.subscription?.bookingsUsed || 0}/
                          {venue?.subscription?.bookingsLimit || '∞'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tables:</span>
                        <span>{venue?._count?.tables || 0}</span>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Link href={`/dashboard/venues/${venue?.id || ''}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Settings className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                        </Link>
                        <Link href={`/dashboard/venues/${venue?.id || ''}/analytics`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Analytics
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
