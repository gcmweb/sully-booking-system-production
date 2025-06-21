
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "../../../../../components/auth-provider";
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { 
  CalendarDays, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ArrowLeft, 
  BarChart3,
  ArrowUp, 
  ArrowDown,
  MapPin,
  Star,
  UserCheck,
  Table,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from "../../../../../hooks/use-toast";
import dynamic from 'next/dynamic';

// Simplified analytics without complex charts for build compatibility

interface VenueAnalyticsData {
  venue: {
    id: string;
    name: string;
    venueType: string;
  };
  totalBookings: number;
  totalRevenue: number;
  averagePartySize: number;
  bookingTrends: Array<{
    date: string;
    bookings: number;
    revenue: number;
    avgPartySize: number;
  }>;
  serviceTypeBreakdown: Array<{
    type: string;
    count: number;
    totalGuests: number;
    percentage: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  peakHours: Array<{
    hour: string;
    bookings: number;
    avgPartySize: number;
  }>;
  tableUtilization: Array<{
    tableName: string;
    capacity: number;
    bookings: number;
    avgPartySize: number;
    utilizationRate: number;
  }>;
  customerInsights: Array<{
    email: string;
    name: string;
    totalBookings: number;
    totalGuests: number;
    avgPartySize: number;
    lastBooking: string;
  }>;
  busiestDays: Array<{
    day: string;
    bookings: number;
    avgPartySize: number;
  }>;
  monthlyComparison: {
    currentMonth: {
      bookings: number;
      revenue: number;
    };
    previousMonth: {
      bookings: number;
      revenue: number;
    };
    growth: {
      bookings: number;
      revenue: number;
    };
  };
}

export default function VenueAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const venueId = params.id as string;

  const [analytics, setAnalytics] = useState<VenueAnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('30');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && venueId) {
      fetchAnalytics();
    }
  }, [user, venueId, timeRange]);

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const params = new URLSearchParams({
        timeRange,
      });

      const response = await fetch(`/api/venues/${venueId}/analytics?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else if (response.status === 404) {
        toast({
          title: 'Venue not found',
          description: 'The venue you are looking for does not exist.',
          variant: 'destructive',
        });
        router.push('/dashboard/venues');
      } else if (response.status === 403) {
        toast({
          title: 'Access denied',
          description: 'You do not have permission to view this venue\'s analytics.',
          variant: 'destructive',
        });
        router.push('/dashboard/venues');
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Failed to fetch venue analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load venue analytics.',
        variant: 'destructive',
      });
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#FF6363', '#80D8C3', '#A19AD3', '#72BF78'];

  if (loading || loadingAnalytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <CalendarDays className="h-8 w-8 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">Sully</span>
                </Link>
                <Badge variant="secondary">Analytics</Badge>
              </div>
              <Link href={`/dashboard/venues/${venueId}`}>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Venue
                </Button>
              </Link>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-48 mt-2 animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
          <p className="text-gray-600 mb-4">Analytics data will appear here once you have bookings.</p>
          <Link href={`/dashboard/venues/${venueId}`}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Venue
            </Button>
          </Link>
        </div>
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
              <Link href="/dashboard" className="flex items-center space-x-2">
                <CalendarDays className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">Sully</span>
              </Link>
              <Badge variant="secondary">Analytics</Badge>
            </div>
            <Link href={`/dashboard/venues/${venueId}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Venue
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {analytics.venue.name} Analytics
            </h1>
            <p className="text-gray-600 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Track your venue's performance and insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-sm">
              {analytics.venue.venueType.replace('_', ' ')}
            </Badge>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalBookings}</p>
                    <div className="flex items-center mt-2">
                      {analytics.monthlyComparison.growth.bookings > 0 ? (
                        <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${analytics.monthlyComparison.growth.bookings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(analytics.monthlyComparison.growth.bookings)}% vs last month
                      </span>
                    </div>
                  </div>
                  <CalendarDays className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">£{analytics.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      {analytics.monthlyComparison.growth.revenue > 0 ? (
                        <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${analytics.monthlyComparison.growth.revenue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(analytics.monthlyComparison.growth.revenue)}% vs last month
                      </span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Party Size</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.averagePartySize.toFixed(1)}</p>
                    <p className="text-sm text-gray-500 mt-2">Guests per booking</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Peak Hour</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics.peakHours[0]?.hour || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {analytics.peakHours[0]?.bookings || 0} bookings
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="hours">Peak Hours</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
                <CardDescription>Daily booking volume and revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.bookingTrends.slice(-7).map((trend, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{trend.date}</span>
                      <div className="flex space-x-4">
                        <span className="text-blue-600">{trend.bookings} bookings</span>
                        <span className="text-green-600">£{trend.revenue}</span>
                        <span className="text-purple-600">{trend.avgPartySize.toFixed(1)} avg guests</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Busiest Days</CardTitle>
                  <CardDescription>Booking volume by day of week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.busiestDays.slice(0, 7).map((day, index) => (
                      <div key={day.day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{day.day}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{day.bookings} bookings</p>
                          <p className="text-sm text-gray-500">{day.avgPartySize.toFixed(1)} avg guests</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Status</CardTitle>
                  <CardDescription>Distribution of booking statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.statusBreakdown.map((status, index) => (
                      <div key={status.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{status.status.replace('_', ' ')}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{status.count}</p>
                          <p className="text-sm text-gray-500">{status.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Type Distribution</CardTitle>
                  <CardDescription>Breakdown of bookings by service type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.serviceTypeBreakdown.map((service, index) => (
                      <div key={service.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{service.type.replace('_', ' ')}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{service.count} bookings</p>
                          <p className="text-sm text-gray-500">{service.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Statistics</CardTitle>
                  <CardDescription>Detailed breakdown with guest counts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.serviceTypeBreakdown.map((service, index) => (
                      <div key={service.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{service.type.replace('_', ' ')}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{service.count} bookings</p>
                          <p className="text-sm text-gray-500">{service.totalGuests} total guests</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hours" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Peak Hours Analysis</CardTitle>
                <CardDescription>Booking volume by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analytics.peakHours.slice(0, 8).map((hour) => (
                    <div key={hour.hour} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-lg">{hour.hour}</p>
                      <p className="text-sm text-gray-600">{hour.bookings} bookings</p>
                      <p className="text-xs text-gray-500">{hour.avgPartySize.toFixed(1)} avg guests</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tables" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Table Utilization</CardTitle>
                <CardDescription>Performance and utilization rates by table</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.tableUtilization.map((table, index) => (
                    <motion.div
                      key={table.tableName}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Table className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{table.tableName}</h3>
                          <p className="text-sm text-gray-600">Capacity: {table.capacity} guests</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex space-x-6">
                          <div>
                            <p className="text-sm text-gray-600">Bookings</p>
                            <p className="text-lg font-semibold">{table.bookings}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Avg Guests</p>
                            <p className="text-lg font-semibold">{table.avgPartySize.toFixed(1)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Utilization</p>
                            <p className="text-lg font-semibold">{table.utilizationRate.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Your most frequent customers and their booking patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.customerInsights.map((customer, index) => (
                    <motion.div
                      key={customer.email}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <UserCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                          <p className="text-xs text-gray-500">Last booking: {customer.lastBooking}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex space-x-6">
                          <div>
                            <p className="text-sm text-gray-600">Bookings</p>
                            <p className="text-lg font-semibold">{customer.totalBookings}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Guests</p>
                            <p className="text-lg font-semibold">{customer.totalGuests}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Avg Party</p>
                            <p className="text-lg font-semibold">{customer.avgPartySize.toFixed(1)}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Comparison</CardTitle>
                  <CardDescription>Current vs previous month performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Current Month Bookings</p>
                        <p className="text-2xl font-bold text-blue-900">{analytics.monthlyComparison.currentMonth.bookings}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600">Previous Month</p>
                        <p className="text-2xl font-bold text-blue-900">{analytics.monthlyComparison.previousMonth.bookings}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-green-600">Current Month Revenue</p>
                        <p className="text-2xl font-bold text-green-900">£{analytics.monthlyComparison.currentMonth.revenue.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">Previous Month</p>
                        <p className="text-2xl font-bold text-green-900">£{analytics.monthlyComparison.previousMonth.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                  <CardDescription>Performance highlights and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Peak Performance</h4>
                      <p className="text-sm text-yellow-700">
                        Your busiest day is {analytics.busiestDays[0]?.day} with {analytics.busiestDays[0]?.bookings} bookings.
                        Peak hour is {analytics.peakHours[0]?.hour} with {analytics.peakHours[0]?.bookings} bookings.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Service Mix</h4>
                      <p className="text-sm text-purple-700">
                        {analytics.serviceTypeBreakdown[0]?.type.replace('_', ' ')} is your most popular service 
                        with {analytics.serviceTypeBreakdown[0]?.percentage.toFixed(1)}% of bookings.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Customer Loyalty</h4>
                      <p className="text-sm text-green-700">
                        You have {analytics.customerInsights.length} repeat customers who have made multiple bookings.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
