
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../../lib/db";
import { requireAuth } from "../../../../../lib/auth";
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const venueId = params.id;
    const { searchParams } = new URL(request.url);
    const timeRange = parseInt(searchParams.get('timeRange') || '30');

    // Verify venue ownership or admin access
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        owner: true,
      },
    });

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (user.role !== Role.SUPER_ADMIN && venue.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    // Build where clause for venue-specific data
    const whereClause = {
      venueId: venueId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Get basic metrics
    const totalBookings = await prisma.booking.count({ where: whereClause });
    
    const revenueResult = await prisma.payment.aggregate({
      where: {
        booking: whereClause,
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
    });
    const totalRevenue = Number(revenueResult._sum.amount || 0);

    const partySizeResult = await prisma.booking.aggregate({
      where: whereClause,
      _avg: {
        partySize: true,
      },
    });
    const averagePartySize = Number(partySizeResult._avg.partySize || 0);

    // Get booking trends (daily data) - using Prisma aggregation instead of raw SQL
    const bookingTrends = await prisma.booking.findMany({
      where: whereClause,
      include: {
        payments: {
          where: {
            status: 'COMPLETED',
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Group by date
    const trendsByDate = bookingTrends.reduce((acc: any, booking) => {
      const dateKey = booking.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          bookings: 0,
          revenue: 0,
          totalPartySize: 0,
          count: 0,
        };
      }
      acc[dateKey].bookings += 1;
      acc[dateKey].revenue += booking.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      acc[dateKey].totalPartySize += booking.partySize;
      acc[dateKey].count += 1;
      return acc;
    }, {});

    const formattedTrends = Object.values(trendsByDate).map((trend: any) => ({
      date: trend.date,
      bookings: trend.bookings,
      revenue: trend.revenue,
      avgPartySize: trend.count > 0 ? trend.totalPartySize / trend.count : 0,
    }));

    // Get service type breakdown
    const serviceTypeData = await prisma.booking.groupBy({
      by: ['serviceType'],
      where: whereClause,
      _count: {
        serviceType: true,
      },
      _sum: {
        partySize: true,
      },
    });

    const serviceTypeBreakdown = serviceTypeData.map(item => ({
      type: item.serviceType,
      count: item._count.serviceType,
      totalGuests: item._sum.partySize || 0,
      percentage: (item._count.serviceType / totalBookings) * 100,
    }));

    // Get peak hours - using Prisma aggregation
    const allBookings = await prisma.booking.findMany({
      where: whereClause,
      select: {
        time: true,
        partySize: true,
      },
    });

    // Group by hour
    const hourlyData = allBookings.reduce((acc: any, booking) => {
      const hour = booking.time!.split(':')[0];
      if (!acc[hour]) {
        acc[hour] = {
          hour: `${hour}:00`,
          bookings: 0,
          totalPartySize: 0,
          count: 0,
        };
      }
      acc[hour].bookings += 1;
      acc[hour].totalPartySize += booking.partySize;
      acc[hour].count += 1;
      return acc;
    }, {});

    const peakHours = Object.values(hourlyData)
      .map((hour: any) => ({
        hour: hour.hour,
        bookings: hour.bookings,
        avgPartySize: hour.count > 0 ? hour.totalPartySize / hour.count : 0,
      }))
      .sort((a: any, b: any) => b.bookings - a.bookings);

    // Get booking status breakdown
    const statusData = await prisma.booking.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        status: true,
      },
    });

    const statusBreakdown = statusData.map(item => ({
      status: item.status,
      count: item._count.status,
      percentage: (item._count.status / totalBookings) * 100,
    }));

    // Get table utilization - using Prisma aggregation
    const tables = await prisma.table.findMany({
      where: {
        venueId: venueId,
      },
      include: {
        bookings: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    const tableUtilization = tables.map(table => {
      const bookings = table.bookings.length;
      const avgPartySize = bookings > 0 
        ? table.bookings.reduce((sum, booking) => sum + booking.partySize, 0) / bookings 
        : 0;
      const utilizationRate = table.capacity > 0 ? (avgPartySize / table.capacity) * 100 : 0;
      
      return {
        tableName: table.name,
        capacity: table.capacity,
        bookings,
        avgPartySize,
        utilizationRate,
      };
    }).sort((a, b) => b.bookings - a.bookings);

    // Get customer insights - using Prisma aggregation
    const customerBookings = await prisma.booking.findMany({
      where: whereClause,
      select: {
        customerEmail: true,
        customerName: true,
        partySize: true,
        createdAt: true,
      },
    });

    // Group by customer email
    const customerData = customerBookings.reduce((acc: any, booking) => {
      const email = booking.customerEmail;
      if (!acc[email]) {
        acc[email] = {
          email,
          name: booking.customerName,
          totalBookings: 0,
          totalGuests: 0,
          lastBooking: booking.createdAt,
        };
      }
      acc[email].totalBookings += 1;
      acc[email].totalGuests += booking.partySize;
      if (booking.createdAt > acc[email].lastBooking) {
        acc[email].lastBooking = booking.createdAt;
      }
      return acc;
    }, {});

    const customerInsights = Object.values(customerData)
      .filter((customer: any) => customer.totalBookings > 1)
      .map((customer: any) => ({
        email: customer.email,
        name: customer.name,
        totalBookings: customer.totalBookings,
        totalGuests: customer.totalGuests,
        avgPartySize: customer.totalGuests / customer.totalBookings,
        lastBooking: customer.lastBooking.toLocaleDateString(),
      }))
      .sort((a: any, b: any) => b.totalBookings - a.totalBookings)
      .slice(0, 10);

    // Get monthly comparison
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    const previousMonthStart = new Date(currentMonthStart);
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
    const previousMonthEnd = new Date(currentMonthStart);
    previousMonthEnd.setDate(previousMonthEnd.getDate() - 1);

    const currentMonthBookings = await prisma.booking.count({
      where: {
        venueId: venueId,
        createdAt: {
          gte: currentMonthStart,
        },
      },
    });

    const previousMonthBookings = await prisma.booking.count({
      where: {
        venueId: venueId,
        createdAt: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
    });

    const currentMonthRevenue = await prisma.payment.aggregate({
      where: {
        booking: {
          venueId: venueId,
          createdAt: {
            gte: currentMonthStart,
          },
        },
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
    });

    const previousMonthRevenue = await prisma.payment.aggregate({
      where: {
        booking: {
          venueId: venueId,
          createdAt: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
    });

    const bookingGrowth = previousMonthBookings > 0 
      ? ((currentMonthBookings - previousMonthBookings) / previousMonthBookings) * 100 
      : 0;

    const revenueGrowth = Number(previousMonthRevenue._sum.amount || 0) > 0
      ? ((Number(currentMonthRevenue._sum.amount || 0) - Number(previousMonthRevenue._sum.amount || 0)) / Number(previousMonthRevenue._sum.amount || 0)) * 100
      : 0;

    const monthlyComparison = {
      currentMonth: {
        bookings: currentMonthBookings,
        revenue: Number(currentMonthRevenue._sum.amount || 0),
      },
      previousMonth: {
        bookings: previousMonthBookings,
        revenue: Number(previousMonthRevenue._sum.amount || 0),
      },
      growth: {
        bookings: Math.round(bookingGrowth),
        revenue: Math.round(revenueGrowth),
      },
    };

    // Get busiest days of week - using Prisma aggregation
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayBookings = await prisma.booking.findMany({
      where: whereClause,
      select: {
        date: true,
        partySize: true,
      },
    });

    // Group by day of week
    const dayData = dayBookings.reduce((acc: any, booking) => {
      const dayOfWeek = booking.date.getDay();
      if (!acc[dayOfWeek]) {
        acc[dayOfWeek] = {
          day: dayNames[dayOfWeek],
          bookings: 0,
          totalPartySize: 0,
          count: 0,
        };
      }
      acc[dayOfWeek].bookings += 1;
      acc[dayOfWeek].totalPartySize += booking.partySize;
      acc[dayOfWeek].count += 1;
      return acc;
    }, {});

    const busiestDaysFormatted = Object.values(dayData)
      .map((day: any) => ({
        day: day.day,
        bookings: day.bookings,
        avgPartySize: day.count > 0 ? day.totalPartySize / day.count : 0,
      }))
      .sort((a: any, b: any) => b.bookings - a.bookings);

    return NextResponse.json({
      venue: {
        id: venue.id,
        name: venue.name,
        venueType: venue.venueType,
      },
      totalBookings,
      totalRevenue,
      averagePartySize,
      bookingTrends: formattedTrends.map(trend => ({
        date: new Date(trend.date).toLocaleDateString(),
        bookings: trend.bookings,
        revenue: trend.revenue,
        avgPartySize: trend.avgPartySize,
      })),
      serviceTypeBreakdown,
      statusBreakdown,
      peakHours,
      tableUtilization,
      customerInsights,
      busiestDays: busiestDaysFormatted,
      monthlyComparison,
    });
  } catch (error) {
    console.error('Venue analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venue analytics' },
      { status: 500 }
    );
  }
}
