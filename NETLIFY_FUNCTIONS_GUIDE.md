
# ⚡ Netlify Functions Implementation Guide

This guide explains how the Sully Booking System API routes are converted to Netlify Functions for serverless deployment.

## 🏗️ Architecture Overview

**Before (Local)**:
```
Next.js API Routes (app/api/*)
├── /api/auth/*
├── /api/venues/*
├── /api/bookings/*
└── /api/subscriptions/*
```

**After (Netlify)**:
```
Netlify Functions (app/netlify/functions/*)
├── api.js (handles all /api/* routes)
├── auth.js (authentication endpoints)
├── webhooks.js (Stripe webhooks)
└── uploads.js (file upload handling)
```

## 🔄 Current Implementation Status

### ✅ Completed
- [x] Basic function structure
- [x] Database connection setup
- [x] CORS headers configuration
- [x] Error handling framework
- [x] Venues API (basic GET)

### 🚧 Needs Implementation
- [ ] Authentication endpoints
- [ ] Booking management
- [ ] Subscription handling
- [ ] Stripe webhook processing
- [ ] File upload handling
- [ ] Email notifications

## 📁 Function Structure

### Main API Function (`api.js`)

```javascript
// Entry point for all /api/* requests
exports.handler = async (event, context) => {
  // Route requests based on path
  const path = event.path.replace('/.netlify/functions/api', '');
  
  if (path.startsWith('/auth/')) {
    return await handleAuth(event, db);
  } else if (path.startsWith('/venues/')) {
    return await handleVenues(event, db);
  }
  // ... other routes
};
```

## 🔧 Implementation Plan

### Phase 1: Core API Functions

#### 1. Authentication (`handleAuth`)

```javascript
async function handleAuth(event, db) {
  const path = event.path.replace('/.netlify/functions/api/auth', '');
  
  switch (path) {
    case '/login':
      return await handleLogin(event, db);
    case '/register': 
      return await handleRegister(event, db);
    case '/logout':
      return await handleLogout(event, db);
    case '/me':
      return await handleGetUser(event, db);
    default:
      return { statusCode: 404, body: 'Not found' };
  }
}
```

#### 2. Venues Management (`handleVenues`)

```javascript
async function handleVenues(event, db) {
  const method = event.httpMethod;
  const path = event.path.replace('/.netlify/functions/api/venues', '');
  
  switch (method) {
    case 'GET':
      if (path === '') {
        // GET /api/venues - list all venues
        return await listVenues(db);
      } else {
        // GET /api/venues/:id - get specific venue
        const venueId = path.replace('/', '');
        return await getVenue(venueId, db);
      }
    case 'POST':
      // POST /api/venues - create venue
      return await createVenue(event, db);
    case 'PUT':
      // PUT /api/venues/:id - update venue
      const venueId = path.replace('/', '');
      return await updateVenue(venueId, event, db);
    case 'DELETE':
      // DELETE /api/venues/:id - delete venue
      const venueId = path.replace('/', '');
      return await deleteVenue(venueId, db);
  }
}
```

#### 3. Bookings Management (`handleBookings`)

```javascript
async function handleBookings(event, db) {
  // Implementation for booking CRUD operations
  // - Create booking
  // - Update booking status
  // - Cancel booking
  // - List bookings by venue/customer
}
```

### Phase 2: Advanced Functions

#### 1. Stripe Webhooks (`webhooks.js`)

```javascript
// app/netlify/functions/webhooks.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  const sig = event.headers['stripe-signature'];
  
  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    switch (stripeEvent.type) {
      case 'customer.subscription.created':
        return await handleSubscriptionCreated(stripeEvent.data.object);
      case 'customer.subscription.updated':
        return await handleSubscriptionUpdated(stripeEvent.data.object);
      case 'invoice.payment_succeeded':
        return await handlePaymentSucceeded(stripeEvent.data.object);
      default:
        console.log(`Unhandled event type ${stripeEvent.type}`);
    }
    
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }
};
```

#### 2. File Uploads (`uploads.js`)

```javascript
// app/netlify/functions/uploads.js
const formidable = require('formidable');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  
  // Handle multipart/form-data uploads
  // Save to external storage (Cloudinary, AWS S3, etc.)
  // Return file URL
};
```

## 🔗 URL Routing

### Before (Next.js API Routes):
```
POST /api/auth/login
GET  /api/venues
POST /api/venues
GET  /api/venues/[id]
PUT  /api/venues/[id]
POST /api/bookings
GET  /api/bookings/[id]
```

### After (Netlify Functions):
```
POST /.netlify/functions/api/auth/login
GET  /.netlify/functions/api/venues
POST /.netlify/functions/api/venues
GET  /.netlify/functions/api/venues/[id]
PUT  /.netlify/functions/api/venues/[id]
POST /.netlify/functions/api/bookings
GET  /.netlify/functions/api/bookings/[id]
```

**Note**: The `netlify.toml` redirects handle the URL rewriting transparently.

## 🛠️ Development Workflow

### Local Testing

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local development server
netlify dev

# Test specific function
netlify functions:invoke api --payload '{"path": "/venues", "httpMethod": "GET"}'
```

### Debugging

```javascript
// Add logging to functions
console.log('Event:', JSON.stringify(event, null, 2));
console.log('Context:', JSON.stringify(context, null, 2));

// Check Netlify dashboard for function logs
```

## 📊 Performance Considerations

### Cold Starts
- **Issue**: First request to a function may be slow
- **Solution**: Keep functions warm with scheduled pings

### Database Connections
- **Issue**: Each function invocation creates new DB connection
- **Solution**: Connection pooling and singleton pattern

### Memory Usage
- **Issue**: Limited memory per function
- **Solution**: Optimize queries, limit data fetching

## 🔐 Security Implementation

### Authentication Middleware

```javascript
const jwt = require('jsonwebtoken');

const authenticate = (event) => {
  const token = event.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return { error: 'No token provided', statusCode: 401 };
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { user: decoded };
  } catch (error) {
    return { error: 'Invalid token', statusCode: 401 };
  }
};
```

### Rate Limiting

```javascript
// Simple in-memory rate limiting (consider Redis for production)
const rateLimiter = new Map();

const checkRateLimit = (ip, limit = 100, window = 3600000) => {
  const now = Date.now();
  const key = `${ip}:${Math.floor(now / window)}`;
  
  const current = rateLimiter.get(key) || 0;
  if (current >= limit) {
    return false;
  }
  
  rateLimiter.set(key, current + 1);
  return true;
};
```

## ✅ Implementation Checklist

### Core Functions
- [ ] Complete authentication handler
- [ ] Implement venue CRUD operations
- [ ] Add booking management
- [ ] Create subscription handlers

### Advanced Features
- [ ] Stripe webhook processing
- [ ] File upload handling
- [ ] Email notification service
- [ ] SMS notification service

### Security & Performance
- [ ] Add authentication middleware
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Error logging and monitoring

### Testing
- [ ] Unit tests for each function
- [ ] Integration tests
- [ ] Load testing
- [ ] Error scenario testing

## 📚 Resources

- **Netlify Functions Docs**: [docs.netlify.com/functions](https://docs.netlify.com/functions/)
- **Next.js API Routes**: [nextjs.org/docs/api-routes](https://nextjs.org/docs/api-routes/introduction)
- **Prisma with Serverless**: [prisma.io/docs/guides/deployment/serverless](https://www.prisma.io/docs/guides/deployment/serverless)

---

**Next Steps**: Implement the remaining API functions following this guide! 🚀
