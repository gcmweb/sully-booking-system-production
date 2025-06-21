
# 🚀 Quick Start Guide: Deploy Sully Booking System to Netlify

**Time Required**: 30-45 minutes  
**Skill Level**: Intermediate  
**Prerequisites**: GitHub account, Netlify account, external database

## 🎯 Overview

This guide will get your Sully Booking System live on Netlify in under an hour. Follow these steps in order:

1. **Database Setup** (10 minutes)
2. **GitHub Repository** (5 minutes)  
3. **Netlify Deployment** (10 minutes)
4. **Configuration** (15 minutes)
5. **Testing** (5 minutes)

---

## 🗄️ Step 1: Database Setup (10 minutes)

### Option A: Supabase (Recommended for beginners)

1. **Create Account**: Go to [supabase.com](https://supabase.com) → "Start your project"
2. **New Project**: 
   - Organization: Create new or select existing
   - Project name: `sully-booking-db`
   - Database password: Generate strong password (save it!)
   - Region: Choose closest to your users
3. **Get Connection String**:
   - Go to Settings → Database
   - Copy "URI" connection string
   - Replace `[YOUR-PASSWORD]` with your actual password

### Option B: PlanetScale (MySQL, more advanced)

1. **Create Account**: Go to [planetscale.com](https://planetscale.com)
2. **Create Database**: 
   ```bash
   # Install CLI: curl -fsSL https://install.planetscale.com/ps | bash
   pscale auth login
   pscale database create sully-booking
   ```
3. **Get Connection String**: Dashboard → your database → Connect

---

## 📁 Step 2: GitHub Repository (5 minutes)

```bash
# 1. Navigate to project
cd /home/ubuntu/sully-booking-system

# 2. Initialize git
git init
git add .
git commit -m "Initial commit: Sully Booking System"

# 3. Create GitHub repo (go to github.com)
# - Click "+" → "New repository"  
# - Name: sully-booking-system
# - Private or Public
# - Don't initialize with anything

# 4. Push to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/sully-booking-system.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 3: Netlify Deployment (10 minutes)

1. **Connect Repository**:
   - Go to [netlify.com](https://netlify.com) → "New site from Git"
   - Choose GitHub → Authorize Netlify
   - Select your `sully-booking-system` repository

2. **Build Settings** (auto-detected from netlify.toml):
   - Base directory: `app`
   - Build command: `chmod +x build-netlify.sh && ./build-netlify.sh`
   - Publish directory: `app/out`

3. **Deploy**: Click "Deploy site" (will fail due to missing env vars - that's expected!)

4. **Get Your URL**: Note your Netlify URL (e.g., `https://amazing-app-123.netlify.app`)

---

## 🔐 Step 4: Configuration (15 minutes)

### Add Environment Variables in Netlify

Go to Site settings → Environment variables → Add variables:

```bash
# Database (use your actual connection string from Step 1)
DATABASE_URL=postgresql://postgres:your-password@your-host/postgres

# Authentication (generate a strong 32+ character secret)
JWT_SECRET=your-super-secure-jwt-secret-key-here-make-it-long

# Stripe (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for testing
STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_... for testing
STRIPE_WEBHOOK_SECRET=whsec_... # from webhook configuration
STRIPE_PAID_PRICE_ID=price_... # create in Stripe dashboard
STRIPE_PREMIUM_PRICE_ID=price_... # create in Stripe dashboard

# Environment
NODE_ENV=production
STRIPE_MODE=live # or "test" for development

# URLs (use your actual Netlify URL from Step 3)
NEXT_PUBLIC_APP_URL=https://your-app-name.netlify.app
WEBHOOK_BASE_URL=https://your-app-name.netlify.app

# Optional
NEXT_TELEMETRY_DISABLED=1
```

### Generate Strong JWT Secret

```bash
# Quick way to generate a secure secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Create Stripe Products (if using live mode)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Create two products:
   - **Paid Plan**: $29/month
   - **Premium Plan**: $99/month  
3. Copy the price IDs for the environment variables above

---

## 🧪 Step 5: Testing (5 minutes)

1. **Trigger Redeploy**: 
   - In Netlify dashboard → Deploys → "Trigger deploy"
   - Or push a small change to GitHub

2. **Test Core Features**:
   ```bash
   # Your site should now be live - test these:
   # ✅ Homepage loads
   # ✅ User registration works  
   # ✅ User login works
   # ✅ Venue listing displays
   # ✅ Booking flow functional
   ```

3. **Check API Endpoints**:
   ```bash
   curl https://your-app.netlify.app/api/venues
   curl https://your-app.netlify.app/api/auth/me
   ```

---

## ✅ Success Checklist

- [ ] Database created and accessible
- [ ] GitHub repository created and pushed
- [ ] Netlify site deployed successfully  
- [ ] All environment variables configured
- [ ] Homepage loads without errors
- [ ] User authentication works
- [ ] API endpoints respond correctly
- [ ] Stripe integration functional (if configured)

---

## 🚨 Common Issues & Quick Fixes

### Build Fails
```bash
# Check Netlify build logs for:
- Missing environment variables → Add them in Netlify dashboard
- Database connection errors → Verify DATABASE_URL
- TypeScript errors → Check code syntax
```

### Runtime Errors  
```bash
# Check browser console for:
- API connection issues → Verify function deployment
- Authentication problems → Check JWT_SECRET
- Database errors → Verify database accessibility
```

### Performance Issues
```bash
# Optimize:
- Enable database connection pooling
- Use smaller images
- Monitor function execution time
```

---

## 🎉 You're Live!

**Congratulations!** 🎉 Your Sully Booking System is now live on Netlify!

### Next Steps:
1. **Custom Domain**: Add your own domain in Netlify settings
2. **SSL Certificate**: Automatically provisioned by Netlify
3. **Monitoring**: Set up error tracking and analytics
4. **Backups**: Configure database backups
5. **Team Access**: Invite team members to Netlify and GitHub

### Important URLs:
- **Live Site**: https://your-app-name.netlify.app
- **Netlify Dashboard**: https://app.netlify.com
- **GitHub Repository**: https://github.com/your-username/sully-booking-system

### Support:
- 📖 **Full Docs**: See `DEPLOYMENT_README.md`
- 📋 **Detailed Checklist**: See `NETLIFY_DEPLOYMENT_CHECKLIST.md`
- 🐙 **GitHub Help**: See `GITHUB_SETUP_GUIDE.md`
- 🗄️ **Database Migration**: See `DATABASE_MIGRATION_GUIDE.md`

---

**Total Time**: ~30-45 minutes ⏱️  
**Status**: Production Ready 🚀  
**Maintenance**: Automatic updates on Git push 🔄

Enjoy your new booking system! 🎊
