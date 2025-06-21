
// Netlify Functions entry point for API routes
// This will handle all /api/* requests

const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
let prisma;

const initPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
};

exports.handler = async (event, context) => {
  // Set up CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Initialize database connection
    const db = initPrisma();
    
    // Extract the API path from the request
    const path = event.path.replace('/.netlify/functions/api', '');
    
    // Basic routing for common API endpoints
    if (path.startsWith('/auth/')) {
      return await handleAuth(event, db);
    } else if (path.startsWith('/venues/')) {
      return await handleVenues(event, db);
    } else if (path.startsWith('/bookings/')) {
      return await handleBookings(event, db);
    } else if (path.startsWith('/subscriptions/')) {
      return await handleSubscriptions(event, db);
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Endpoint not found' }),
      };
    }
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

// Auth handler placeholder
async function handleAuth(event, db) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: 'Auth endpoint - requires implementation' }),
  };
}

// Venues handler placeholder
async function handleVenues(event, db) {
  if (event.httpMethod === 'GET') {
    try {
      const venues = await db.venue.findMany({
        include: {
          images: true,
          openingHours: true,
        },
      });
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(venues),
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Failed to fetch venues' }),
      };
    }
  }
  
  return {
    statusCode: 405,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
}

// Bookings handler placeholder
async function handleBookings(event, db) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: 'Bookings endpoint - requires implementation' }),
  };
}

// Subscriptions handler placeholder
async function handleSubscriptions(event, db) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: 'Subscriptions endpoint - requires implementation' }),
  };
}
