
import { z } from 'zod';
import { Role, VenueType, ServiceType, BookingStatus, SubscriptionPlan } from '@prisma/client';

// Auth validations
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

// Venue validations
export const venueSchema = z.object({
  name: z.string().min(1, 'Venue name is required'),
  description: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email address'),
  website: z.string().url().optional().or(z.literal('')),
  cuisine: z.string().optional(),
  venueType: z.nativeEnum(VenueType),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
});

// Booking validations
export const bookingSchema = z.object({
  venueId: z.string().min(1, 'Venue is required'),
  serviceType: z.nativeEnum(ServiceType),
  date: z.string().min(1, 'Date is required'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  partySize: z.number().min(1, 'Party size must be at least 1'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(1, 'Phone number is required'),
  specialRequests: z.string().optional(),
  tableId: z.string().optional(),
});

// Table validations
export const tableSchema = z.object({
  name: z.string().min(1, 'Table name is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  description: z.string().optional(),
});

// Event validations
export const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  price: z.number().min(0, 'Price must be positive').optional(),
});

// Availability validations
export const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string().min(1, 'Open time is required'),
  closeTime: z.string().min(1, 'Close time is required'),
  isOpen: z.boolean(),
});

// Opening hours validations
export const openingHoursSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  name: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const venueOpeningHoursSchema = z.object({
  openingHours: z.array(openingHoursSchema),
});

// Widget validations
export const widgetSchema = z.object({
  name: z.string().min(1, 'Widget name is required'),
  settings: z.object({
    theme: z.string().optional(),
    primaryColor: z.string().optional(),
    showLogo: z.boolean().optional(),
    allowedServices: z.array(z.nativeEnum(ServiceType)).optional(),
  }).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VenueInput = z.infer<typeof venueSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type TableInput = z.infer<typeof tableSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type OpeningHoursInput = z.infer<typeof openingHoursSchema>;
export type VenueOpeningHoursInput = z.infer<typeof venueOpeningHoursSchema>;
export type WidgetInput = z.infer<typeof widgetSchema>;
