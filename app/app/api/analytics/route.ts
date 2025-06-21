
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../lib/db";
import { requireAuth } from "../../../lib/auth";
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venueId');
    const timeRange = parseInt(searchParams.get('timeRange') || '30');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    // Build where clause based on user role and filters
    let whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (user.role === Role.VENUE_OWNER) {
      if (venueId) {
        // Verify venue ownership
        const venue = await prisma.venue.findUnique({
          where: { id: venueId, ownerId: user.id },
        });
        if (!venue) {
          return NextResponse.json(
            { error: 'Access denied' },
            { status: 403 }
          );
        }
        whereClause.venueId = venueId;
      } else {
        // Get all bookings for user's venues
        const userVenues = await prisma.venue.findMany({
          where: { ownerId: user.id },
          select: { id: true },
        });
        whereClause.venueId = {
          in: userVenues.map(v => v.id),
        };
      }
    } else if (user.role === Role.SUPER_ADMIN) {
      if (venueId) {
        whereClause.venueId = venueId;
      }
    }

    // Get basic metrics
    const totalBookings = await prisma.booking.count({ where: whereClause });
    
    const revenueResult = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        booking: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          ...(venueId ? { venueId } : {}),
          ...(user.role === Role.VENUE_OWNER && !venueId ? {
            venue: {
              ownerId: user.id,
            },
          } : {}),
        },
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

    // Get booking trends (daily data)
    let bookingTrendsQuery = `
      SELECT 
        DATE(date) as date,
        COUNT(*) as bookings,
        COALESCE(SUM(CASE WHEN p.status = 'COMPLETED' THEN p.amount ELSE 0 END), 0) as revenue
      FROM bookings b
      LEFT JOIN payments p ON b.id = p."bookingId"
      WHERE b."createdAt" >= $1 AND b."createdAt" <= $2
    `;
    
    const queryParams: any[] = [startDate, endDate];
    let paramIndex = 3;
    
    if (venueId) {
      bookingTrendsQuery += ` AND b."venueId" = $${paramIndex}`;
      queryParams.push(venueId);
      paramIndex++;
    } else if (user.role === Role.VENUE_OWNER) {
      bookingTrendsQuery += ` AND b."venueId" IN (SELECT id FROM venues WHERE "ownerId" = $${paramIndex})`;
      queryParams.push(user.id);
      paramIndex++;
    }
    
    bookingTrendsQuery += ` GROUP BY DATE(date) ORDER BY date`;
    
    const bookingTrends = await prisma.$queryRawUnsafe(bookingTrendsQuery, ...queryParams) as any[];

    // Get service type breakdown
    const serviceTypeData = await prisma.booking.groupBy({
      by: ['serviceType'],
      where: whereClause,
      _count: {
        serviceType: true,
      },
    });

    const serviceTypeBreakdown = serviceTypeData.map(item => ({
      type: item.serviceType,
      count: item._count.serviceType,
      percentage: (item._count.serviceType / totalBookings) * 100,
    }));

    // Get peak hours
    let peakHoursQuery = `
      SELECT 
        EXTRACT(HOUR FROM CAST(time AS TIME)) as hour,
        COUNT(*) as bookings
      FROM bookings
      WHERE "createdAt" >= $1 AND "createdAt" <= $2
    `;
    
    const peakHoursParams: any[] = [startDate, endDate];
    let peakParamIndex = 3;
    
    if (venueId) {
      peakHoursQuery += ` AND "venueId" = $${peakParamIndex}`;
      peakHoursParams.push(venueId);
      peakParamIndex++;
    } else if (user.role === Role.VENUE_OWNER) {
      peakHoursQuery += ` AND "venueId" IN (SELECT id FROM venues WHERE "ownerId" = $${peakParamIndex})`;
      peakHoursParams.push(user.id);
      peakParamIndex++;
    }
    
    peakHoursQuery += ` GROUP BY EXTRACT(HOUR FROM CAST(time AS TIME)) ORDER BY bookings DESC`;
    
    const peakHoursData = await prisma.$queryRawUnsafe(peakHoursQuery, ...peakHoursParams) as any[];

    const peakHours = peakHoursData.map(item => ({
      hour: `${item.hour}:00`,
      bookings: Number(item.bookings),
    }));

    // Get venue performance (if multiple venues)
    let venuePerformance: Array<{
      venueName: string;
      bookings: number;
      revenue: number;
      averageRating: number;
    }> = [];
    if (!venueId) {
      const venueData = await prisma.venue.findMany({
        where: user.role === Role.VENUE_OWNER ? { ownerId: user.id } : {},
        include: {
          _count: {
            select: {
              bookings: {
                where: {
                  createdAt: {
                    gte: startDate,
                    lte: endDate,
                  },
                },
              },
            },
          },
          bookings: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            include: {
              payments: {
                where: {
                  status: 'COMPLETED',
                },
              },
            },
          },
        },
      });

      venuePerformance = venueData.map(venue => ({
        venueName: venue.name,
        bookings: venue._count.bookings,
        revenue: venue.bookings.reduce((sum, booking) => 
          sum + booking.payments.reduce((paySum, payment) => paySum + Number(payment.amount), 0), 0
        ),
        averageRating: 4.5, // Mock rating - would come from reviews system
      }));
    }

    // Get monthly comparison
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    const previousMonthStart = new Date(currentMonthStart);
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
    const previousMonthEnd = new Date(currentMonthStart);
    previousMonthEnd.setDate(previousMonthEnd.getDate() - 1);

    const currentMonthBookings = await prisma.booking.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: currentMonthStart,
        },
      },
    });

    const previousMonthBookings = await prisma.booking.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
    });

    const growth = previousMonthBookings > 0 
      ? ((currentMonthBookings - previousMonthBookings) / previousMonthBookings) * 100 
      : 0;

    const monthlyComparison = {
      currentMonth: currentMonthBookings,
      previousMonth: previousMonthBookings,
      growth: Math.round(growth),
    };

    return NextResponse.json({
      totalBookings,
      totalRevenue,
      averagePartySize,
      bookingTrends: bookingTrends.map(trend => ({
        date: new Date(trend.date).toLocaleDateString(),
        bookings: Number(trend.bookings),
        revenue: Number(trend.revenue),
      })),
      serviceTypeBreakdown,
      peakHours,
      venuePerformance,
      monthlyComparison,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
