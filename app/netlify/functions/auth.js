
// Netlify Function for Authentication Endpoints
// Handles /api/auth/* routes

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event, context) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const db = initPrisma();
    const path = event.path.replace('/.netlify/functions/auth', '');
    const method = event.httpMethod;

    // Route to appropriate handler
    switch (path) {
      case '/login':
        return await handleLogin(event, db);
      case '/register':
        return await handleRegister(event, db);
      case '/logout':
        return await handleLogout(event, db);
      case '/me':
        return await handleGetUser(event, db);
      case '/refresh':
        return await handleRefreshToken(event, db);
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' }),
        };
    }
  } catch (error) {
    console.error('Auth function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

// Login handler
async function handleLogin(event, db) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and password are required' }),
      };
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    // Check if user is active
    if (!user.isActive) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Account is deactivated' }),
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await db.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        user: userWithoutPassword,
        token,
        expiresAt: expiresAt.toISOString(),
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Login failed' }),
    };
  }
}

// Register handler
async function handleRegister(event, db) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email, password, firstName, lastName, phone } = JSON.parse(event.body);

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Email, password, first name, and last name are required' 
        }),
      };
    }

    // Check password strength
    if (password.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Password must be at least 8 characters long' 
        }),
      };
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ error: 'User already exists' }),
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        role: 'VENUE_OWNER', // Default role
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await db.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        user: userWithoutPassword,
        token,
        expiresAt: expiresAt.toISOString(),
        message: 'User created successfully',
      }),
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Registration failed' }),
    };
  }
}

// Get current user handler
async function handleGetUser(event, db) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Extract token from Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No token provided' }),
      };
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if session exists and is valid
    const session = await db.userSession.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired token' }),
      };
    }

    // Return user data (excluding password)
    const { password, ...userWithoutPassword } = session.user;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        user: userWithoutPassword,
      }),
    };
  } catch (error) {
    console.error('Get user error:', error);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid token' }),
    };
  }
}

// Logout handler
async function handleLogout(event, db) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Extract token from Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No token provided' }),
      };
    }

    const token = authHeader.substring(7);

    // Delete session
    await db.userSession.delete({
      where: { token },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Logged out successfully' }),
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Logged out' }),
    };
  }
}

// Refresh token handler
async function handleRefreshToken(event, db) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Extract token from Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No token provided' }),
      };
    }

    const token = authHeader.substring(7);

    // Find session
    const session = await db.userSession.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired token' }),
      };
    }

    // Generate new token
    const newToken = jwt.sign(
      {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update session
    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + 24);

    await db.userSession.update({
      where: { token },
      data: {
        token: newToken,
        expiresAt: newExpiresAt,
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token: newToken,
        expiresAt: newExpiresAt.toISOString(),
      }),
    };
  } catch (error) {
    console.error('Refresh token error:', error);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Token refresh failed' }),
    };
  }
}
