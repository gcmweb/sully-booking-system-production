'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Star, Clock, Users, Search, Filter, ChevronRight, Building, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../components/auth-provider';

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
}

export default function HomePage() {
  const { user } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [priceRange, setPriceRange] = useState('');

  useEffect(() => {
    fetchFeaturedVenues();
  }, []);

  const fetchFeaturedVenues = async () => {
    try {
      const response = await fetch('/api/venues/featured');
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

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venue.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !selectedCity || venue.city === selectedCity;
    const matchesPrice = !priceRange || (
      priceRange === 'low' && venue.pricePerHour <= 50 ||
      priceRange === 'medium' && venue.pricePerHour > 50 && venue.pricePerHour <= 100 ||
      priceRange === 'high' && venue.pricePerHour > 100
    );
    
    return matchesSearch && matchesCity && matchesPrice;
  });

  const cities = [...new Set(venues.map(venue => venue.city))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <CalendarDays className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Sully
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/venues" className="text-gray-700 hover:text-orange-600 transition-colors">
                Browse Venues
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-orange-600 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-orange-600 transition-colors">
                Contact
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
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Event Venue
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover and book amazing venues for your events, meetings, and celebrations. 
              From intimate gatherings to grand celebrations, we have the perfect space for you.
            </p>
            
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 border border-orange-100"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                
                <Button className="h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium">
                  Search Venues
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Venues */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Venues
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium venues perfect for any occasion
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVenues.map((venue, index) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
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
                    
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
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
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
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
                      
                      <Link href={`/book/${venue.id}`}>
                        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white group">
                          Book Now
                          <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredVenues.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No venues found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all venues</p>
              <Link href="/venues">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  Browse All Venues
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Sully?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make venue booking simple, secure, and stress-free
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: 'Easy Discovery',
                description: 'Find the perfect venue with our advanced search and filtering options'
              },
              {
                icon: CalendarDays,
                title: 'Instant Booking',
                description: 'Book your venue instantly with real-time availability and secure payments'
              },
              {
                icon: Sparkles,
                title: 'Premium Quality',
                description: 'All venues are verified and meet our high standards for quality and service'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
                    <feature.icon className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Host Your Event?
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Join thousands of satisfied customers who trust Sully for their venue needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/venues">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
                  Browse All Venues
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
                  List Your Venue
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <CalendarDays className="h-8 w-8 text-orange-500" />
                <span className="text-2xl font-bold">Sully</span>
              </div>
              <p className="text-gray-400">
                The easiest way to find and book amazing venues for your events.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/venues" className="hover:text-white transition-colors">Browse Venues</Link></li>
                <li><Link href="/auth/register" className="hover:text-white transition-colors">List Your Venue</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Sully. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}