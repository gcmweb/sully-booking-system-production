import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const venueId = params.id;

    // Verify venue ownership
    const venue = await prisma.venue.findFirst({
      where: {
        id: venueId,
        userId: userId,
      },
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Get date range from query params
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Default to last 30 days if no date range provided
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const dateFilter = {
      gte: startDate ? new Date(startDate) : defaultStartDate,
      lte: endDate ? new Date(endDate) : defaultEndDate,
    };

    // Base where clause
    const whereClause = {
      venueId: venueId,
      createdAt: dateFilter,
    };

    // Get total bookings
    const totalBookings = await prisma.booking.count({
      where: whereClause,
    });

    // Get total revenue from completed payments
    const revenueResult = await prisma.payment.aggregate({
      where: {
        booking: {
          venueId: venueId,
          createdAt: dateFilter,
        },
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
    });
    const totalRevenue = Number(revenueResult._sum.amount || 0);

    // Get average party size
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
      const dateKey = (booking.date ?? booking.startTime).toISOString().split('T')[0];
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
      acc[dateKey].totalPartySize += booking.partySize || 0;
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
    const serviceTypeBreakdown = await prisma.booking.groupBy({
      by: ['serviceType'],
      where: whereClause,
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
    });

    const formattedServiceTypes = serviceTypeBreakdown.map((item) => ({
      serviceType: item.serviceType || 'Unknown',
      bookings: item._count.id,
      revenue: Number(item._sum.totalAmount || 0),
    }));

    // Get peak hours analysis
    const allBookings = await prisma.booking.findMany({
      where: whereClause,
      select: {
        startTime: true,
        time: true,
        partySize: true,
      },
    });

    // Group by hour
    const hourlyData = allBookings.reduce((acc: any, booking) => {
      const hour = booking.startTime.getHours().toString();
      if (!acc[hour]) {
        acc[hour] = {
          hour: `${hour}:00`,
          bookings: 0,
          totalPartySize: 0,
          count: 0,
        };
      }
      acc[hour].bookings += 1;
      acc[hour].totalPartySize += booking.partySize || 0;
      acc[hour].count += 1;
      return acc;
    }, {});

    const peakHours = Object.values(hourlyData)
      .map((hour: any) => ({
        hour: hour.hour,
        bookings: hour.bookings,
        avgPartySize: hour.count > 0 ? hour.totalPartySize / hour.count : 0,
      }))
      .sort((a: any, b: any) => b.bookings - a.bookings)
      .slice(0, 5);

    // Get customer insights
    const customerInsights = await prisma.booking.groupBy({
      by: ['customerEmail'],
      where: whereClause,
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    const topCustomers = customerInsights.map((customer) => ({
      email: customer.customerEmail,
      bookings: customer._count.id,
      totalSpent: Number(customer._sum.totalAmount || 0),
    }));

    // Get booking status breakdown
    const statusBreakdown = await prisma.booking.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    const formattedStatusBreakdown = statusBreakdown.map((status) => ({
      status: status.status,
      count: status._count.id,
    }));

    // Get conversion rate (completed vs total bookings)
    const completedBookings = await prisma.booking.count({
      where: {
        ...whereClause,
        status: 'CONFIRMED',
      },
    });

    const conversionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

    // Get average booking value
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Get repeat customer rate
    const repeatCustomers = await prisma.booking.groupBy({
      by: ['customerEmail'],
      where: whereClause,
      having: {
        customerEmail: {
          _count: {
            gt: 1,
          },
        },
      },
      _count: {
        customerEmail: true,
      },
    });

    const uniqueCustomers = await prisma.booking.groupBy({
      by: ['customerEmail'],
      where: whereClause,
      _count: {
        customerEmail: true,
      },
    });

    const repeatCustomerRate = uniqueCustomers.length > 0 
      ? (repeatCustomers.length / uniqueCustomers.length) * 100 
      : 0;

    // Get monthly comparison (current vs previous period)
    const previousPeriodStart = new Date(dateFilter.gte);
    const previousPeriodEnd = new Date(dateFilter.gte);
    const daysDiff = Math.ceil((dateFilter.lte.getTime() - dateFilter.gte.getTime()) / (1000 * 60 * 60 * 24));
    previousPeriodStart.setDate(previousPeriodStart.getDate() - daysDiff);

    const previousPeriodBookings = await prisma.booking.count({
      where: {
        venueId: venueId,
        createdAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd,
        },
      },
    });

    const previousPeriodRevenue = await prisma.payment.aggregate({
      where: {
        booking: {
          venueId: venueId,
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd,
          },
        },
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
    });

    const bookingGrowth = previousPeriodBookings > 0 
      ? ((totalBookings - previousPeriodBookings) / previousPeriodBookings) * 100 
      : 0;

    const revenueGrowth = Number(previousPeriodRevenue._sum.amount || 0) > 0 
      ? ((totalRevenue - Number(previousPeriodRevenue._sum.amount || 0)) / Number(previousPeriodRevenue._sum.amount || 0)) * 100 
      : 0;

    // Get day of week analysis
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayBookings = await prisma.booking.findMany({
      where: whereClause,
      select: {
        date: true,
        startTime: true,
        time: true,
        partySize: true,
      },
    });

    // Group by day of week
    const dayData = dayBookings.reduce((acc: any, booking) => {
      const dayOfWeek = (booking.date ?? booking.startTime).getDay();
      if (!acc[dayOfWeek]) {
        acc[dayOfWeek] = {
          day: dayNames[dayOfWeek],
          bookings: 0,
          totalPartySize: 0,
          count: 0,
        };
      }
      acc[dayOfWeek].bookings += 1;
      acc[dayOfWeek].totalPartySize += booking.partySize || 0;
      acc[dayOfWeek].count += 1;
      return acc;
    }, {});

    const dayOfWeekAnalysis = Object.values(dayData).map((day: any) => ({
      day: day.day,
      bookings: day.bookings,
      avgPartySize: day.count > 0 ? day.totalPartySize / day.count : 0,
    }));

    // Format trends data for chart
    const chartData = formattedTrends.map((trend) => ({
      date: new Date(trend.date).toLocaleDateString(),
      bookings: trend.bookings,
      revenue: trend.revenue,
      avgPartySize: Number(trend.avgPartySize.toFixed(1)),
    }));

    return NextResponse.json({
      summary: {
        totalBookings,
        totalRevenue,
        averagePartySize: Number(averagePartySize.toFixed(1)),
        conversionRate: Number(conversionRate.toFixed(1)),
        avgBookingValue: Number(avgBookingValue.toFixed(2)),
        repeatCustomerRate: Number(repeatCustomerRate.toFixed(1)),
        bookingGrowth: Number(bookingGrowth.toFixed(1)),
        revenueGrowth: Number(revenueGrowth.toFixed(1)),
      },
      trends: chartData,
      serviceTypes: formattedServiceTypes,
      peakHours,
      topCustomers,
      statusBreakdown: formattedStatusBreakdown,
      dayOfWeekAnalysis,
      dateRange: {
        start: dateFilter.gte.toISOString(),
        end: dateFilter.lte.toISOString(),
      },
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
