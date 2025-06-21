
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "../../components/auth-provider";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { CalendarDays, Users, TrendingUp, Plus, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SubscriptionBanner } from "../../components/subscription-banner";
import { useSubscription } from "../../hooks/use-subscription";

interface Venue {
  id: string;
  name: string;
  venueType: string;
  isActive: boolean;
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

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  // Initialize venues with empty array to prevent undefined access
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const { data: subscriptionData } = useSubscription();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchVenues();
    }
  }, [user]);

  const fetchVenues = async () => {
    console.log('🔵 [DASHBOARD] Starting to fetch venues');
    
    try {
      const response = await fetch('/api/venues', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      console.log('🔵 [DASHBOARD] Venues fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔵 [DASHBOARD] Venues fetch response data:', data);
        
        // Comprehensive null/undefined checks with fallback arrays
        const safeVenues = Array.isArray(data?.venues) ? data.venues : [];
        setVenues(safeVenues);
        console.log('🟢 [DASHBOARD] Venues fetched successfully, count:', safeVenues.length);
      } else {
        const errorData = await response.text();
        console.error('🔴 [DASHBOARD] Failed to fetch venues:', response.status, response.statusText);
        console.error('🔴 [DASHBOARD] Error response:', errorData);
        setVenues([]); // Set empty array on error
      }
    } catch (error) {
      console.error('🔴 [DASHBOARD] Network error fetching venues:', error);
      setVenues([]); // Set empty array on network error
    } finally {
      setLoadingVenues(false);
      console.log('🔵 [DASHBOARD] Venues fetch completed');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Allow both VENUE_OWNER and SUPER_ADMIN to access dashboard
  // SUPER_ADMIN can manage venues and also access admin panel

  // Ensure venues is always an array for safe operations
  const safeVenues = Array.isArray(venues) ? venues : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <CalendarDays className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">Sully</span>
              </Link>
              <Badge variant="secondary">Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName || 'User'}!
              </span>
              <Button
                variant="outline"
                onClick={() => {
                  // Add logout functionality
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600">
            Manage your venues and bookings from your dashboard
          </p>
        </motion.div>

        {/* Subscription Banner */}
        {subscriptionData && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05 }}
            className="mb-8"
          >
            <SubscriptionBanner
              plan={subscriptionData.plan}
              venuesUsed={subscriptionData.summary.venues.used}
              venuesLimit={subscriptionData.summary.venues.limit}
            />
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Link href="/dashboard/venues/new">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Add New Venue</CardTitle>
                <Plus className="h-4 w-4 ml-auto text-blue-600" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Create a new venue to start accepting bookings
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/bookings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">View Bookings</CardTitle>
                <CalendarDays className="h-4 w-4 ml-auto text-green-600" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Manage all your venue bookings
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                <BarChart3 className="h-4 w-4 ml-auto text-purple-600" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  View booking trends and revenue reports
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Venues Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Venues</h2>
            <Link href="/dashboard/venues/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Venue
              </Button>
            </Link>
          </div>

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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safeVenues.map((venue, index) => (
                <motion.div
                  key={venue?.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 * index }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{venue?.name || 'Unknown Venue'}</CardTitle>
                          <CardDescription>{venue?.venueType || 'Unknown Type'}</CardDescription>
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
                              <TrendingUp className="h-4 w-4 mr-1" />
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
        </motion.div>
      </div>
    </div>
  );
}
