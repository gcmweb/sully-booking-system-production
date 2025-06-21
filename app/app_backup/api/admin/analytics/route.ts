
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/auth";
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth([Role.SUPER_ADMIN]);
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    let previousStartDate = new Date();

    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(now.getDate() - 60);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        previousStartDate.setDate(now.getDate() - 180);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        previousStartDate.setFullYear(now.getFullYear() - 2);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(now.getDate() - 60);
    }

    // Get current period stats
    const [
      totalUsers,
      totalVenues,
      totalBookings,
      totalRevenue,
      currentUsers,
      currentVenues,
      currentBookings,
      currentRevenue,
      previousUsers,
      previousVenues,
      previousBookings,
      previousRevenue,
    ] = await Promise.all([
      // Total counts
      prisma.user.count(),
      prisma.venue.count(),
      prisma.booking.count(),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      // Current period
      prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.venue.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.booking.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
      }),
      // Previous period
      prisma.user.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate,
          },
        },
      }),
      prisma.venue.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate,
          },
        },
      }),
      prisma.booking.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate,
          },
        },
      }),
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: previousStartDate,
            lt: startDate,
          },
        },
        _sum: { amount: true },
      }),
    ]);

    // Calculate growth percentages
    const userGrowth = previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers) * 100 : 0;
    const venueGrowth = previousVenues > 0 ? ((currentVenues - previousVenues) / previousVenues) * 100 : 0;
    const bookingGrowth = previousBookings > 0 ? ((currentBookings - previousBookings) / previousBookings) * 100 : 0;
    
    const prevRevenueAmount = Number(previousRevenue._sum.amount || 0);
    const currRevenueAmount = Number(currentRevenue._sum.amount || 0);
    const revenueGrowth = prevRevenueAmount > 0 
      ? ((currRevenueAmount - prevRevenueAmount) / prevRevenueAmount) * 100 
      : 0;

    // Get user registrations over time
    const userRegistrations = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    // Format user registrations data
    const formattedUserRegistrations = userRegistrations.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count.id,
    }));

    // Get booking trends
    const bookingTrends = await prisma.booking.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    // Format booking trends data
    const formattedBookingTrends = bookingTrends.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      bookings: item._count.id,
      revenue: 0, // Would need to join with payments for actual revenue
    }));

    // Get venue types distribution
    const venueTypes = await prisma.venue.groupBy({
      by: ['venueType'],
      _count: { id: true },
    });

    const totalVenueCount = venueTypes.reduce((sum, item) => sum + item._count.id, 0);
    const formattedVenueTypes = venueTypes.map(item => ({
      type: item.venueType.replace('_', ' '),
      count: item._count.id,
      percentage: Math.round((item._count.id / totalVenueCount) * 100),
    }));

    // Get subscription stats
    const subscriptionStats = await prisma.subscription.groupBy({
      by: ['plan'],
      _count: { id: true },
      _sum: { bookingsUsed: true },
    });

    const formattedSubscriptionStats = subscriptionStats.map(item => ({
      plan: item.plan,
      count: item._count.id,
      revenue: item.plan === 'PREMIUM' ? item._count.id * 29 : 0, // Mock revenue calculation
    }));

    // Get top venues
    const topVenues = await prisma.venue.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        owner: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        bookings: {
          _count: 'desc',
        },
      },
    });

    const formattedTopVenues = topVenues.map(venue => ({
      id: venue.id,
      name: venue.name,
      bookings: venue._count.bookings,
      revenue: venue._count.bookings * 25, // Mock revenue calculation
      owner: `${venue.owner.firstName} ${venue.owner.lastName}`,
    }));

    return NextResponse.json({
      overview: {
        totalUsers,
        totalVenues,
        totalBookings,
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        userGrowth: Math.round(userGrowth * 100) / 100,
        venueGrowth: Math.round(venueGrowth * 100) / 100,
        bookingGrowth: Math.round(bookingGrowth * 100) / 100,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      },
      userRegistrations: formattedUserRegistrations,
      bookingTrends: formattedBookingTrends,
      venueTypes: formattedVenueTypes,
      subscriptionStats: formattedSubscriptionStats,
      topVenues: formattedTopVenues,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
