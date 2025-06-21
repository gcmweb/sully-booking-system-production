
# 🗄️ Database Migration Guide for Netlify Deployment

This guide explains how to migrate your database from the current local setup to an external database service compatible with Netlify.

## 🎯 Overview

**Current Setup**: Local PostgreSQL database
**Target Setup**: External hosted PostgreSQL (PlanetScale, Supabase, or Railway)

## 📊 Migration Options

### Option 1: PlanetScale (Recommended) ⭐

**Pros**: Serverless, branch-based workflows, excellent scaling
**Cons**: MySQL-based (requires some schema adjustments)

#### Setup Steps:

1. **Install PlanetScale CLI**:
   ```bash
   curl -fsSL https://install.planetscale.com/ps | bash
   ```

2. **Create Database**:
   ```bash
   pscale auth login
   pscale database create sully-booking
   pscale branch create sully-booking main
   ```

3. **Update Prisma Schema** (MySQL compatibility):
   ```prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
     relationMode = "prisma"
   }
   ```

4. **Get Connection String**:
   ```bash
   pscale connect sully-booking main --port 3309
   # In another terminal:
   pscale database show sully-booking
   ```

### Option 2: Supabase 🚀

**Pros**: PostgreSQL-compatible, real-time features, generous free tier
**Cons**: Limited to PostgreSQL version 13+

#### Setup Steps:

1. **Create Supabase Project**: 
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Choose region closest to your users

2. **Get Database URL**:
   - Go to Settings → Database
   - Copy the connection string (URI format)

3. **No Schema Changes Required** - PostgreSQL compatible!

### Option 3: Railway 🚂

**Pros**: Simple setup, PostgreSQL compatible, good performance
**Cons**: Smaller free tier, fewer features

#### Setup Steps:

1. **Create Railway Account**: Go to [railway.app](https://railway.app)
2. **Deploy PostgreSQL**: New Project → Deploy PostgreSQL
3. **Get Connection String**: Variables tab → DATABASE_URL

## 📋 Migration Process

### Step 1: Export Current Data

```bash
cd /home/ubuntu/sully-booking-system/app

# Export schema and data
pg_dump $DATABASE_URL > backup.sql

# Or export data only (without schema)
pg_dump --data-only $DATABASE_URL > data-only.sql
```

### Step 2: Update Environment Variables

```bash
# Update .env with new database URL
DATABASE_URL="your-new-database-url"
```

### Step 3: Push Schema to New Database

```bash
# Generate and push schema
npx prisma generate
npx prisma db push

# Alternative: Use migrations
npx prisma migrate deploy
```

### Step 4: Import Data (if needed)

For PostgreSQL (Supabase/Railway):
```bash
psql $DATABASE_URL < data-only.sql
```

For MySQL (PlanetScale):
```bash
# You'll need to convert PostgreSQL data to MySQL format
# Use a tool like pgloader or manually export/import
```

### Step 5: Verify Migration

```bash
# Test database connection
npx prisma studio

# Run a test query
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => {
  console.log('Users:', count);
  process.exit(0);
});
"
```

## 🔧 Schema Adjustments for Different Providers

### For PlanetScale (MySQL):

```prisma
// Remove foreign key constraints and add @@index
model Booking {
  id              String        @id @default(cuid())
  venueId         String
  customerId      String?
  // ... other fields
  
  // Remove direct relations, add indexes
  @@index([venueId])
  @@index([customerId])
}

model Venue {
  id      String @id @default(cuid())
  ownerId String
  // ... other fields
  
  @@index([ownerId])
}
```

### For Supabase/Railway (PostgreSQL):

```prisma
// No changes required - keep existing schema
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 🎛️ Environment Configuration

### Development Environment:

```bash
# .env.development
DATABASE_URL="your-development-database-url"
NODE_ENV="development"
STRIPE_MODE="test"
```

### Production Environment:

```bash
# .env.production (for Netlify)
DATABASE_URL="your-production-database-url"
NODE_ENV="production"
STRIPE_MODE="live"
```

## 🚨 Important Considerations

### Connection Limits

**Issue**: Serverless functions can create many database connections
**Solution**: Use connection pooling

```javascript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

declare global {
  var __db: PrismaClient | undefined
}

let db: PrismaClient

if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient()
} else {
  if (!global.__db) {
    global.__db = new PrismaClient()
  }
  db = global.__db
}

export { db }
```

### Connection Pooling (Recommended)

Use a connection pooler like PgBouncer or Supabase's built-in pooling:

```bash
# Example with connection pooling
DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true"
```

### SSL Requirements

Most hosted databases require SSL:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

## ✅ Migration Checklist

- [ ] Choose database provider (PlanetScale/Supabase/Railway)
- [ ] Create database instance
- [ ] Update Prisma schema (if needed for MySQL)
- [ ] Export current data
- [ ] Update DATABASE_URL in environment variables
- [ ] Push schema to new database
- [ ] Import data (if applicable)
- [ ] Test application functionality
- [ ] Update Netlify environment variables
- [ ] Deploy and verify

## 🔄 Rollback Plan

Keep your backup handy:

```bash
# If something goes wrong, restore from backup
psql $OLD_DATABASE_URL < backup.sql
```

## 📞 Support Resources

- **PlanetScale**: [docs.planetscale.com](https://docs.planetscale.com)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Prisma**: [prisma.io/docs](https://prisma.io/docs)

---

**Success!** 🎉 Your database is now ready for Netlify deployment!
