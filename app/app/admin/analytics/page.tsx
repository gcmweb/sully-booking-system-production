
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "../../../components/auth-provider";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { CalendarDays, Users, Building, TrendingUp, ArrowLeft, BarChart3, PieChart, Activity } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  bookingsByStatus: {
    status: string;
    count: number;
  }[];
  bookingsByVenue: {
    venueName: string;
    count: number;
  }[];
  monthlyTrends: {
    month: string;
    bookings: number;
    revenue: number;
  }[];
}

export default function AdminAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'SUPER_ADMIN')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'SUPER_ADMIN') {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        toast.error('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || !user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
              <Link href="/admin" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Admin</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-semibold text-gray-900">System Analytics</span>
              </div>
            </div>
            <Badge variant="secondary">Admin Panel</Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive analytics and insights across the entire platform
          </p>
        </motion.div>

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
          <>
            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalBookings || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    All time bookings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${analytics?.totalRevenue?.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Platform revenue
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Booking Value</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${analytics?.averageBookingValue?.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Per booking
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Venues</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.bookingsByVenue?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    With bookings
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Booking Status Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5" />
                      <span>Booking Status Distribution</span>
                    </CardTitle>
                    <CardDescription>Breakdown of booking statuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics?.bookingsByStatus && analytics.bookingsByStatus.length > 0 ? (
                      <div className="space-y-3">
                        {analytics.bookingsByStatus.map((item, index) => (
                          <div key={item.status} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ 
                                  backgroundColor: ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB'][index % 4] 
                                }}
                              ></div>
                              <span className="text-sm font-medium capitalize">{item.status.toLowerCase()}</span>
                            </div>
                            <Badge variant="outline">{item.count}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No booking data available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Top Venues */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="h-5 w-5" />
                      <span>Top Venues by Bookings</span>
                    </CardTitle>
                    <CardDescription>Most popular venues on the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics?.bookingsByVenue && analytics.bookingsByVenue.length > 0 ? (
                      <div className="space-y-3">
                        {analytics.bookingsByVenue.slice(0, 5).map((venue, index) => (
                          <div key={venue.venueName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                                {index + 1}
                              </div>
                              <span className="font-medium text-sm">{venue.venueName}</span>
                            </div>
                            <Badge variant="outline">{venue.count} bookings</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No venue data available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Monthly Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Monthly Trends</span>
                  </CardTitle>
                  <CardDescription>Booking and revenue trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.monthlyTrends && analytics.monthlyTrends.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.monthlyTrends.map((month) => (
                        <div key={month.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{month.month}</p>
                            <p className="text-sm text-gray-600">{month.bookings} bookings</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${month.revenue.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Revenue</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No trend data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
