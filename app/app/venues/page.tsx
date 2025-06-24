
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { CalendarDays, MapPin, Phone, Mail, Globe, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Venue {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string | null;
  cuisine: string | null;
  venueType: string;
  logoUrl: string | null;
  headerImageUrl: string | null;
  isActive: boolean;
  images: Array<{
    id: string;
    url: string;
    alt?: string;
  }>;
}

const venueTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'CAFE', label: 'Cafe' },
  { value: 'BAR', label: 'Bar' },
  { value: 'PUB', label: 'Pub' },
  { value: 'FOOD_TRUCK', label: 'Food Truck' },
  { value: 'FINE_DINING', label: 'Fine Dining' },
  { value: 'FAST_CASUAL', label: 'Fast Casual' },
  { value: 'BAKERY', label: 'Bakery' },
  { value: 'OTHER', label: 'Other' },
];

export default function VenuesDirectoryPage() {
  // Initialize all arrays with empty arrays to prevent undefined access
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    filterVenues();
  }, [venues, searchTerm, selectedType, selectedCity]);

  const fetchVenues = async () => {
    try {
      const response = await fetch('/api/public/venues');
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
    } finally {
      setLoading(false);
    }
  };

  const filterVenues = () => {
    // Ensure venues is always an array for safe operations
    const safeVenues = Array.isArray(venues) ? venues : [];
    let filtered = safeVenues.filter(venue => venue?.isActive);

    if (searchTerm) {
      filtered = filtered.filter(venue =>
        venue?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue?.cuisine?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(venue => venue?.venueType === selectedType);
    }

    if (selectedCity !== 'all') {
      filtered = filtered.filter(venue => venue?.city === selectedCity);
    }

    setFilteredVenues(Array.isArray(filtered) ? filtered : []);
  };

  // Ensure safe array operations for unique cities
  const safeVenues = Array.isArray(venues) ? venues : [];
  const uniqueCities = Array.from(new Set(safeVenues.map(venue => venue?.city).filter(Boolean))).sort();
  const safeFilteredVenues = Array.isArray(filteredVenues) ? filteredVenues : [];

  if (loading) {
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
            <Link href="/" className="flex items-center space-x-2">
              <CalendarDays className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">Sully</span>
            </Link>
            <nav className="flex space-x-4">
              <Link href="/venues" className="text-orange-600 font-medium">
                Browse Venues
              </Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                Venue Owner?
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Venues
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find and book tables at the best restaurants, cafes, and bars in your area
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Venue Type" />
              </SelectTrigger>
              <SelectContent>
                {venueTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {uniqueCities.filter(city => city && typeof city === 'string').map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center text-sm text-gray-600">
              <span>{safeFilteredVenues.length} venues found</span>
            </div>
          </div>
        </motion.div>

        {/* Venues Grid */}
        {safeFilteredVenues.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No venues found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or browse all venues
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeFilteredVenues.map((venue, index) => (
              <motion.div
                key={venue?.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow overflow-hidden h-full">
                  {/* Venue Header Image */}
                  <div className="relative h-48 bg-gray-100">
                    {(() => {
                      // Priority: header image > gallery images > logo > fallback
                      let imageUrl = null;
                      let imageAlt = venue?.name || 'Venue';
                      
                      if (venue?.headerImageUrl) {
                        imageUrl = venue.headerImageUrl;
                        imageAlt = `${venue?.name || 'Venue'} header image`;
                      } else if (venue?.images && venue.images.length > 0) {
                        imageUrl = venue.images[0].url;
                        imageAlt = venue.images[0].alt || venue?.name || 'Venue';
                      } else if (venue?.logoUrl) {
                        imageUrl = venue.logoUrl;
                        imageAlt = `${venue?.name || 'Venue'} logo`;
                      }
                      
                      return imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={imageAlt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          onError={(e) => {
                            // Hide broken images and show fallback
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-bg') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null;
                    })()}
                    <div className="fallback-bg h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200" style={{ display: 'none' }}>
                      <CalendarDays className="h-12 w-12 text-orange-400" />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                    
                    {/* Venue Type Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-800">
                        {venueTypes.find(t => t.value === venue?.venueType)?.label || venue?.venueType || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      {venue?.logoUrl && (
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-white shadow-sm flex-shrink-0">
                          <Image
                            src={venue.logoUrl}
                            alt={`${venue?.name || 'Venue'} logo`}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{venue?.name || 'Unknown Venue'}</CardTitle>
                        <CardDescription className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{venue?.city || 'Unknown City'}</span>
                        </CardDescription>
                      </div>
                    </div>
                    
                    {venue?.cuisine && (
                      <Badge variant="outline" className="w-fit">
                        {venue.cuisine}
                      </Badge>
                    )}
                  </CardHeader>
                  
                  <CardContent className="flex-1">
                    {venue?.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {venue.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{venue?.address || 'No address'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{venue?.phone || 'No phone'}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link href={`/widget/${venue?.id || ''}`} className="flex-1">
                        <Button className="w-full">
                          Book Now
                        </Button>
                      </Link>
                      {venue?.website && (
                        <Button variant="outline" size="icon" asChild>
                          <a href={venue.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
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
