
'use client';

import { useEffect, useState } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { CalendarDays, Star, ArrowRight, MapPin, Users, Phone, TrendingUp, CheckCircle, Clock, LayoutDashboard, LogOut } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from "../components/auth-provider";

interface FeaturedVenue {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  postcode: string;
  phone: string;
  email: string;
  venueType: string;
  capacity: number;
  logoUrl?: string;
  headerImageUrl?: string;
  images: Array<{
    id: string;
    url: string;
    alt?: string;
  }>;
  owner: {
    firstName: string;
    lastName: string;
  };
}

export default function HomePage() {
  const [featuredVenues, setFeaturedVenues] = useState<FeaturedVenue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const { user, loading: authLoading, logout } = useAuth();

  useEffect(() => {
    fetchFeaturedVenues();
  }, []);

  const fetchFeaturedVenues = async () => {
    try {
      const response = await fetch('/api/venues/featured');
      if (response.ok) {
        const data = await response.json();
        setFeaturedVenues(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch featured venues:', error);
    } finally {
      setLoadingVenues(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <CalendarDays className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Sully</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/venues">
                <Button variant="ghost">Browse Venues</Button>
              </Link>
              {!authLoading && (
                <>
                  {user ? (
                    // Authenticated user navigation
                    <>
                      <Link href="/my-bookings">
                        <Button variant="ghost">My Bookings</Button>
                      </Link>
                      <Link href="/dashboard">
                        <Button variant="outline" className="flex items-center space-x-2">
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Button>
                      </Link>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">
                          Welcome, {user.firstName}!
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={logout}
                          className="flex items-center space-x-1"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </Button>
                      </div>
                    </>
                  ) : (
                    // Non-authenticated user navigation
                    <>
                      <Link href="/my-bookings">
                        <Button variant="ghost">My Bookings</Button>
                      </Link>
                      <Link href="/auth/login">
                        <Button variant="outline">Login</Button>
                      </Link>
                      <Link href="/auth/register">
                        <Button>Sign Up</Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">
              🚀 Complete Booking Management System
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Streamline Your
              <span className="text-blue-600"> Restaurant Bookings</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Powerful booking system for restaurants, cafes, bars, and food trucks. 
              Manage reservations, track analytics, and grow your business with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/venues">
                <Button size="lg" className="w-full sm:w-auto">
                  Find & Book Venues
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {!authLoading && (
                <Link href={user ? "/dashboard" : "/auth/register"}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    {user ? (
                      <>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Go to Dashboard
                      </>
                    ) : (
                      "Start Your Venue"
                    )}
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Venues Section */}
      {!loadingVenues && featuredVenues.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <Badge variant="secondary" className="mb-4">
                <Star className="h-4 w-4 mr-2 fill-current" />
                Featured Venues
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Discover Amazing Venues
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Handpicked restaurants, cafes, and bars offering exceptional dining experiences
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredVenues.map((venue, index) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
                      {(() => {
                        // Priority: header image > gallery images > logo > fallback
                        let imageUrl = null;
                        let imageAlt = venue.name;
                        
                        if (venue.headerImageUrl) {
                          imageUrl = venue.headerImageUrl;
                          imageAlt = `${venue.name} header image`;
                        } else if (venue.images && venue.images.length > 0) {
                          imageUrl = venue.images[0].url;
                          imageAlt = venue.images[0].alt || venue.name;
                        } else if (venue.logoUrl) {
                          imageUrl = venue.logoUrl;
                          imageAlt = `${venue.name} logo`;
                        }
                        
                        return imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={imageAlt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              // Hide broken images and show fallback
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null;
                      })()}
                      <div className="w-full h-full flex items-center justify-center" style={{ display: 'none' }}>
                        <div className="text-center">
                          <CalendarDays className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                          <p className="text-blue-600 font-medium">{venue.name}</p>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                            {venue.name}
                          </CardTitle>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {venue.city}, {venue.postcode}
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {venue.venueType.replace('_', ' ')}
                        </Badge>
                      </div>
                      {venue.description && (
                        <CardDescription className="line-clamp-2">
                          {venue.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            <span>Capacity: {venue.capacity}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            <span className="truncate">{venue.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>Managed by {venue.owner.firstName} {venue.owner.lastName}</span>
                        </div>
                        <Link href={`/book/${venue.id}`} className="block">
                          <Button className="w-full group-hover:bg-blue-700 transition-colors">
                            Book Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center mt-12"
            >
              <Link href="/venues">
                <Button variant="outline" size="lg">
                  View All Venues
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Bookings
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From table reservations to event management, Sully provides all the tools 
              your venue needs to succeed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade when you need more bookings
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="relative">
                <CardHeader>
                  <CardTitle className="text-2xl">Free Plan</CardTitle>
                  <div className="text-3xl font-bold">£0<span className="text-lg font-normal">/month</span></div>
                  <CardDescription>Perfect for small venues getting started</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Up to 50 bookings per month
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Basic booking management
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Email notifications
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Basic analytics
                    </li>
                  </ul>
                  <Link href={user ? "/dashboard" : "/auth/register"} className="block mt-6">
                    <Button className="w-full">
                      {user ? "Go to Dashboard" : "Get Started Free"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="relative border-blue-200 shadow-lg">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600">Most Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Pro Plan</CardTitle>
                  <div className="text-3xl font-bold">£30<span className="text-lg font-normal">/month</span></div>
                  <CardDescription>For growing restaurants and venues</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Unlimited bookings
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Advanced booking management
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      SMS & Email notifications
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Advanced analytics & reports
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Embeddable booking widgets
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Priority support
                    </li>
                  </ul>
                  <Link href={user ? "/dashboard/subscription" : "/auth/register"} className="block mt-6">
                    <Button className="w-full">
                      {user ? "Upgrade to Pro" : "Start Pro Trial"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <CalendarDays className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">Sully</span>
            </div>
            <div className="text-gray-400">
              © 2025 Sully Booking System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: 'Table Management',
    description: 'Organize tables, set capacity limits, and manage seating arrangements with ease.',
    icon: Users,
  },
  {
    title: 'Real-time Bookings',
    description: 'Accept bookings 24/7 with instant confirmation and availability checking.',
    icon: CalendarDays,
  },
  {
    title: 'Analytics Dashboard',
    description: 'Track booking trends, revenue, and customer insights with detailed reports.',
    icon: TrendingUp,
  },
  {
    title: 'Multi-Service Support',
    description: 'Handle dine-in, takeaway, delivery, and event bookings all in one place.',
    icon: Star,
  },
  {
    title: 'Embeddable Widgets',
    description: 'Add booking forms to your website with customizable iframe widgets.',
    icon: CheckCircle,
  },
  {
    title: 'Automated Notifications',
    description: 'Send confirmation emails and SMS reminders to customers automatically.',
    icon: ArrowRight,
  },
];
