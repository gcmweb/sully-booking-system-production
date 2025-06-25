import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/venues/featured - Get featured venues (simplified version)
export async function GET() {
  try {
    // Return mock data for now to ensure the app works
    const mockVenues = [
      {
        id: '1',
        name: 'The Grand Ballroom',
        description: 'Elegant venue perfect for weddings and corporate events',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        pricePerHour: 150,
        capacity: 200,
        images: ['https://images.unsplash.com/photo-1519167758481-83f29c8e8d4b?w=800'],
        amenities: ['WiFi', 'Parking', 'Catering'],
        rating: 4.8,
        reviewCount: 124
      },
      {
        id: '2',
        name: 'Rooftop Garden',
        description: 'Beautiful outdoor space with city views',
        address: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        pricePerHour: 120,
        capacity: 150,
        images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800'],
        amenities: ['Outdoor', 'Bar', 'Sound System'],
        rating: 4.6,
        reviewCount: 89
      },
      {
        id: '3',
        name: 'Modern Conference Center',
        description: 'State-of-the-art facility for business meetings',
        address: '789 Business Blvd',
        city: 'Chicago',
        state: 'IL',
        pricePerHour: 80,
        capacity: 100,
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
        amenities: ['AV Equipment', 'WiFi', 'Coffee Service'],
        rating: 4.7,
        reviewCount: 156
      }
    ];

    return NextResponse.json({
      success: true,
      venues: mockVenues,
      meta: {
        count: mockVenues.length,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    // Log error server-side only, not to client console
    if (typeof window === 'undefined') {
      console.error('Server error in featured venues API:', error);
    }
    
    return NextResponse.json(
      {
        success: false,
        error: {
          type: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch featured venues',
        },
        venues: [],
      },
      { status: 500 }
    );
  }
}