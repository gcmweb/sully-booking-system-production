'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "../../../components/auth-provider";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Building, ArrowLeft, Plus, Eye, Edit, ToggleLeft, ToggleRight, MapPin, Users, DollarSign, Calendar } from 'lucide-react';
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
  _count: {
    bookings: number;
  };
}

export default function DashboardVenuesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [updatingVenue, setUpdatingVenue] = useState<string | null>(null);

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
    try {
      const response = await fetch('/api/dashboard/venues');
      if (response.ok) {
        const data = await response.json();
        setVenues(data.venues);
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
      const response = await fetch(`/api/venues/${venueId}`, {
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
                <Building className="h-6 w-6 text-orange-600" />
                <span className="text-xl font-semibold text-gray-900">My Venues</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Dashboard</Badge>
              <Link href="/dashboard/venues/new">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Venue
                </Button>
              </Link>
            </div>
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
            My Venues
          </h1>
          <p className="text-gray-600">
            Manage your venue listings and track their performance
          </p>
        </motion.div>

        {/* Venues Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
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
            <Card>
              <CardContent className="text-center py-12">
                <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No venues yet</h3>
                <p className="text-gray-600 mb-6">Start by adding your first venue to begin accepting bookings.</p>
                <Link href="/dashboard/venues/new">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Venue
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue, index) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
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
                    
                    <CardContent className="p-6 flex flex-col flex-1">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {venue.name}
                        </h3>
                        
                        <div className="flex items-center text-gray-600 mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{venue.city}, {venue.state}</span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {venue.description}
                        </p>
                        
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
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{venue._count.bookings} bookings</span>
                          </div>
                          <span>Added {formatDate(venue.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/venues/${venue.id}`}>
                            <Button size="sm" variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          
                          <Link href={`/dashboard/venues/${venue.id}/edit`}>
                            <Button size="sm" variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                        </div>
                        
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
                              Disable
                            </>
                          ) : (
                            <>
                              <ToggleRight className="h-4 w-4 mr-1" />
                              Enable
                            </>
                          )}
                        </Button>
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