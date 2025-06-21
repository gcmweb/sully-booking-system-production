
# 🚀 Sully Booking System - GitHub → Netlify Deployment Guide

This guide will walk you through deploying the Sully Booking System to Netlify via GitHub.

## 📋 Prerequisites

Before you begin, make sure you have:

- [ ] GitHub account
- [ ] Netlify account
- [ ] External database (PlanetScale, Supabase, or Railway recommended)
- [ ] Stripe account with live API keys
- [ ] Domain name (optional, but recommended)

## 🏗️ Architecture Overview

**Current Setup:**
- **Frontend**: Next.js 14 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Stripe integration
- **Authentication**: JWT-based auth
- **Deployment**: Static export + Netlify Functions

## 📚 Table of Contents

1. [Database Setup](#1-database-setup)
2. [GitHub Repository Setup](#2-github-repository-setup)
3. [Netlify Deployment](#3-netlify-deployment)
4. [Environment Variables](#4-environment-variables)
5. [Domain Configuration](#5-domain-configuration)
6. [Testing](#6-testing)
7. [Troubleshooting](#7-troubleshooting)

## 1. 🗄️ Database Setup

### Option A: PlanetScale (Recommended)

1. **Create PlanetScale Account**: Go to [planetscale.com](https://planetscale.com)
2. **Create Database**: 
   ```bash
   # Install PlanetScale CLI
   curl -fsSL https://install.planetscale.com/ps | bash
   
   # Login and create database
   pscale auth login
   pscale database create sully-booking
   ```
3. **Get Connection String**: 
   - Go to your database → Settings → Connection strings
   - Copy the connection string for your main branch

### Option B: Supabase

1. **Create Supabase Project**: Go to [supabase.com](https://supabase.com)
2. **Get Database URL**: Go to Settings → Database → Connection string
3. **Note**: Use the "URI" format connection string

### Option C: Railway

1. **Create Railway Account**: Go to [railway.app](https://railway.app)
2. **Deploy PostgreSQL**: Click "New Project" → "Deploy PostgreSQL"
3. **Get Connection String**: Go to your PostgreSQL service → Variables tab

## 2. 📁 GitHub Repository Setup

### Step 1: Initialize Git Repository

```bash
cd /home/ubuntu/sully-booking-system
git init
git add .
git commit -m "Initial commit: Sully Booking System"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `sully-booking-system` (or your preferred name)
3. **Do NOT** initialize with README, .gitignore, or license (we already have these)

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/sully-booking-system.git
git branch -M main
git push -u origin main
```

## 3. 🌐 Netlify Deployment

### Step 1: Connect Repository to Netlify

1. **Login to Netlify**: Go to [netlify.com](https://netlify.com)
2. **New Site**: Click "New site from Git"
3. **Choose GitHub**: Select GitHub and authorize Netlify
4. **Select Repository**: Choose your `sully-booking-system` repository

### Step 2: Configure Build Settings

Netlify should automatically detect the `netlify.toml` file, but verify these settings:

- **Base directory**: `app`
- **Build command**: `chmod +x build-netlify.sh && ./build-netlify.sh`
- **Publish directory**: `app/out`

### Step 3: Deploy

Click "Deploy site" - your first deployment will likely fail due to missing environment variables.

## 4. 🔐 Environment Variables

### Step 1: Configure in Netlify Dashboard

Go to Site settings → Environment variables and add:

#### Required Variables:
```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secure-jwt-secret-here-min-32-chars
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PAID_PRICE_ID=price_your_paid_plan_id
STRIPE_PREMIUM_PRICE_ID=price_your_premium_plan_id
NODE_ENV=production
STRIPE_MODE=live
NEXT_PUBLIC_APP_URL=https://your-app-name.netlify.app
WEBHOOK_BASE_URL=https://your-app-name.netlify.app
NEXT_TELEMETRY_DISABLED=1
```

### Step 2: Update Your App URL

After deployment, update these variables with your actual Netlify URL:
- `NEXT_PUBLIC_APP_URL`
- `WEBHOOK_BASE_URL`

## 5. 🌍 Domain Configuration (Optional)

### Step 1: Add Custom Domain

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `sullybooking.com`)

### Step 2: Configure DNS

Point your domain's DNS to Netlify:
- Add a CNAME record pointing to your Netlify subdomain
- Or use Netlify's nameservers

### Step 3: Enable HTTPS

Netlify will automatically provision SSL certificates via Let's Encrypt.

## 6. 🧪 Testing

### Step 1: Test Core Functionality

1. **Homepage**: Visit your deployed site
2. **Authentication**: Test login/register
3. **Venues**: Check venue listings
4. **Bookings**: Test booking flow
5. **Payments**: Test subscription upgrades

### Step 2: API Endpoints

Test key API endpoints:
```bash
curl https://your-app.netlify.app/api/venues
curl https://your-app.netlify.app/api/auth/status
```

## 7. 🔧 Troubleshooting

### Common Issues:

#### Build Failures
- **Prisma Generation**: Ensure DATABASE_URL is set
- **TypeScript Errors**: Check for type issues in your code
- **Missing Dependencies**: Verify all packages are in package.json

#### Runtime Errors
- **Database Connection**: Verify DATABASE_URL format
- **API Routes**: Check Netlify Functions logs
- **Authentication**: Verify JWT_SECRET is set

#### Performance Issues
- **Cold Starts**: First request to functions may be slow
- **Database Connections**: Consider connection pooling
- **Static Assets**: Use Netlify's CDN for images

### Getting Help

1. **Netlify Logs**: Check Functions tab in Netlify dashboard
2. **GitHub Issues**: Create issues in your repository
3. **Community**: Join Netlify and Next.js Discord communities

## 📝 Next Steps

After successful deployment:

1. **Set up monitoring**: Use Netlify Analytics
2. **Configure alerts**: Set up error notifications
3. **Backup strategy**: Regular database backups
4. **Performance optimization**: Monitor and optimize Core Web Vitals
5. **Security review**: Audit environment variables and API endpoints

## 🔄 Continuous Deployment

Every push to your `main` branch will automatically trigger a new deployment on Netlify. Use feature branches for development:

```bash
git checkout -b feature/new-feature
# Make changes
git commit -m "Add new feature"
git push origin feature/new-feature
# Create pull request on GitHub
# Merge to main to deploy
```

---

**Congratulations!** 🎉 Your Sully Booking System should now be live on Netlify!
