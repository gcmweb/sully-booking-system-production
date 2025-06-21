# Database Connection Troubleshooting Guide

This guide helps you diagnose and fix database connection issues in your Sully Booking System deployment.

## Quick Diagnosis

### 1. Test Database Connection
Visit your deployed site's database test endpoint:
```
https://your-site.netlify.app/api/__test-db
```

This will show you:
- Whether the DATABASE_URL is accessible
- If Prisma can connect to the database
- Specific error details if connection fails

### 2. Check Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Navigate to your site
3. Go to **Site settings** → **Environment variables**
4. Verify `DATABASE_URL` is set and has the correct format

## Common Issues and Solutions

### Issue 1: DATABASE_URL Not Set
**Symptoms:** 
- API returns "Database configuration missing"
- Test endpoint shows `hasDatabaseUrl: false`

**Solution:**
1. In Netlify dashboard, add environment variable:
   - Key: `DATABASE_URL`
   - Value: Your PostgreSQL connection string
2. **Important:** Redeploy your site after adding the variable

### Issue 2: Incorrect DATABASE_URL Format
**Symptoms:**
- "Invalid database URL" errors
- Connection refused errors

**Required Format:**
```
postgresql://username:password@host:port/database?sslmode=require
```

**Example:**
```
postgresql://myuser:mypassword@db.example.com:5432/mydatabase?sslmode=require
```

**Common Mistakes:**
- Missing `?sslmode=require` for cloud databases
- Using `postgres://` instead of `postgresql://`
- Special characters in password not URL-encoded

### Issue 3: Database Authentication Failed
**Symptoms:**
- "Database authentication failed"
- "authentication failed for user" errors

**Solutions:**
1. Verify username and password are correct
2. Check if database user has proper permissions
3. Ensure database allows connections from Netlify's IP ranges

### Issue 4: Database Not Found
**Symptoms:**
- "database does not exist" errors

**Solutions:**
1. Verify database name in connection string
2. Ensure database exists on your PostgreSQL server
3. Run migrations if database schema is missing

### Issue 5: Connection Timeout
**Symptoms:**
- "Database query timed out"
- Long loading times before 500 errors

**Solutions:**
1. Check if database server is running
2. Verify network connectivity
3. Consider database server location (closer to Netlify's servers is better)

## Environment Variable Setup Steps

### Step 1: Get Your Database URL
From your PostgreSQL provider (e.g., Supabase, Railway, Neon):
1. Copy the connection string
2. Ensure it includes `?sslmode=require` for cloud databases

### Step 2: Add to Netlify
1. Netlify Dashboard → Your Site → Site Settings
2. Environment Variables → Add Variable
3. Key: `DATABASE_URL`
4. Value: Your connection string
5. **Save**

### Step 3: Redeploy
**Critical:** Environment variables only take effect after redeployment.

Options to redeploy:
1. **Trigger Deploy** button in Netlify dashboard
2. Push a new commit to your connected Git repository
3. Use Netlify CLI: `netlify deploy --prod`

### Step 4: Verify
1. Wait for deployment to complete
2. Visit `/api/__test-db` endpoint
3. Should show `success: true` if working

## Prisma-Specific Issues

### Issue: Prisma Client Not Generated
**Symptoms:**
- "Cannot find module '@prisma/client'" errors

**Solution:**
Ensure your build command includes Prisma generation:
```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

### Issue: Binary Target Mismatch
**Symptoms:**
- "Query engine binary not found" errors

**Solution:**
Update `prisma/schema.prisma`:
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}
```

## Testing Locally

To test database connection locally:

1. Set environment variable:
   ```bash
   export DATABASE_URL="your-connection-string"
   ```

2. Test connection:
   ```bash
   cd app
   npm run build
   npm start
   ```

3. Visit: `http://localhost:3000/api/__test-db`

## Getting Help

If issues persist:

1. Check the `/api/__test-db` endpoint response for specific error details
2. Review Netlify function logs in your dashboard
3. Verify your database provider's connection requirements
4. Ensure your database accepts connections from external sources

## Security Notes

- Never commit DATABASE_URL to your repository
- Use environment variables for all sensitive configuration
- Ensure your database requires SSL connections (`sslmode=require`)
- Regularly rotate database passwords