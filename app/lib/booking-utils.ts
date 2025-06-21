
import { prisma } from './db';
import { ServiceType, BookingStatus } from '@prisma/client';

export async function checkAvailability(
  venueId: string,
  date: Date,
  time: string,
  partySize: number,
  serviceType: ServiceType,
  tableId?: string
): Promise<{ available: boolean; reason?: string }> {
  // Check venue opening hours for the day
  const dayOfWeek = date.getDay();
  const openingHours = await prisma.venueOpeningHours.findMany({
    where: {
      venueId,
      dayOfWeek,
      isActive: true,
    },
    orderBy: { openTime: 'asc' }
  });

  if (openingHours.length === 0) {
    return { available: false, reason: 'Venue is closed on this day' };
  }

  // Check if time is within any of the opening hour slots
  const [hours, minutes] = time.split(':').map(Number);
  const bookingTime = hours * 60 + minutes;
  
  let isWithinOpeningHours = false;
  for (const slot of openingHours) {
    const [openHours, openMinutes] = slot.openTime.split(':').map(Number);
    const [closeHours, closeMinutes] = slot.closeTime.split(':').map(Number);
    const openTime = openHours * 60 + openMinutes;
    const closeTime = closeHours * 60 + closeMinutes;

    if (bookingTime >= openTime && bookingTime <= closeTime) {
      isWithinOpeningHours = true;
      break;
    }
  }

  if (!isWithinOpeningHours) {
    return { available: false, reason: 'Time is outside operating hours' };
  }

  // For table bookings, check table availability
  if (serviceType === ServiceType.DINE_IN && tableId) {
    const table = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table || !table.isActive) {
      return { available: false, reason: 'Table is not available' };
    }

    if (table.capacity < partySize) {
      return { available: false, reason: 'Table capacity is insufficient' };
    }

    // Check for conflicting bookings (2-hour window)
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2);

    const conflictingBookings = await prisma.booking.findMany({
      where: {
        tableId,
        date: {
          gte: new Date(date.toDateString()),
          lt: new Date(new Date(date.toDateString()).getTime() + 24 * 60 * 60 * 1000),
        },
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
    });

    for (const booking of conflictingBookings) {
      const bookingStart = new Date(booking.date);
      const [bookingHours, bookingMinutes] = booking.time.split(':').map(Number);
      bookingStart.setHours(bookingHours, bookingMinutes, 0, 0);
      const bookingEnd = new Date(bookingStart);
      bookingEnd.setMinutes(bookingEnd.getMinutes() + booking.duration);

      // Check for overlap
      if (startTime < bookingEnd && endTime > bookingStart) {
        return { available: false, reason: 'Table is already booked for this time' };
      }
    }
  }

  // Check venue capacity for non-table bookings
  if (serviceType === ServiceType.DINE_IN && !tableId) {
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return { available: false, reason: 'Venue not found' };
    }

    // Get all bookings for the same time slot
    const existingBookings = await prisma.booking.findMany({
      where: {
        venueId,
        date: {
          gte: new Date(date.toDateString()),
          lt: new Date(new Date(date.toDateString()).getTime() + 24 * 60 * 60 * 1000),
        },
        time,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
    });

    const totalPartySize = existingBookings.reduce((sum, booking) => sum + booking.partySize, 0);
    
    if (totalPartySize + partySize > venue.capacity) {
      return { available: false, reason: 'Venue capacity exceeded' };
    }
  }

  return { available: true };
}

export async function getAvailableTables(
  venueId: string,
  date: Date,
  time: string,
  partySize: number
): Promise<any[]> {
  const tables = await prisma.table.findMany({
    where: {
      venueId,
      isActive: true,
      capacity: {
        gte: partySize,
      },
    },
  });

  const availableTables = [];

  for (const table of tables) {
    const availability = await checkAvailability(
      venueId,
      date,
      time,
      partySize,
      ServiceType.DINE_IN,
      table.id
    );

    if (availability.available) {
      availableTables.push(table);
    }
  }

  return availableTables;
}

export async function getAvailableTimeSlots(
  venueId: string,
  date: Date,
  serviceType: ServiceType
): Promise<string[]> {
  const dayOfWeek = date.getDay();
  const openingHours = await prisma.venueOpeningHours.findMany({
    where: {
      venueId,
      dayOfWeek,
      isActive: true,
    },
    orderBy: { openTime: 'asc' }
  });

  if (openingHours.length === 0) {
    return [];
  }

  const timeSlots: string[] = [];

  // Generate time slots for each opening hour period
  for (const slot of openingHours) {
    const [openHours, openMinutes] = slot.openTime.split(':').map(Number);
    const [closeHours, closeMinutes] = slot.closeTime.split(':').map(Number);

    let currentHour = openHours;
    let currentMinute = openMinutes;

    while (currentHour < closeHours || (currentHour === closeHours && currentMinute < closeMinutes)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Avoid duplicates if time slots overlap between periods
      if (!timeSlots.includes(timeString)) {
        timeSlots.push(timeString);
      }

      currentMinute += 30; // 30-minute intervals
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour++;
      }
    }
  }

  // Sort time slots chronologically
  return timeSlots.sort();
}

// Helper function to get opening hours for display
export async function getVenueOpeningHours(venueId: string): Promise<any[]> {
  const openingHours = await prisma.venueOpeningHours.findMany({
    where: {
      venueId,
      isActive: true,
    },
    orderBy: [
      { dayOfWeek: 'asc' },
      { openTime: 'asc' }
    ]
  });

  return openingHours;
}

// Helper function to check if venue is open at a specific time
export async function isVenueOpenAt(
  venueId: string,
  date: Date,
  time: string
): Promise<boolean> {
  const dayOfWeek = date.getDay();
  const [hours, minutes] = time.split(':').map(Number);
  const checkTime = hours * 60 + minutes;

  const openingHours = await prisma.venueOpeningHours.findMany({
    where: {
      venueId,
      dayOfWeek,
      isActive: true,
    }
  });

  for (const slot of openingHours) {
    const [openHours, openMinutes] = slot.openTime.split(':').map(Number);
    const [closeHours, closeMinutes] = slot.closeTime.split(':').map(Number);
    const openTime = openHours * 60 + openMinutes;
    const closeTime = closeHours * 60 + closeMinutes;

    if (checkTime >= openTime && checkTime <= closeTime) {
      return true;
    }
  }

  return false;
}
