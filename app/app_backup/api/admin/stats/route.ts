
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/auth";
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await requireAuth([Role.SUPER_ADMIN]);

    console.log('🔵 [ADMIN-STATS] Fetching admin statistics for user:', user.email);

    // Fetch all statistics in parallel for better performance
    const [
      totalUsers,
      totalVenues,
      totalBookings,
      activeSubscriptions,
      recentBookings,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.venue.count(),
      prisma.booking.count(),
      prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          venue: {
            select: { name: true },
          },
        },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    // Get booking trends for the last 30 days with better error handling
    let bookingTrends: any[] = [];
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const trends = await prisma.booking.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        _count: {
          id: true,
        },
      });
      
      bookingTrends = trends as any[];
    } catch (trendsError) {
      console.error('🔴 [ADMIN-STATS] Error fetching booking trends:', trendsError);
      // Continue without trends data rather than failing completely
      bookingTrends = [];
    }

    const response = {
      stats: {
        totalUsers,
        totalVenues,
        totalBookings,
        activeSubscriptions,
      },
      recentBookings,
      recentUsers,
      bookingTrends,
    };

    console.log('🟢 [ADMIN-STATS] Successfully fetched admin statistics');
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('🔴 [ADMIN-STATS] Error fetching admin statistics:', error);
    
    // Handle authentication/authorization errors with proper status codes
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      );
    }

    if (error.message === 'Account is inactive') {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Handle database errors
    if (error.code && error.code.startsWith('P')) {
      console.error('🔴 [ADMIN-STATS] Database error:', error.code, error.message);
      return NextResponse.json(
        { error: 'Database error occurred while fetching statistics' },
        { status: 500 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
