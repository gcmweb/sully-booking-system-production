'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "../../../components/auth-provider";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { CalendarDays, ArrowLeft, Search, Filter, Eye, CheckCircle, XCircle, Clock, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from "../../../hooks/use-toast";

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  createdAt: string;
  venue: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
}

export default function DashboardBookingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, currentPage, searchTerm, statusFilter]);

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
      });
      
      const response = await fetch(`/api/dashboard/bookings?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingBooking(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setBookings(bookings.map(b => 
          b.id === bookingId ? { ...b, status: newStatus } : b
        ));
        toast({
          title: 'Booking updated',
          description: `Booking has been ${newStatus.toLowerCase()}.`,
        });
      } else {
        throw new Error('Failed to update booking');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update booking status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingBooking(null);
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
              <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <CalendarDays className="h-6 w-6 text-orange-600" />
                <span className="text-xl font-semibold text-gray-900">Bookings</span>
              </div>
            </div>
            <Badge variant="secondary">Dashboard</Badge>
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
            Venue Bookings
          </h1>
          <p className="text-gray-600">
            Manage all bookings for your venues
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6 border"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
            </select>
            
            <Button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setCurrentPage(1);
              }}
              variant="outline"
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              Clear Filters
            </Button>
          </div>
        </motion.div>

        {/* Bookings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {loadingData ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 w-24 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                        <div className="h-8 w-20 bg-gray-200 rounded"></div>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600 mb-6">You don't have any bookings yet or none match your search criteria.</p>
                <Link href="/dashboard/venues">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Manage Venues
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
                          <CalendarDays className="h-6 w-6 text-orange-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.customerName}
                            </h3>
                            {getStatusBadge(booking.status)}
                            {getPaymentBadge(booking.paymentStatus)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <MapPin className="h-4 w-4" />
                                <span className="font-medium">{booking.venue.name}</span>
                              </div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">Total: ${booking.totalAmount}</span>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Mail className="h-4 w-4" />
                                <span>{booking.customerEmail}</span>
                              </div>
                              {booking.customerPhone && (
                                <div className="flex items-center space-x-2 mb-1">
                                  <Phone className="h-4 w-4" />
                                  <span>{booking.customerPhone}</span>
                                </div>
                              )}
                              <div className="text-xs text-gray-500">
                                Booked on {formatDate(booking.createdAt)}
                              </div>
                            </div>
                          </div>
                          
                          {booking.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Notes:</span> {booking.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {booking.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                              disabled={updatingBooking === booking.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {updatingBooking === booking.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Confirm
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                              disabled={updatingBooking === booking.id}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        
                        {booking.status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                            disabled={updatingBooking === booking.id}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Complete
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-200 text-orange-700 hover:bg-orange-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}