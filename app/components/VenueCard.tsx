import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Users, Star } from 'lucide-react';

interface VenueCardProps {
  venue: {
    id: string;
    name: string;
    description?: string;
    address: string;
    city: string;
    postcode: string;
    venueType: string;
    capacity: number;
    logoUrl?: string;
    headerImageUrl?: string;
    images?: Array<{
      id: string;
      url: string;
      alt?: string;
    }>;
  };
  onBook?: (venueId: string) => void;
}

export default function VenueCard({ venue, onBook }: VenueCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
        {venue.headerImageUrl || (venue.images && venue.images.length > 0) ? (
          <img
            src={venue.headerImageUrl || venue.images?.[0]?.url}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-600 font-medium">{venue.name}</p>
            </div>
          </div>
        )}
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
            <CardTitle className="text-xl hover:text-blue-600 transition-colors">
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
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>Capacity: {venue.capacity}</span>
          </div>
          <Button 
            className="w-full" 
            onClick={() => onBook?.(venue.id)}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}