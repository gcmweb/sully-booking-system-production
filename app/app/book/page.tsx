'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Star, Clock, Users, Search, Filter, Building, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../components/auth-provider';

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
  amenities: string[];
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
}

export default function BookPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await fetch('/api/venues');
      if (response.ok) {
        const data = await response.json();
        setVenues(data.venues || []);
      }
    } catch (error) {
      console.error('Failed to fetch venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedVenues = venues
    .filter(venue => {
      if (!venue.isActive) return false;
      
      const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           venue.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           venue.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = !selectedCity || venue.city === selectedCity;
      const matchesPrice = !priceRange || (
        priceRange === 'low' && venue.pricePerHour <= 50 ||
        priceRange === 'medium' && venue.pricePerHour > 50 && venue.pricePerHour <= 100 ||
        priceRange === 'high' && venue.pricePerHour > 100
      );
      
      return matchesSearch && matchesCity && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.pricePerHour - b.pricePerHour;
        case 'price-high':
          return b.pricePerHour - a.pricePerHour;
        case 'capacity':
          return b.capacity - a.capacity;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const cities = [...new Set(venues.map(venue => venue.city))].sort();

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
              <Link href="/" className="flex items-center space-x-2">
                <CalendarDays className="h-8 w-8 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">Sully</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/my-bookings">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                      My Bookings
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
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
            Find Your Perfect Venue
          </h1>
          <p className="text-gray-600">
            Browse our collection of amazing venues for your next event
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8 border"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 bg-white"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 bg-white"
              >
                <option value="">Any Price</option>
                <option value="low">Under $50/hr</option>
                <option value="medium">$50-$100/hr</option>
                <option value="high">Over $100/hr</option>
              </select>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-12 px-4 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 bg-white"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="capacity">Capacity</option>
              <option value="rating">Rating</option>
            </select>
            
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCity('');
                setPriceRange('');
                setSortBy('name');
              }}
              variant="outline"
              className="h-12 border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              Clear Filters
            </Button>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-gray-600">
            {loading ? 'Loading venues...' : `${filteredAndSortedVenues.length} venue${filteredAndSortedVenues.length !== 1 ? 's' : ''} found`}
          </p>
        </motion.div>

        {/* Venues Grid */}
        {loading ? (
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
        ) : filteredAndSortedVenues.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No venues found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all venues</p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCity('');
                setPriceRange('');
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Clear All Filters
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedVenues.map((venue, index) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden h-full">
                  <div className="relative h-48 overflow-hidden">
                    {venue.images && venue.images.length > 0 ? (
                      <Image
                        src={venue.images[0]}
                        alt={venue.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                        <Building className="h-16 w-16 text-orange-400" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-orange-600 text-white">
                        ${venue.pricePerHour}/hr
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {venue.name}
                      </h3>
                      {venue.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{venue.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{venue.city}, {venue.state}</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                      {venue.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-sm">Up to {venue.capacity} guests</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm">Hourly</span>
                      </div>
                    </div>
                    
                    {venue.amenities && venue.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {venue.amenities.slice(0, 3).map((amenity) => (
                          <Badge key={amenity} variant="outline" className="text-xs border-orange-200 text-orange-700">
                            {amenity}
                          </Badge>
                        ))}
                        {venue.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                            +{venue.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <Link href={`/book/${venue.id}`} className="mt-auto">
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white group">
                        Book This Venue
                        <CalendarDays className="h-4 w-4 ml-2 group-hover:scale-110 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}