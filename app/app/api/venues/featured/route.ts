import { NextRequest, NextResponse } from 'next/server';
import { prisma, withDatabaseRetry } from "../../../../lib/db-enhanced";
import { logger } from "../../../../lib/logger";

export const dynamic = 'force-dynamic';

// GET /api/venues/featured - Get all featured venues (public endpoint)
export async function GET() {
  const startTime = Date.now();
  
  try {
    logger.info('Featured venues API called');

    const featuredVenues = await withDatabaseRetry(
      async () => {
        return await prisma.venue.findMany({
          where: {
            featured: true,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            address: true,
            city: true,
            postcode: true,
            phone: true,
            email: true,
            website: true,
            cuisine: true,
            venueType: true,
            logoUrl: true,
            headerImageUrl: true,
            isActive: true,
            featured: true,
            capacity: true,
            branding: true,
            images: {
              select: {
                id: true,
                url: true,
                alt: true,
              },
              where: { isActive: true },
              orderBy: { displayOrder: 'asc' },
            },
            owner: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: 3,
        });
      },
      3,
      'fetch featured venues'
    );

    const duration = Date.now() - startTime;
    
    logger.info('Featured venues fetched successfully', {
      count: featuredVenues.length,
      duration: `${duration}ms`,
    });

    return NextResponse.json({
      success: true,
      data: featuredVenues,
      meta: {
        count: featuredVenues.length,
        duration,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Error fetching featured venues', error, {
      duration: `${duration}ms`,
      endpoint: '/api/venues/featured',
    });

    // Determine error type and appropriate response
    let statusCode = 500;
    let errorMessage = 'Failed to fetch featured venues';
    let errorType = 'INTERNAL_SERVER_ERROR';

    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        errorType = 'DATABASE_CONNECTION_FAILED';
        errorMessage = 'Unable to connect to database';
      } else if (error.message.includes('authentication failed')) {
        errorType = 'DATABASE_AUTH_FAILED';
        errorMessage = 'Database authentication failed';
      } else if (error.message.includes('timeout')) {
        errorType = 'DATABASE_TIMEOUT';
        errorMessage = 'Database query timed out';
      } else if (error.message.includes('Environment variable not found')) {
        errorType = 'MISSING_DATABASE_URL';
        errorMessage = 'Database configuration missing';
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          type: errorType,
          message: errorMessage,
          details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined,
        },
        meta: {
          duration,
          timestamp: new Date().toISOString(),
          endpoint: '/api/venues/featured',
        },
      },
      { status: statusCode }
    );
  }
}