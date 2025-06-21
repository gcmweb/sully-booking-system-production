
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { ArrowLeft, CalendarDays, AlertTriangle, Crown } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "../../../../hooks/use-toast";
import { useAuth } from "../../../../components/auth-provider";
import OpeningHoursManager from "../../../../components/opening-hours-manager";

const venueTypes = [
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

interface OpeningHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  name?: string;
  isActive: boolean;
}

interface VenueLimits {
  canCreateVenue: boolean;
  venuesUsed: number;
  venuesLimit: number | null;
  plan: string;
  message?: string;
}

export default function NewVenuePage() {
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    postcode: '',
    phone: '',
    email: '',
    website: '',
    cuisine: '',
    venueType: '',
    capacity: '',
  });
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([
    // Default opening hours (Monday-Friday 9-17)
    { dayOfWeek: 1, openTime: '09:00', closeTime: '17:00', name: '', isActive: true },
    { dayOfWeek: 2, openTime: '09:00', closeTime: '17:00', name: '', isActive: true },
    { dayOfWeek: 3, openTime: '09:00', closeTime: '17:00', name: '', isActive: true },
    { dayOfWeek: 4, openTime: '09:00', closeTime: '17:00', name: '', isActive: true },
    { dayOfWeek: 5, openTime: '09:00', closeTime: '17:00', name: '', isActive: true },
  ]);
  const [loading, setLoading] = useState(false);
  const [venueLimits, setVenueLimits] = useState<VenueLimits | null>(null);
  const [limitsLoading, setLimitsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchVenueLimits();
    }
  }, [user]);

  const fetchVenueLimits = async () => {
    try {
      const response = await fetch('/api/venues/limits', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setVenueLimits(data);
      } else {
        console.error('Failed to fetch venue limits:', response.status);
      }
    } catch (error) {
      console.error('Network error fetching venue limits:', error);
    } finally {
      setLimitsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      venueType: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First create the venue
      const venueResponse = await fetch('/api/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
        }),
      });

      if (!venueResponse.ok) {
        const error = await venueResponse.json();
        
        // Handle venue limit errors specifically
        if (venueResponse.status === 403 && error.error === 'Venue limit reached') {
          toast({
            title: 'Venue limit reached',
            description: error.message || 'You have reached your venue limit for your current plan.',
            variant: 'destructive',
          });
          return;
        }
        
        throw new Error(error.error || 'Failed to create venue');
      }

      const venueData = await venueResponse.json();
      const venueId = venueData.venue.id;

      // Then create the opening hours if any are defined
      if (openingHours.length > 0) {
        const hoursResponse = await fetch(`/api/venues/${venueId}/opening-hours`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            openingHours: openingHours,
          }),
        });

        if (!hoursResponse.ok) {
          console.warn('Failed to create opening hours, but venue was created successfully');
        }
      }

      toast({
        title: 'Venue created!',
        description: 'Your venue has been created successfully with opening hours.',
      });
      router.push('/dashboard/venues');
    } catch (error: any) {
      toast({
        title: 'Failed to create venue',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <CalendarDays className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">Sully</span>
              </Link>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Venue</h1>
          <p className="text-gray-600">
            Add your venue details to start accepting bookings
          </p>
        </div>

        {/* Venue Limits Warning */}
        {!limitsLoading && venueLimits && !venueLimits.canCreateVenue && (
          <Alert className="border-red-200 bg-red-50 mb-8">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">Cannot create venue</div>
                  <div className="text-sm">{venueLimits.message}</div>
                </div>
                <Button size="sm" className="ml-4">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Subscription Info */}
        {!limitsLoading && venueLimits && venueLimits.canCreateVenue && venueLimits.plan === 'FREE' && (
          <Alert className="border-blue-200 bg-blue-50 mb-8">
            <Crown className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">FREE Plan - {venueLimits.venuesUsed}/{venueLimits.venuesLimit} venues used</div>
                  <div className="text-sm">Upgrade to PAID plan to create up to 5 venues with premium features!</div>
                </div>
                <Button size="sm" variant="outline" className="ml-4">
                  <Crown className="h-4 w-4 mr-2" />
                  View Plans
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Venue Information</CardTitle>
            <CardDescription>
              Provide details about your venue to help customers find and book with you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Venue Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="The Golden Spoon"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venueType">Venue Type *</Label>
                  <Select value={formData.venueType} onValueChange={handleSelectChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select venue type" />
                    </SelectTrigger>
                    <SelectContent>
                      {venueTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your venue, atmosphere, and specialties..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cuisine">Cuisine Type</Label>
                  <Input
                    id="cuisine"
                    name="cuisine"
                    placeholder="Italian, British, Asian, etc."
                    value={formData.cuisine}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    placeholder="50"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Location</h3>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 High Street"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="London"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      name="postcode"
                      placeholder="SW1A 1AA"
                      value={formData.postcode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+44 20 7123 4567"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="info@goldenspoon.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://www.goldenspoon.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={loading || (venueLimits ? !venueLimits.canCreateVenue : false)}
                >
                  {loading ? 'Creating...' : 'Create Venue'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Opening Hours Section */}
        <div className="mt-8">
          <OpeningHoursManager
            openingHours={openingHours}
            onChange={setOpeningHours}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}
