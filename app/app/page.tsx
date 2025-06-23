import { Suspense } from 'react';
import { VenueCard } from '@/components/VenueCard';
import { SearchBar } from '@/components/SearchBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { prisma } from '@/lib/prisma';

interface Venue {
  id: string;
  name: string;
  description: string;
  location: string;
  priceRange: string;
  cuisine: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
}

async function getFeaturedVenues(): Promise<Venue[]> {
  try {
    const venues = await prisma.venue.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      take: 6,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return venues.map(venue => ({
      id: venue.id,
      name: venue.name,
      description: venue.description || '',
      location: venue.location,
      priceRange: venue.priceRange || '$$',
      cuisine: Array.isArray(venue.cuisine) ? venue.cuisine as string[] : [],
      images: Array.isArray(venue.images) ? venue.images as string[] : [],
      rating: venue.rating || 0,
      reviewCount: venue.reviewCount || 0,
      isActive: venue.isActive,
      isFeatured: venue.isFeatured,
    }));
  } catch (error) {
    console.error('Error fetching featured venues:', error);
    return [];
  }
}

function FeaturedVenues() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <FeaturedVenuesContent />
    </Suspense>
  );
}

async function FeaturedVenuesContent() {
  const venues = await getFeaturedVenues();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {venues.length > 0 ? (
        venues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500">No featured venues available at the moment.</p>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Perfect Venue
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Discover and book amazing venues for your special events
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Featured Venues Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Venues
            </h2>
            <p className="text-lg text-gray-600">
              Handpicked venues that offer exceptional experiences
            </p>
          </div>
          <FeaturedVenues />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Sully Booking?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">Simple and secure booking process with instant confirmation</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive pricing with no hidden fees</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Venues</h3>
              <p className="text-gray-600">Carefully curated venues that meet our high standards</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}