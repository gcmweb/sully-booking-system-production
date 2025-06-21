'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "../../components/auth-provider";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { CalendarDays, ArrowLeft, MapPin, Clock, DollarSign, Phone, Mail, FileText, XCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useToast } from "../../hooks/use-toast";

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
  venue: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    images: string[];
    phone?: string;
    email?: string;
  };
}

export default function MyBookingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/my-bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    setCancellingBooking(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setBookings(bookings.map(b => 
          b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
        ));
        toast({
          title: 'Booking cancelled',
          description: 'Your booking has been cancelled successfully.',
        });
      } else {
        throw new Error('Failed to cancel booking');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCancellingBooking(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-green-600">Confirmed</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="border-orange-500 text-orange-700">Pending</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'COMPLETED':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-600">Paid</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="border-orange-500 text-orange-700">Pending</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'REFUNDED':
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canCancelBooking = (booking: Booking) => {
    const startTime = new Date(booking.startTime);
    const now = new Date();
    const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return booking.status === 'CONFIRMED' && hoursUntilStart > 24; // Can cancel if more than 24 hours before start
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
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <CalendarDays className="h-6 w-6 text-orange-600" />
                <span className="text-xl font-semibold text-gray-900">My Bookings</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/book">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  Book New Venue
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600">
            View and manage all your venue bookings
          </p>
        </motion.div>

        {/* Bookings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {loadingData ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-24 w-24 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                        <div className="flex space-x-4">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarDays className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-6">You haven't made any venue bookings yet. Start exploring amazing venues!</p>
                <Link href="/book">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Browse Venues
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-6">
                        {/* Venue Image */}
                        <div className="flex-shrink-0">
                          <div className="relative h-24 w-24 rounded-lg overflow-hidden">
                            {booking.venue.images && booking.venue.images.length > 0 ? (
                              <Image
                                src={booking.venue.images[0]}
                                alt={booking.venue.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                                <CalendarDays className="h-8 w-8 text-orange-400" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Booking Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                {booking.venue.name}
                              </h3>
                              <div className="flex items-center text-gray-600 mb-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="text-sm">
                                  {booking.venue.address}, {booking.venue.city}, {booking.venue.state}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(booking.status)}
                              {getPaymentBadge(booking.paymentStatus)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                <div>
                                  <p className="text-sm font-medium">Event Time</p>
                                  <p className="text-sm">
                                    {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center text-gray-600">
                                <DollarSign className="h-4 w-4 mr-2" />
                                <div>
                                  <p className="text-sm font-medium">Total Amount</p>
                                  <p className="text-sm">${booking.totalAmount}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {booking.venue.phone && (
                                <div className="flex items-center text-gray-600">
                                  <Phone className="h-4 w-4 mr-2" />
                                  <div>
                                    <p className="text-sm font-medium">Venue Phone</p>
                                    <p className="text-sm">{booking.venue.phone}</p>
                                  </div>
                                </div>
                              )}
                              
                              {booking.venue.email && (
                                <div className="flex items-center text-gray-600">
                                  <Mail className="h-4 w-4 mr-2" />
                                  <div>
                                    <p className="text-sm font-medium">Venue Email</p>
                                    <p className="text-sm">{booking.venue.email}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {booking.notes && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-start">
                                <FileText className="h-4 w-4 mr-2 mt-0.5 text-gray-600" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 mb-1">Booking Notes</p>
                                  <p className="text-sm text-gray-700">{booking.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-4 border-t">
                            <p className="text-sm text-gray-500">
                              Booked on {formatDate(booking.createdAt)}
                            </p>
                            
                            <div className="flex items-center space-x-3">
                              <Link href={`/venue/${booking.venue.id}`}>
                                <Button size="sm" variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                                  View Venue
                                </Button>
                              </Link>
                              
                              {canCancelBooking(booking) && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => cancelBooking(booking.id)}
                                  disabled={cancellingBooking === booking.id}
                                >
                                  {cancellingBooking === booking.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Cancel Booking
                                </Button>
                              )}
                            </div>
                          </div>
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