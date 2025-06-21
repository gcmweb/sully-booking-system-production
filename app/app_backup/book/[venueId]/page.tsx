
'use client';

import { useEffect, useState } from 'react';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { CalendarDays, Users, Clock, MapPin, Phone, Mail, Star, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "../../../hooks/use-toast";
import { motion } from 'framer-motion';

interface Venue {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  venueType: string;
  cuisine?: string;
  capacity?: number;
  logoUrl?: string;
  headerImageUrl?: string;
  images?: Array<{
    id: string;
    url: string;
    alt?: string;
    type: string;
  }>;
  tables?: Array<{
    id: string;
    name: string;
    capacity: number;
  }>;
  services?: Array<{
    id: string;
    type: string;
    name: string;
    description: string;
  }>;
  events?: Array<{
    id: string;
    name: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
    price: number;
  }>;
  bookingCount?: number;
}

interface AvailabilityData {
  timeSlots: string[];
  availableTables?: Array<{
    time: string;
    tables: Array<{
      id: string;
      name: string;
      capacity: number;
    }>;
  }>;
}

export default function VenueBookingPage({ params }: { params: { venueId: string } }) {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityData>({ timeSlots: [] });
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    date: '',
    time: '',
    partySize: '2',
    serviceType: 'DINE_IN',
    tableId: '',
    specialRequests: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchVenue();
  }, [params.venueId]);

  useEffect(() => {
    if (formData.date && formData.serviceType && formData.partySize) {
      fetchAvailability();
    }
  }, [formData.date, formData.serviceType, formData.partySize]);

  const fetchVenue = async () => {
    try {
      const response = await fetch(`/api/public/venues/${params.venueId}`);
      if (response.ok) {
        const data = await response.json();
        setVenue(data.venue);
      } else {
        toast({
          title: 'Venue not found',
          description: 'The venue you are looking for does not exist or is not available.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch venue:', error);
      toast({
        title: 'Error',
        description: 'Failed to load venue information.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    setLoadingAvailability(true);
    try {
      const params = new URLSearchParams({
        date: formData.date,
        serviceType: formData.serviceType,
        partySize: formData.partySize,
      });

      const response = await fetch(`/api/public/venues/${venue?.id}/availability?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAvailability(data || { timeSlots: [] });
      } else {
        // Fallback to default time slots if API doesn't exist
        const defaultTimeSlots = [
          '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
          '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
        ];
        setAvailability({ timeSlots: defaultTimeSlots });
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      // Provide default time slots on error
      const defaultTimeSlots = [
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
      ];
      setAvailability({ timeSlots: defaultTimeSlots });
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          venueId: params.venueId,
          partySize: parseInt(formData.partySize),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      toast({
        title: 'Booking confirmed!',
        description: data.message,
      });

      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        date: '',
        time: '',
        partySize: '2',
        serviceType: 'DINE_IN',
        tableId: '',
        specialRequests: '',
      });
      setAvailability({ timeSlots: [] });
    } catch (error: any) {
      toast({
        title: 'Booking failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Venue not found
            </h3>
            <p className="text-gray-600 mb-4">
              The venue you're looking for doesn't exist or is not available for bookings.
            </p>
            <Link href="/book">
              <Button>Browse All Venues</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const getVenueTypeLabel = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case 'DINE_IN': return 'Dine In';
      case 'TAKEAWAY': return 'Takeaway';
      case 'DELIVERY': return 'Delivery';
      case 'EVENT': return 'Event';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/book" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to venues</span>
            </Link>
            <Link href="/" className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Sully</span>
            </Link>
            <Link href="/my-bookings">
              <Button variant="ghost">My Bookings</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Venue Information */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg overflow-hidden">
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
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide broken images and show fallback
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null;
                  })()}
                  
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary">
                      {getVenueTypeLabel(venue.venueType)}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.5</span>
                      <span className="text-sm">({venue.bookingCount || 0} bookings)</span>
                    </div>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-2xl">{venue.name}</CardTitle>
                  {venue.cuisine && (
                    <p className="text-blue-600 font-medium">{venue.cuisine}</p>
                  )}
                  <CardDescription className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{venue.address}, {venue.city}</span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {venue.description && (
                    <p className="text-gray-600 mb-4">{venue.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {venue.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{venue.phone}</span>
                      </div>
                    )}
                    {venue.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{venue.email}</span>
                      </div>
                    )}
                    {venue.capacity && (
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>Capacity: {venue.capacity} guests</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Services */}
            {Array.isArray(venue.services) && venue.services.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Available Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {venue.services.map(service => (
                        <div key={service.id} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium">{getServiceTypeLabel(service.type)}</p>
                            {service.description && (
                              <p className="text-sm text-gray-600">{service.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Upcoming Events */}
            {Array.isArray(venue.events) && venue.events.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {venue.events.map(event => (
                        <div key={event.id} className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-medium">{event.name}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(event.date).toLocaleDateString()} • {event.startTime} - {event.endTime}
                          </p>
                          {event.price && (
                            <p className="text-sm font-medium text-green-600">£{event.price}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Make a Reservation</CardTitle>
                  <CardDescription>
                    Book your table at {venue.name} with real-time availability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Your Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="customerName">Full Name *</Label>
                          <Input
                            id="customerName"
                            name="customerName"
                            placeholder="John Doe"
                            value={formData.customerName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customerEmail">Email *</Label>
                          <Input
                            id="customerEmail"
                            name="customerEmail"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.customerEmail}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerPhone">Phone Number *</Label>
                        <Input
                          id="customerPhone"
                          name="customerPhone"
                          type="tel"
                          placeholder="+44 7123 456789"
                          value={formData.customerPhone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Booking Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Date *</Label>
                          <Input
                            id="date"
                            name="date"
                            type="date"
                            min={minDate}
                            value={formData.date}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="partySize">Party Size *</Label>
                          <Select value={formData.partySize} onValueChange={(value) => handleSelectChange('partySize', value)} required>
                            <SelectTrigger>
                              <Users className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="Guests" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 20 }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="serviceType">Service Type *</Label>
                          <Select value={formData.serviceType} onValueChange={(value) => handleSelectChange('serviceType', value)} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.isArray(venue.services) && venue.services.length > 0 ? (
                                venue.services.map(service => (
                                  <SelectItem key={service.type} value={service.type}>
                                    {getServiceTypeLabel(service.type)}
                                  </SelectItem>
                                ))
                              ) : (
                                <>
                                  <SelectItem value="DINE_IN">Dine In</SelectItem>
                                  <SelectItem value="TAKEAWAY">Takeaway</SelectItem>
                                  <SelectItem value="DELIVERY">Delivery</SelectItem>
                                  <SelectItem value="EVENT">Event</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Time Selection */}
                    {formData.date && formData.serviceType && formData.partySize && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Available Times</h3>
                        {loadingAvailability ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        ) : !Array.isArray(availability.timeSlots) || availability.timeSlots.length === 0 ? (
                          <Card className="border-orange-200 bg-orange-50">
                            <CardContent className="pt-6">
                              <p className="text-orange-800">
                                No available times for the selected date and party size. Please try a different date or contact the venue directly.
                              </p>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {availability.timeSlots.map(time => (
                              <Button
                                key={time}
                                type="button"
                                variant={formData.time === time ? "default" : "outline"}
                                onClick={() => handleSelectChange('time', time)}
                                className="text-sm"
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Table Selection for Dine-in */}
                    {formData.serviceType === 'DINE_IN' && formData.time && Array.isArray(availability.availableTables) && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Select Table (Optional)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Button
                            type="button"
                            variant={formData.tableId === '' ? "default" : "outline"}
                            onClick={() => handleSelectChange('tableId', '')}
                            className="justify-start"
                          >
                            Any Available Table
                          </Button>
                          {availability.availableTables
                            .find(slot => slot.time === formData.time)
                            ?.tables?.map(table => (
                              <Button
                                key={table.id}
                                type="button"
                                variant={formData.tableId === table.id ? "default" : "outline"}
                                onClick={() => handleSelectChange('tableId', table.id)}
                                className="justify-start"
                              >
                                {table.name} (Seats {table.capacity})
                              </Button>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Special Requests */}
                    <div className="space-y-2">
                      <Label htmlFor="specialRequests">Special Requests</Label>
                      <Textarea
                        id="specialRequests"
                        name="specialRequests"
                        placeholder="Any dietary requirements, allergies, or special occasions..."
                        value={formData.specialRequests}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={submitting || !formData.time}
                    >
                      {submitting ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
