
'use client';

import { useEffect, useState } from 'react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { CalendarDays, Clock, MapPin, Phone, Mail, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "../../hooks/use-toast";
import { motion } from 'framer-motion';

interface Booking {
  id: string;
  status: string;
  date: string;
  time: string;
  partySize: number;
  serviceType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests: string;
  venue: {
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
  };
  table?: {
    id: string;
    name: string;
  };
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState({
    email: '',
    phone: '',
  });
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchData.email && !searchData.phone) {
      toast({
        title: 'Search required',
        description: 'Please enter your email or phone number to find your bookings.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (searchData.email) params.append('email', searchData.email);
      if (searchData.phone) params.append('phone', searchData.phone);

      const response = await fetch(`/api/customer/bookings?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
        
        if (data.bookings.length === 0) {
          toast({
            title: 'No bookings found',
            description: 'No bookings were found with the provided information.',
          });
        }
      } else {
        throw new Error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch your bookings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (response.ok) {
        setBookings(prev => 
          prev.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: 'CANCELLED' }
              : booking
          )
        );
        toast({
          title: 'Booking cancelled',
          description: 'Your booking has been cancelled successfully.',
        });
      } else {
        throw new Error('Failed to cancel booking');
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel booking. Please contact the venue directly.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case 'DINE_IN': return 'Dine In';
      case 'TAKEAWAY': return 'Takeaway';
      case 'DELIVERY': return 'Delivery';
      case 'EVENT': return 'Event';
      default: return type;
    }
  };

  const canCancelBooking = (booking: Booking) => {
    const bookingDate = new Date(`${booking.date} ${booking.time}`);
    const now = new Date();
    const hoursDiff = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return booking.status === 'PENDING' || booking.status === 'CONFIRMED' && hoursDiff > 2;
  };

  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(`${booking.date} ${booking.time}`);
    return bookingDate > new Date() && booking.status !== 'CANCELLED';
  });

  const pastBookings = bookings.filter(booking => {
    const bookingDate = new Date(`${booking.date} ${booking.time}`);
    return bookingDate <= new Date() || booking.status === 'CANCELLED';
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/book" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to venues</span>
            </Link>
            <Link href="/" className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Sully</span>
            </Link>
            <Link href="/book">
              <Button variant="ghost">Book a Table</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              My Bookings
            </h1>
            <p className="text-xl text-gray-600">
              Find and manage your restaurant reservations
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Find Your Bookings</span>
              </CardTitle>
              <CardDescription>
                Enter your email or phone number to view your bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={searchData.email}
                      onChange={(e) => setSearchData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+44 7123 456789"
                      value={searchData.phone}
                      onChange={(e) => setSearchData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Searching...' : 'Find My Bookings'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Bookings Results */}
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {bookings.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No bookings found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      We couldn't find any bookings with the provided information.
                    </p>
                    <Link href="/book">
                      <Button>Make a Booking</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <Tabs defaultValue="upcoming" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upcoming">
                      Upcoming ({upcomingBookings.length})
                    </TabsTrigger>
                    <TabsTrigger value="past">
                      Past ({pastBookings.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming" className="space-y-4">
                    {upcomingBookings.length === 0 ? (
                      <Card className="text-center py-8">
                        <CardContent>
                          <p className="text-gray-600">No upcoming bookings</p>
                        </CardContent>
                      </Card>
                    ) : (
                      upcomingBookings.map((booking, index) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {booking.venue.name}
                                  </h3>
                                  <p className="text-gray-600 flex items-center space-x-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{booking.venue.address}, {booking.venue.city}</span>
                                  </p>
                                </div>
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center space-x-2">
                                  <CalendarDays className="h-4 w-4 text-gray-400" />
                                  <span>{new Date(booking.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span>{booking.time}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium">
                                    {booking.partySize} guests • {getServiceTypeLabel(booking.serviceType)}
                                  </span>
                                </div>
                              </div>

                              {booking.table && (
                                <p className="text-sm text-gray-600 mb-2">
                                  Table: {booking.table.name}
                                </p>
                              )}

                              {booking.specialRequests && (
                                <p className="text-sm text-gray-600 mb-4">
                                  Special requests: {booking.specialRequests}
                                </p>
                              )}

                              <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                  Booking ID: {booking.id.slice(-8)}
                                </div>
                                <div className="flex space-x-2">
                                  <a href={`tel:${booking.venue.phone}`}>
                                    <Button variant="outline" size="sm">
                                      <Phone className="h-4 w-4 mr-1" />
                                      Call
                                    </Button>
                                  </a>
                                  {canCancelBooking(booking) && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleCancelBooking(booking.id)}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="past" className="space-y-4">
                    {pastBookings.length === 0 ? (
                      <Card className="text-center py-8">
                        <CardContent>
                          <p className="text-gray-600">No past bookings</p>
                        </CardContent>
                      </Card>
                    ) : (
                      pastBookings.map((booking, index) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card className="opacity-75">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {booking.venue.name}
                                  </h3>
                                  <p className="text-gray-600 flex items-center space-x-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{booking.venue.address}, {booking.venue.city}</span>
                                  </p>
                                </div>
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center space-x-2">
                                  <CalendarDays className="h-4 w-4 text-gray-400" />
                                  <span>{new Date(booking.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span>{booking.time}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium">
                                    {booking.partySize} guests • {getServiceTypeLabel(booking.serviceType)}
                                  </span>
                                </div>
                              </div>

                              <div className="text-sm text-gray-500">
                                Booking ID: {booking.id.slice(-8)}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
