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
  featured: boolean;
}

async function getFeaturedVenues(): Promise<Venue[]> {
  try {
    const venues = await prisma.venue.findMany({
      where: {
        isActive: true,
        featured: true,
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
      location: `${venue.city}, ${venue.state}`,
      priceRange: venue.pricePerHour ? `$${venue.pricePerHour}/hour` : 'Contact for pricing',
      cuisine: venue.cuisine ? [venue.cuisine] : [],
      images: Array.isArray(venue.images) ? venue.images as string[] : [],
      rating: venue.rating || 0,
      reviewCount: venue.reviewCount || 0,
      isActive: venue.isActive,
      featured: venue.featured,
    }));
  } catch (error) {
    console.error('Error fetching featured venues:', error);
    return [];
  }
}

export default async function HomePage() {
  const featuredVenues = await getFeaturedVenues();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Find Your Perfect Venue
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover and book amazing venues for your events, meetings, and special occasions.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Featured Venues Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Venues
          </h2>
          
          <Suspense fallback={<LoadingSpinner text="Loading venues..." />}>
            {featuredVenues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredVenues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={{
                      id: venue.id,
                      name: venue.name,
                      description: venue.description,
                      address: venue.location,
                      city: venue.location.split(',')[0] || '',
                      postcode: '',
                      venueType: venue.cuisine[0] || 'General',
                      capacity: 50, // Default capacity
                    }}
                    onBook={(venueId) => {
                      // Handle booking logic
                      console.log('Booking venue:', venueId);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No featured venues available at the moment.
                </p>
              </div>
            )}
          </Suspense>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our Platform?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Search</h3>
              <p className="text-gray-600">
                Find the perfect venue with our advanced search and filtering options.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Booking</h3>
              <p className="text-gray-600">
                Book your venue instantly with our secure and reliable booking system.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted Partners</h3>
              <p className="text-gray-600">
                All our venues are verified and trusted partners ensuring quality service.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}