
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { CalendarDays, Users, TrendingUp, DollarSign, Clock, MapPin, Star, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Simplified analytics without complex charts for now

interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  averagePartySize: number;
  bookingTrends: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;
  serviceTypeBreakdown: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  peakHours: Array<{
    hour: string;
    bookings: number;
  }>;
  venuePerformance: Array<{
    venueName: string;
    bookings: number;
    revenue: number;
    averageRating: number;
  }>;
  monthlyComparison: {
    currentMonth: number;
    previousMonth: number;
    growth: number;
  };
}

interface Venue {
  id: string;
  name: string;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('30');

  useEffect(() => {
    fetchAnalytics();
    fetchVenues();
  }, [selectedVenue, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(selectedVenue !== 'all' && { venueId: selectedVenue }),
      });

      console.log('🔵 [ANALYTICS] Fetching analytics with params:', params.toString());
      const response = await fetch(`/api/analytics?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔵 [ANALYTICS] Analytics data received:', data);
        
        // Add comprehensive null/undefined checks
        if (data && typeof data === 'object') {
          // Ensure all required properties exist with defaults
          const safeAnalytics = {
            totalBookings: data.totalBookings || 0,
            totalRevenue: data.totalRevenue || 0,
            averagePartySize: data.averagePartySize || 0,
            bookingTrends: Array.isArray(data.bookingTrends) ? data.bookingTrends : [],
            serviceTypeBreakdown: Array.isArray(data.serviceTypeBreakdown) ? data.serviceTypeBreakdown : [],
            peakHours: Array.isArray(data.peakHours) ? data.peakHours : [],
            venuePerformance: Array.isArray(data.venuePerformance) ? data.venuePerformance : [],
            monthlyComparison: data.monthlyComparison || { currentMonth: 0, previousMonth: 0, growth: 0 }
          };
          setAnalytics(safeAnalytics);
          console.log('🟢 [ANALYTICS] Analytics data processed successfully');
        } else {
          console.warn('🟡 [ANALYTICS] Invalid analytics data structure:', data);
          setAnalytics(null);
        }
      } else {
        const errorText = await response.text();
        console.error('🔴 [ANALYTICS] Failed to fetch analytics:', response.status, errorText);
        setAnalytics(null);
      }
    } catch (error) {
      console.error('🔴 [ANALYTICS] Network error fetching analytics:', error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await fetch('/api/venues');
      if (response.ok) {
        const data = await response.json();
        setVenues(data.venues);
      }
    } catch (error) {
      console.error('Failed to fetch venues:', error);
    }
  };

  const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#FF6363', '#80D8C3', '#A19AD3', '#72BF78'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Track your booking performance and insights</p>
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
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
        <p className="text-gray-600">Analytics data will appear here once you have bookings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your booking performance and insights</p>
        </div>
        <div className="flex space-x-4">
          <Select value={selectedVenue} onValueChange={setSelectedVenue}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select venue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Venues</SelectItem>
              {venues.map(venue => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    {analytics.monthlyComparison.growth > 0 ? (
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${analytics.monthlyComparison.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(analytics.monthlyComparison.growth)}% vs last month
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
                  <p className="text-sm text-gray-500 mt-2">From paid bookings</p>
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
        <TabsList>
          <TabsTrigger value="trends">Booking Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Service Breakdown</TabsTrigger>
          <TabsTrigger value="hours">Peak Hours</TabsTrigger>
          <TabsTrigger value="venues">Venue Performance</TabsTrigger>
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Type Distribution</CardTitle>
                <CardDescription>Breakdown of bookings by service type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.serviceTypeBreakdown.map((service, index) => (
                    <div key={service.type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{service.type.replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{service.count}</p>
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
                <CardDescription>Detailed breakdown with percentages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.serviceTypeBreakdown.map((service, index) => (
                    <div key={service.type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{service.type.replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{service.count}</p>
                        <p className="text-sm text-gray-500">{service.percentage.toFixed(1)}%</p>
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="venues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Venue Performance</CardTitle>
              <CardDescription>Compare performance across your venues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.venuePerformance.map((venue, index) => (
                  <motion.div
                    key={venue.venueName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{venue.venueName}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{venue.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex space-x-6">
                        <div>
                          <p className="text-sm text-gray-600">Bookings</p>
                          <p className="text-lg font-semibold">{venue.bookings}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Revenue</p>
                          <p className="text-lg font-semibold">£{venue.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
