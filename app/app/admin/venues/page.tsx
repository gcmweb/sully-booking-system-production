'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "../../../components/auth-provider";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { ArrowLeft, Building, Search, MapPin, Users, DollarSign, Eye, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useToast } from "../../../hooks/use-toast";

interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pricePerHour: number;
  capacity: number;
  images: string[];
  isActive: boolean;
  createdAt: string;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
  _count: {
    bookings: number;
  };
}

export default function AdminVenuesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingVenue, setUpdatingVenue] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'SUPER_ADMIN')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'SUPER_ADMIN') {
      fetchVenues();
    }
  }, [user, currentPage, searchTerm, cityFilter, statusFilter]);

  const fetchVenues = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(cityFilter && { city: cityFilter }),
        ...(statusFilter && { status: statusFilter }),
      });
      
      const response = await fetch(`/api/admin/venues?${params}`);
      if (response.ok) {
        const data = await response.json();
        setVenues(data.venues);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch venues:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const toggleVenueStatus = async (venueId: string, currentStatus: boolean) => {
    setUpdatingVenue(venueId);
    try {
      const response = await fetch(`/api/admin/venues/${venueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      
      if (response.ok) {
        setVenues(venues.map(v => 
          v.id === venueId ? { ...v, isActive: !currentStatus } : v
        ));
        toast({
          title: 'Venue updated',
          description: `Venue has been ${!currentStatus ? 'activated' : 'deactivated'}.`,
        });
      } else {
        throw new Error('Failed to update venue');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update venue status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingVenue(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const cities = Array.from(new Set(venues.map(venue => venue.city))).sort();

  if (loading || !user || user.role !== 'SUPER_ADMIN') {
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
              <Link href="/admin" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Admin</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Building className="h-6 w-6 text-orange-600" />
                <span className="text-xl font-semibold text-gray-900">Venue Management</span>
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
            Venue Management
          </h1>
          <p className="text-gray-600">
            Manage all venues, their status, and venue owners
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6 border"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 bg-white"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <Button 
              onClick={() => {
                setSearchTerm('');
                setCityFilter('');
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

        {/* Venues Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {loadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : venues.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No venues found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <Card key={venue.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    {venue.images && venue.images.length > 0 ? (
                      <Image
                        src={venue.images[0]}
                        alt={venue.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                        <Building className="h-16 w-16 text-orange-400" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge variant={venue.isActive ? "default" : "secondary"} className={venue.isActive ? "bg-green-600" : ""}>
                        {venue.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {venue.name}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{venue.city}, {venue.state}</span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {venue.description}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>${venue.pricePerHour}/hr</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{venue.capacity} guests</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {venue.owner.firstName} {venue.owner.lastName}
                          </p>
                          <p className="text-xs text-gray-600">{venue.owner.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{venue._count.bookings} bookings</p>
                          <p className="text-xs text-gray-600">Added {formatDate(venue.createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/venue/${venue.id}`)}
                          className="border-orange-200 text-orange-700 hover:bg-orange-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        <Button
                          size="sm"
                          variant={venue.isActive ? "destructive" : "default"}
                          onClick={() => toggleVenueStatus(venue.id, venue.isActive)}
                          disabled={updatingVenue === venue.id}
                          className={venue.isActive ? '' : 'bg-green-600 hover:bg-green-700'}
                        >
                          {updatingVenue === venue.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : venue.isActive ? (
                            <>
                              <ToggleLeft className="h-4 w-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleRight className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
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