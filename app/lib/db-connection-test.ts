import { PrismaClient } from '@prisma/client';

export async function testDatabaseConnection() {
  const startTime = Date.now();
  let prisma: PrismaClient | null = null;
  
  try {
    // Log environment info
    console.log('=== Database Connection Test ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
    
    // Mask the URL for security but show structure
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      const urlParts = dbUrl.split('@');
      if (urlParts.length > 1) {
        console.log('DATABASE_URL structure: [credentials]@' + urlParts[1]);
      } else {
        console.log('DATABASE_URL structure: Invalid format (no @ found)');
      }
    }

    // Initialize Prisma client
    prisma = new PrismaClient({
      log: ['error', 'warn'],
      errorFormat: 'pretty',
    });

    // Test basic connection
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✓ Database connection established');

    // Test a simple query
    console.log('Testing simple query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✓ Simple query successful:', result);

    // Test venue table access
    console.log('Testing venue table access...');
    const venueCount = await prisma.venue.count();
    console.log('✓ Venue table accessible, count:', venueCount);

    // Test featured venues query (the failing endpoint)
    console.log('Testing featured venues query...');
    const featuredVenues = await prisma.venue.findMany({
      where: {
        featured: true,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: 1,
    });
    console.log('✓ Featured venues query successful, found:', featuredVenues.length);

    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
      success: true,
      duration,
      tests: {
        connection: true,
        simpleQuery: true,
        venueTableAccess: true,
        featuredVenuesQuery: true,
      },
      venueCount,
      featuredVenuesCount: featuredVenues.length,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      }
    };

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error('❌ Database connection test failed:', error);
    
    // Detailed error analysis
    let errorType = 'UNKNOWN';
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorDetails = error.message;
      
      if (error.message.includes('ENOTFOUND')) {
        errorType = 'DNS_RESOLUTION_FAILED';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorType = 'CONNECTION_REFUSED';
      } else if (error.message.includes('authentication failed')) {
        errorType = 'AUTHENTICATION_FAILED';
      } else if (error.message.includes('database') && error.message.includes('does not exist')) {
        errorType = 'DATABASE_NOT_FOUND';
      } else if (error.message.includes('Environment variable not found')) {
        errorType = 'MISSING_DATABASE_URL';
      } else if (error.message.includes('timeout')) {
        errorType = 'CONNECTION_TIMEOUT';
      }
    }

    return {
      success: false,
      duration,
      error: {
        type: errorType,
        message: errorDetails,
        stack: error instanceof Error ? error.stack : undefined,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      }
    };
  } finally {
    if (prisma) {
      await prisma.$disconnect();
      console.log('Database connection closed');
    }
  }
}