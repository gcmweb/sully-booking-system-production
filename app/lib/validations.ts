
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

// Venue validations - FIXED: Added all required fields from Prisma schema
export const venueSchema = z.object({
  name: z.string().min(1, 'Venue name is required'),
  description: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'), // ADDED: Required by Prisma
  zipCode: z.string().min(1, 'ZIP code is required'), // ADDED: Required by Prisma
  postcode: z.string().optional(), // Made optional since zipCode is the main postal field
  country: z.string().default('US'), // Added with default
  phone: z.string().optional(), // Made optional to match Prisma schema
  email: z.string().email('Invalid email address').optional(), // Made optional to match Prisma
  website: z.string().url().optional().or(z.literal('')),
  cuisine: z.string().optional(),
  venueType: z.nativeEnum(VenueType).optional(), // Made optional to match Prisma
  capacity: z.number().min(1, 'Capacity must be at least 1').optional(), // Made optional to match Prisma
  pricePerHour: z.number().min(0, 'Price per hour must be positive').optional(),
  currency: z.string().default('USD'),
  featured: z.boolean().default(false),
  amenities: z.array(z.string()).default([]), // ADDED: Required by Prisma as String[]
  isActive: z.boolean().default(true),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  slug: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
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
  number: z.string().min(1, 'Table number is required'),
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

// Widget validations - Updated to match Prisma schema fields
export const widgetSchema = z.object({
  name: z.string().min(1, 'Widget name is required'),
  isActive: z.boolean().default(true),
  theme: z.string().default('default'),
  primaryColor: z.string().default('#3B82F6'),
  backgroundColor: z.string().default('#FFFFFF'),
  textColor: z.string().default('#1F2937'),
  allowGuestBooking: z.boolean().default(true),
  requirePhone: z.boolean().default(false),
  maxAdvanceBooking: z.number().default(30),
  minAdvanceBooking: z.number().default(1),
  embedCode: z.string().optional(),
  customCss: z.string().optional(),
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
