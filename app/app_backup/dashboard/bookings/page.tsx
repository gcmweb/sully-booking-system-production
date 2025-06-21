
'use client';

import { useEffect, useState } from 'react';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { CalendarDays, Users, Clock, MapPin, Phone, Mail, Search, Filter, MoreHorizontal, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from "../../../hooks/use-toast";
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
  source: string;
  createdAt: string;
  venue: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
  table?: {
    id: string;
    name: string;
  };
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Venue {
  id: string;
  name: string;
}

export default function BookingsPage() {
  // Initialize all arrays with empty arrays to prevent undefined access
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    venueId: 'all',
    status: 'all',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
    fetchVenues();
  }, [filters, pagination.page]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.venueId && filters.venueId !== 'all' && { venueId: filters.venueId }),
        ...(filters.status && filters.status !== 'all' && { status: filters.status }),
      });

      const response = await fetch(`/api/bookings?${params}`);
      if (response.ok) {
        const data = await response.json();
        // Comprehensive null/undefined checks with fallback arrays
        const safeBookings = Array.isArray(data?.bookings) ? data.bookings : [];
        setBookings(safeBookings);
        setPagination(prev => ({
          ...prev,
          total: data?.pagination?.total || 0,
          pages: data?.pagination?.pages || 0,
        }));
      } else {
        console.error('Failed to fetch bookings:', response.status, response.statusText);
        setBookings([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          pages: 0,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
        pages: 0,
      }));
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await fetch('/api/venues');
      if (response.ok) {
        const data = await response.json();
        // Comprehensive null/undefined checks with fallback arrays
        const safeVenues = Array.isArray(data?.venues) ? data.venues : [];
        setVenues(safeVenues);
      } else {
        console.error('Failed to fetch venues:', response.status, response.statusText);
        setVenues([]);
      }
    } catch (error) {
      console.error('Failed to fetch venues:', error);
      setVenues([]);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Ensure safe array operations
        const safeBookings = Array.isArray(bookings) ? bookings : [];
        setBookings(safeBookings.map(booking => 
          booking?.id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        ));
        toast({
          title: 'Booking updated',
          description: `Booking status changed to ${newStatus.toLowerCase()}.`,
        });
      } else {
        throw new Error('Failed to update booking status');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
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

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'DIRECT': return 'Direct';
      case 'WIDGET': return 'Widget';
      case 'API': return 'API';
      case 'PHONE': return 'Phone';
      case 'WALK_IN': return 'Walk-in';
      default: return source;
    }
  };

  // Ensure safe array operations for filtering
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const safeVenues = Array.isArray(venues) ? venues : [];
  
  const todayBookings = safeBookings.filter(booking => {
    try {
      if (!booking?.date) return false;
      const bookingDate = new Date(booking.date);
      const today = new Date();
      return bookingDate.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  });

  const upcomingBookings = safeBookings.filter(booking => {
    try {
      if (!booking?.date) return false;
      const bookingDate = new Date(booking.date);
      const today = new Date();
      return bookingDate > today;
    } catch {
      return false;
    }
  });

  const pendingBookings = safeBookings.filter(booking => booking?.status === 'PENDING');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage all your venue bookings</p>
        </div>
      </div>

      {/* Stats Cards */}
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
                  <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{todayBookings.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-3xl font-bold text-gray-900">{upcomingBookings.length}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
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
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingBookings.length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
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
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{pagination?.total || 0}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Customer name, email, or phone..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Venue</label>
              <Select value={filters.venueId} onValueChange={(value) => setFilters(prev => ({ ...prev, venueId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All venues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All venues</SelectItem>
                  {safeVenues.filter(venue => venue?.id && venue?.name).map(venue => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => {
                setFilters({ venueId: 'all', status: 'all', search: '' });
                setPagination(prev => ({ ...prev, page: 1 }));
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            {pagination?.total || 0} total bookings • Page {pagination?.page || 1} of {pagination?.pages || 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : safeBookings.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">No bookings match your current filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {safeBookings.map((booking, index) => (
                <motion.div
                  key={booking?.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking?.customerName || 'Unknown Customer'}
                            </h3>
                            <Badge className={getStatusColor(booking?.status || 'UNKNOWN')}>
                              {booking?.status || 'UNKNOWN'}
                            </Badge>
                            <Badge variant="outline">
                              {getSourceLabel(booking?.source || 'UNKNOWN')}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{booking?.venue?.name || 'Unknown Venue'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CalendarDays className="h-4 w-4" />
                              <span>{booking?.date ? new Date(booking.date).toLocaleDateString() : 'Unknown Date'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{booking?.time || 'Unknown Time'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>{booking?.partySize || 0} guests • {getServiceTypeLabel(booking?.serviceType || 'UNKNOWN')}</span>
                            </div>
                          </div>

                          {booking?.table && (
                            <p className="text-sm text-gray-600 mt-2">
                              Table: {booking.table.name}
                            </p>
                          )}

                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{booking?.customerEmail || 'No email'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{booking?.customerPhone || 'No phone'}</span>
                            </div>
                          </div>

                          {booking?.specialRequests && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Special requests:</strong> {booking.specialRequests}
                            </p>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          {booking?.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                          
                          {booking?.status === 'CONFIRMED' && (
                            <Select onValueChange={(value) => handleStatusChange(booking.id, value)}>
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Actions" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="COMPLETED">Mark Complete</SelectItem>
                                <SelectItem value="NO_SHOW">Mark No Show</SelectItem>
                                <SelectItem value="CANCELLED">Cancel</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Booking ID: {booking?.id?.slice(-8) || 'Unknown'}</span>
                        <span>Created: {booking?.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Pagination */}
              {(pagination?.pages || 0) > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={(pagination?.page || 1) === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, (prev?.page || 1) - 1) }))}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: Math.min(5, pagination?.pages || 0) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={(pagination?.page || 1) === page ? "default" : "outline"}
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    disabled={(pagination?.page || 1) === (pagination?.pages || 1)}
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min((pagination?.pages || 1), (prev?.page || 1) + 1) }))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
