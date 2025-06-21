
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "../../../../components/auth-provider";
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Switch } from "../../../../components/ui/switch";
import { CalendarDays, ArrowLeft, Save, Settings, Users, MapPin, Phone, Mail, Globe, Clock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from "../../../../hooks/use-toast";
import OpeningHoursManager from "../../../../components/opening-hours-manager";
import VenueImageManager from "../../../../components/venue-image-manager";

interface Venue {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  postcode: string;
  phone: string;
  email: string;
  website: string | null;
  cuisine: string | null;
  venueType: string;
  capacity: number;
  isActive: boolean;
  logoUrl: string | null;
  headerImageUrl: string | null;
  subscription: {
    plan: string;
    bookingsUsed: number;
    bookingsLimit: number | null;
  };
  _count: {
    bookings: number;
    tables: number;
  };
}

interface OpeningHour {
  id?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  name?: string;
  isActive: boolean;
}

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

export default function VenueDetailsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const venueId = params.id as string;

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loadingVenue, setLoadingVenue] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
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
    isActive: true,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && venueId) {
      fetchVenue();
    }
  }, [user, venueId]);

  const fetchVenue = async () => {
    try {
      const response = await fetch(`/api/venues/${venueId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setVenue(data.venue);
        setFormData({
          name: data.venue.name || '',
          description: data.venue.description || '',
          address: data.venue.address || '',
          city: data.venue.city || '',
          postcode: data.venue.postcode || '',
          phone: data.venue.phone || '',
          email: data.venue.email || '',
          website: data.venue.website || '',
          cuisine: data.venue.cuisine || '',
          venueType: data.venue.venueType || '',
          capacity: data.venue.capacity?.toString() || '',
          isActive: data.venue.isActive,
        });

        // Fetch opening hours
        fetchOpeningHours();
      } else if (response.status === 404) {
        toast({
          title: 'Venue not found',
          description: 'The venue you are looking for does not exist.',
          variant: 'destructive',
        });
        router.push('/dashboard/venues');
      } else {
        console.error('Failed to fetch venue:', response.status);
        toast({
          title: 'Error',
          description: 'Failed to load venue details.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Network error fetching venue:', error);
      toast({
        title: 'Error',
        description: 'Network error while loading venue details.',
        variant: 'destructive',
      });
    } finally {
      setLoadingVenue(false);
    }
  };

  const fetchOpeningHours = async () => {
    try {
      const response = await fetch(`/api/venues/${venueId}/opening-hours`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOpeningHours(data.openingHours || []);
      }
    } catch (error) {
      console.error('Failed to fetch opening hours:', error);
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

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isActive: checked,
    });
  };

  const saveOpeningHours = async () => {
    if (!openingHours || openingHours.length === 0) {
      toast({
        title: 'No opening hours to save',
        description: 'Please add some opening hours before saving.',
        variant: 'destructive',
      });
      return;
    }

    setSavingHours(true);
    console.log('🔵 [VENUE_EDIT] Saving opening hours separately:', openingHours);

    try {
      const hoursResponse = await fetch(`/api/venues/${venueId}/opening-hours`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          openingHours: openingHours,
        }),
      });

      if (hoursResponse.ok) {
        const hoursData = await hoursResponse.json();
        console.log('🟢 [VENUE_EDIT] Opening hours saved successfully:', hoursData);
        
        // Refresh opening hours data to ensure consistency
        await fetchOpeningHours();
        
        toast({
          title: 'Opening hours saved!',
          description: 'Your opening hours have been updated successfully.',
        });
      } else {
        const errorText = await hoursResponse.text();
        console.error('🔴 [VENUE_EDIT] Failed to save opening hours:', hoursResponse.status, errorText);
        
        toast({
          title: 'Failed to save opening hours',
          description: 'There was an error saving your opening hours. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (hoursError) {
      console.error('🔴 [VENUE_EDIT] Network error saving opening hours:', hoursError);
      toast({
        title: 'Network error',
        description: 'Failed to save opening hours due to network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingHours(false);
      console.log('🔵 [VENUE_EDIT] Opening hours save operation completed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔵 [VENUE_EDIT] Form submission started');
    setSaving(true);

    try {
      // Update venue details
      console.log('🔵 [VENUE_EDIT] Updating venue details:', formData);
      const response = await fetch(`/api/venues/${venueId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🟢 [VENUE_EDIT] Venue updated successfully:', data.venue);
        setVenue(data.venue);

        toast({
          title: 'Venue updated!',
          description: 'Your venue details have been updated successfully.',
        });
        
        console.log('🟢 [VENUE_EDIT] Form submission completed successfully');
      } else {
        const error = await response.json();
        console.error('🔴 [VENUE_EDIT] Venue update failed:', error);
        throw new Error(error.error || 'Failed to update venue');
      }
    } catch (error: any) {
      console.error('🔴 [VENUE_EDIT] Form submission error:', error);
      toast({
        title: 'Failed to update venue',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
      console.log('🔵 [VENUE_EDIT] Form submission ended');
    }
  };

  if (loading || loadingVenue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Venue not found</h2>
          <p className="text-gray-600 mb-4">The venue you are looking for does not exist.</p>
          <Link href="/dashboard/venues">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Venues
            </Button>
          </Link>
        </div>
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
              <Badge variant="secondary">Venue Management</Badge>
            </div>
            <Link href="/dashboard/venues">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Venues
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{venue.name}</h1>
              <p className="text-gray-600">
                Manage your venue details and settings
              </p>
            </div>
            <Badge variant={venue.isActive ? 'default' : 'secondary'} className="text-sm">
              {venue.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <CalendarDays className="h-4 w-4 ml-auto text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{venue._count?.bookings || 0}</div>
              <p className="text-xs text-muted-foreground">
                {venue.subscription?.bookingsUsed || 0}/{venue.subscription?.bookingsLimit || '∞'} this period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tables</CardTitle>
              <Users className="h-4 w-4 ml-auto text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{venue._count?.tables || 0}</div>
              <p className="text-xs text-muted-foreground">
                Capacity: {venue.capacity} guests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              <Settings className="h-4 w-4 ml-auto text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{venue.subscription?.plan || 'Unknown'}</div>
              <p className="text-xs text-muted-foreground">
                Current plan
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Venue Details Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Venue Details</CardTitle>
              <CardDescription>
                Update your venue information and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Venue Name *</Label>
                      <Input
                        id="name"
                        name="name"
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
                        value={formData.capacity}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="isActive">Venue is active and accepting bookings</Label>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Location
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      name="address"
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
                        value={formData.postcode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
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
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Link href="/dashboard/venues">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button type="submit" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Opening Hours Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Opening Hours</span>
                  </CardTitle>
                  <CardDescription>
                    Set multiple time slots for each day of the week. Perfect for lunch and dinner services.
                  </CardDescription>
                </div>
                <Button
                  onClick={saveOpeningHours}
                  disabled={savingHours || saving}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{savingHours ? 'Saving...' : 'Save Opening Hours'}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <OpeningHoursManager
                openingHours={openingHours}
                onChange={setOpeningHours}
                disabled={saving || savingHours}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Venue Images Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8"
        >
          <VenueImageManager
            venueId={venueId}
            currentLogo={venue.logoUrl || undefined}
            currentHeaderImage={venue.headerImageUrl || undefined}
            disabled={saving || savingHours}
          />
        </motion.div>
      </div>
    </div>
  );
}
