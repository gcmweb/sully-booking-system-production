
# ✅ Netlify Deployment Checklist

Complete checklist for deploying the Sully Booking System to Netlify via GitHub.

## 📋 Pre-Deployment Requirements

### 🗄️ Database Setup
- [ ] External database provider chosen (PlanetScale/Supabase/Railway)
- [ ] Database instance created
- [ ] Database URL obtained
- [ ] Schema migrated to new database
- [ ] Data imported (if applicable)
- [ ] Database connection tested

### 🔐 Stripe Configuration
- [ ] Stripe account set up
- [ ] Live API keys obtained
- [ ] Webhook endpoint created
- [ ] Price IDs for subscription plans created
- [ ] Test payment flow verified

### 📁 Repository Setup
- [ ] GitHub repository created
- [ ] All code committed and pushed
- [ ] .gitignore properly configured
- [ ] Environment secrets added to GitHub (optional)

## 🚀 Netlify Setup

### 🔗 Initial Connection
- [ ] Netlify account created
- [ ] GitHub account connected to Netlify
- [ ] Repository selected for deployment
- [ ] Build settings configured:
  - **Base directory**: `app`
  - **Build command**: `chmod +x build-netlify.sh && ./build-netlify.sh`
  - **Publish directory**: `app/out`

### 🔧 Environment Variables Configuration

Copy these exact variable names to Netlify:

#### Database & Auth
- [ ] `DATABASE_URL` - Your external database URL
- [ ] `JWT_SECRET` - Strong secret key (32+ characters)

#### Stripe Configuration
- [ ] `STRIPE_SECRET_KEY` - Live secret key (sk_live_...)
- [ ] `STRIPE_PUBLISHABLE_KEY` - Live publishable key (pk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook secret (whsec_...)
- [ ] `STRIPE_PAID_PRICE_ID` - Paid plan price ID
- [ ] `STRIPE_PREMIUM_PRICE_ID` - Premium plan price ID

#### Environment Settings
- [ ] `NODE_ENV` = `production`
- [ ] `STRIPE_MODE` = `live`
- [ ] `NEXT_TELEMETRY_DISABLED` = `1`

#### App URLs (update after first deployment)
- [ ] `NEXT_PUBLIC_APP_URL` - Your Netlify app URL
- [ ] `WEBHOOK_BASE_URL` - Same as above

## 🔧 Build Configuration

### File Checklist
- [ ] `netlify.toml` exists in root directory
- [ ] `build-netlify.sh` exists and is executable
- [ ] `netlify/functions/` directory created
- [ ] API functions implemented

### Build Dependencies
- [ ] All dependencies in package.json
- [ ] Prisma client generation configured
- [ ] TypeScript compilation verified

## 🌐 First Deployment

### Deploy and Test
- [ ] Initial deployment triggered
- [ ] Build logs checked for errors
- [ ] Site URL obtained from Netlify
- [ ] Homepage loads successfully

### Update URLs
- [ ] Update `NEXT_PUBLIC_APP_URL` with actual Netlify URL
- [ ] Update `WEBHOOK_BASE_URL` with actual Netlify URL
- [ ] Redeploy after URL updates

## 🧪 Functionality Testing

### Core Features
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Responsive design verified

### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] User logout works
- [ ] Protected routes enforced

### Venues
- [ ] Venue listing displays
- [ ] Venue details load
- [ ] Venue creation works (if applicable)

### Bookings
- [ ] Booking form loads
- [ ] Booking submission works
- [ ] Booking confirmation displays

### Payments
- [ ] Stripe integration works
- [ ] Subscription upgrades function
- [ ] Webhook processing verified

## 🔐 Security Verification

### Environment Variables
- [ ] No secrets in public repository
- [ ] All production secrets configured
- [ ] Development vs production environments separated

### API Security
- [ ] Authentication middleware working
- [ ] CORS headers properly configured
- [ ] Rate limiting implemented (if applicable)

### SSL/HTTPS
- [ ] HTTPS enabled (automatic with Netlify)
- [ ] SSL certificate valid
- [ ] All API calls use HTTPS

## 🎯 Performance Testing

### Speed Tests
- [ ] Homepage loads under 3 seconds
- [ ] API responses under 2 seconds
- [ ] No console errors in browser

### Mobile Testing
- [ ] Site works on mobile devices
- [ ] Touch interactions work
- [ ] Mobile menu functions

## 📊 Monitoring Setup

### Error Tracking
- [ ] Check Netlify Function logs
- [ ] Monitor error rates
- [ ] Set up alerts (optional)

### Analytics
- [ ] Netlify Analytics enabled (optional)
- [ ] Google Analytics configured (optional)

## 🌍 Domain Configuration (Optional)

### Custom Domain
- [ ] Domain purchased/available
- [ ] DNS records configured
- [ ] Domain added to Netlify
- [ ] SSL certificate issued for custom domain

### Final URLs
- [ ] All environment variables updated with final domain
- [ ] Stripe webhook URL updated
- [ ] Final deployment completed

## 🔄 Post-Deployment

### Documentation
- [ ] Deployment notes documented
- [ ] Access credentials stored securely
- [ ] Team members notified

### Backup Strategy
- [ ] Database backup configured
- [ ] Code repository backed up
- [ ] Environment variables documented

### Monitoring
- [ ] Uptime monitoring set up
- [ ] Performance metrics baseline established
- [ ] Error alerting configured

## 🚨 Troubleshooting Quick Fixes

### Build Failures
```bash
# Common fixes:
- Check environment variables are set
- Verify database connection string
- Check for TypeScript errors
- Ensure all dependencies are listed
```

### Runtime Errors
```bash
# Check these:
- Netlify Function logs
- Browser console errors
- Database connectivity
- API endpoint responses
```

### Performance Issues
```bash
# Optimize:
- Database queries
- Function cold starts
- Static asset loading
- API response times
```

## ✅ Deployment Complete!

When all items are checked:

1. **🎉 Congratulations!** Your Sully Booking System is live
2. **📝 Document** your deployment details
3. **📢 Share** the URL with stakeholders
4. **🔍 Monitor** for any issues in the first 24 hours
5. **🚀 Plan** future updates and improvements

---

**Live Site**: https://your-app-name.netlify.app
**Admin Access**: Use your registered admin account
**Support**: Check the troubleshooting guides for any issues

## 📞 Support Resources

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Prisma with Serverless**: [prisma.io/docs/guides/deployment/serverless](https://www.prisma.io/docs/guides/deployment/serverless)
- **Stripe Integration**: [stripe.com/docs](https://stripe.com/docs)

**Remember**: Keep this checklist for future deployments and updates! 🚀
