
'use client';

import { useEffect, useState } from 'react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { MapPin, Search, Users, Star, Clock, Phone } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Venue {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  cuisine: string;
  venueType: string;
  capacity: number;
  headerImageUrl?: string;
  logoUrl?: string;
  branding: any;
  _count: {
    bookings: number;
  };
}

export default function BookVenuePage() {
  // Initialize all arrays with empty arrays to prevent undefined access
  const [venues, setVenues] = useState<Venue[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    city: 'all',
    venueType: 'all',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchVenues();
  }, [filters, pagination.page]);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.city && filters.city !== 'all' && { city: filters.city }),
        ...(filters.venueType && filters.venueType !== 'all' && { venueType: filters.venueType }),
      });

      const response = await fetch(`/api/public/venues?${params}`);
      if (response.ok) {
        const data = await response.json();
        
        // Comprehensive null/undefined checks with fallback arrays
        const safeVenues = Array.isArray(data?.venues) ? data.venues : [];
        const safeCities = Array.isArray(data?.cities) ? data.cities : [];
        
        setVenues(safeVenues);
        setCities(safeCities);
        setPagination(prev => ({
          ...prev,
          total: data?.pagination?.total || 0,
          pages: data?.pagination?.pages || 0,
        }));
      } else {
        console.error('Failed to fetch venues:', response.status, response.statusText);
        // Set fallback empty arrays on error
        setVenues([]);
        setCities([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          pages: 0,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch venues:', error);
      // Set fallback empty arrays on error
      setVenues([]);
      setCities([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
        pages: 0,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVenues();
  };

  const getVenueTypeLabel = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Ensure venues is always an array for safe operations
  const safeVenues = Array.isArray(venues) ? venues : [];
  const safeCities = Array.isArray(cities) ? cities : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Sully</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/my-bookings">
                <Button variant="ghost">My Bookings</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline">Venue Owner?</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find & Book Amazing
              <span className="text-blue-600"> Dining Experiences</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover restaurants, cafes, bars, and more. Book instantly with real-time availability.
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="mb-8">
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        placeholder="Search venues, cuisine, or location..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Cities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {safeCities.filter(city => city && typeof city === 'string' && city.trim() !== '').map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filters.venueType} onValueChange={(value) => handleFilterChange('venueType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                        <SelectItem value="CAFE">Cafe</SelectItem>
                        <SelectItem value="BAR">Bar</SelectItem>
                        <SelectItem value="PUB">Pub</SelectItem>
                        <SelectItem value="FINE_DINING">Fine Dining</SelectItem>
                        <SelectItem value="FAST_CASUAL">Fast Casual</SelectItem>
                        <SelectItem value="BAKERY">Bakery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full md:w-auto">
                    <Search className="h-4 w-4 mr-2" />
                    Search Venues
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Venues Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : safeVenues.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or browse all venues.</p>
                <Button 
                  onClick={() => {
                    setFilters({ search: '', city: 'all', venueType: 'all' });
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {pagination?.total || 0} Venues Found
                </h2>
                <p className="text-gray-600">
                  Page {pagination?.page || 1} of {pagination?.pages || 1}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {safeVenues.map((venue, index) => (
                  <motion.div
                    key={venue?.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg overflow-hidden">
                        {venue?.headerImageUrl ? (
                          <Image
                            src={venue.headerImageUrl}
                            alt={`${venue?.name || 'Venue'} header image`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <Badge variant="secondary" className="bg-white/90 text-gray-900">
                            {getVenueTypeLabel(venue?.venueType || 'UNKNOWN')}
                          </Badge>
                        </div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">4.5</span>
                            <span className="text-sm">({venue?._count?.bookings || 0} bookings)</span>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {venue?.name || 'Unknown Venue'}
                            </h3>
                            {venue?.cuisine && (
                              <p className="text-sm text-blue-600 font-medium">{venue.cuisine}</p>
                            )}
                          </div>
                          
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {venue?.description || 'Experience great food and atmosphere at this wonderful venue.'}
                          </p>
                          
                          <div className="flex items-center text-gray-500 text-sm">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{venue?.address || 'Unknown Address'}, {venue?.city || 'Unknown City'}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-500 text-sm">
                            <Users className="h-4 w-4 mr-1" />
                            <span>Capacity: {venue?.capacity || 'N/A'} guests</span>
                          </div>
                          
                          <div className="pt-2">
                            <Link href={`/book/${venue?.id || ''}`}>
                              <Button className="w-full group-hover:bg-blue-700 transition-colors">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {(pagination?.pages || 0) > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
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
            </>
          )}
        </div>
      </section>
    </div>
  );
}
