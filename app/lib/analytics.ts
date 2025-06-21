
import { prisma } from './db';

export async function recordAnalytic(
  venueId: string,
  metric: string,
  value: number,
  metadata?: any
) {
  return prisma.analytics.create({
    data: {
      venueId,
      date: new Date(),
      metric,
      value,
      metadata,
    },
  });
}

export async function getBookingAnalytics(venueId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const bookings = await prisma.booking.findMany({
    where: {
      venueId,
      createdAt: {
        gte: startDate,
      },
    },
    include: {
      payments: true,
    },
  });

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;
  const totalRevenue = bookings.reduce((sum, booking) => {
    const bookingRevenue = booking.payments.reduce((paymentSum, payment) => {
      return paymentSum + (payment.status === 'COMPLETED' ? Number(payment.amount) : 0);
    }, 0);
    return sum + bookingRevenue;
  }, 0);

  // Group bookings by date
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const date = booking.date.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group bookings by service type
  const bookingsByService = bookings.reduce((acc, booking) => {
    acc[booking.serviceType] = (acc[booking.serviceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    totalRevenue,
    bookingsByDate,
    bookingsByService,
    conversionRate: totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0,
  };
}

export async function getRevenueAnalytics(venueId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const payments = await prisma.payment.findMany({
    where: {
      booking: {
        venueId,
      },
      status: 'COMPLETED',
      createdAt: {
        gte: startDate,
      },
    },
    include: {
      booking: true,
    },
  });

  const revenueByDate = payments.reduce((acc, payment) => {
    const date = payment.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + Number(payment.amount);
    return acc;
  }, {} as Record<string, number>);

  const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const averageBookingValue = payments.length > 0 ? totalRevenue / payments.length : 0;

  return {
    totalRevenue,
    averageBookingValue,
    revenueByDate,
    totalTransactions: payments.length,
  };
}
