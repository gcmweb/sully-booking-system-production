'use client';

import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface SearchBarProps {
  onSearch?: (filters: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
}

interface SearchFilters {
  query: string;
  location?: string;
  date?: string;
  guests?: number;
}

function SearchBar({ 
  onSearch, 
  placeholder = "Search venues...", 
  showFilters = true 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState<number>(2);

  const handleSearch = () => {
    onSearch?.({
      query,
      location,
      date,
      guests
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Main search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="number"
                  placeholder="Guests"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 2)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                  min="1"
                  max="50"
                />
              </div>
            </div>
          )}

          {/* Search button */}
          <Button 
            onClick={handleSearch}
            className="w-full md:w-auto md:self-end"
            size="lg"
          >
            <Search className="h-4 w-4 mr-2" />
            Search Venues
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Named export for compatibility
export { SearchBar };
// Default export
export default SearchBar;