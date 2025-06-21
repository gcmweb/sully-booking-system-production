'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "../../components/auth-provider";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { CalendarDays, Building, TrendingUp, Users, Plus, Eye, Edit, BarChart3, CreditCard, LogOut } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from "../../hooks/use-toast";
import { SubscriptionStatus } from "../../components/subscription-status";
import { SubscriptionBanner } from "../../components/subscription-banner";

interface DashboardStats {
  totalVenues: number;
  totalBookings: number;
  monthlyRevenue: number;
  pendingBookings: number;
}

interface RecentBooking {
  id: string;
  customerName: string;
  venue: {
    name: string;
  };
  startTime: string;
  totalAmount: number;
  status: string;
}

interface Venue {
  id: string;
  name: string;
  city: string;
  state: string;
  isActive: boolean;
  _count: {
    bookings: number;
  };
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentBookings(data.recentBookings);
        setVenues(data.venues);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Signed out successfully',
        description: 'You have been logged out.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <CalendarDays className="h-8 w-8 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">Sully</span>
              </Link>
              <Badge variant="secondary">Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.firstName}!
              </span>
              {user.role === 'SUPER_ADMIN' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/admin')}
                >
                  Admin Panel
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Banner */}
        <SubscriptionBanner />

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your venues and bookings
          </p>
        </motion.div>

        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8"
        >
          <SubscriptionStatus />
        </motion.div>

        {/* Stats Cards */}
        {loadingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalVenues || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active listings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All time bookings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats?.monthlyRevenue?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pendingBookings || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting confirmation
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Link href="/dashboard/venues/new">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Add New Venue</CardTitle>
                <Plus className="h-4 w-4 ml-auto text-orange-600 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  List a new venue for booking
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/venues">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Manage Venues</CardTitle>
                <Building className="h-4 w-4 ml-auto text-green-600 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Edit and manage your venues
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/bookings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">View Bookings</CardTitle>
                <Eye className="h-4 w-4 ml-auto text-blue-600 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Review all venue bookings
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                <BarChart3 className="h-4 w-4 ml-auto text-purple-600 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  View performance metrics
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Bookings</span>
                  <Link href="/dashboard/bookings">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardTitle>
                <CardDescription>Latest booking activity for your venues</CardDescription>
              </CardHeader>
              <CardContent>
                {recentBookings.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent bookings
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{booking.customerName}</p>
                          <p className="text-xs text-gray-600">{booking.venue.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">${booking.totalAmount}</p>
                          <Badge variant="outline" className="text-xs">
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Your Venues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Venues</span>
                  <Link href="/dashboard/venues">
                    <Button variant="outline" size="sm">
                      Manage All
                    </Button>
                  </Link>
                </CardTitle>
                <CardDescription>Quick overview of your venue listings</CardDescription>
              </CardHeader>
              <CardContent>
                {venues.length === 0 ? (
                  <div className="text-center py-6">
                    <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-3">No venues listed yet</p>
                    <Link href="/dashboard/venues/new">
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Venue
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {venues.slice(0, 3).map((venue) => (
                      <div key={venue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{venue.name}</p>
                          <p className="text-xs text-gray-600">{venue.city}, {venue.state}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={venue.isActive ? "default" : "secondary"} className="text-xs">
                            {venue.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className="text-xs text-gray-600">
                            {venue._count.bookings} bookings
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}