
# Sully Booking System - Stripe Go-Live Guide

## 🚀 Complete Guide to Transition from Demo to Live Stripe Payments

This comprehensive guide will help you transition the Sully booking system from demo mode to live Stripe payments with real customer transactions.

---

## 📋 Table of Contents

1. [Pre-Go-Live Checklist](#pre-go-live-checklist)
2. [Stripe Account Setup](#stripe-account-setup)
3. [Creating Products and Pricing Plans](#creating-products-and-pricing-plans)
4. [Environment Configuration](#environment-configuration)
5. [Webhook Configuration](#webhook-configuration)
6. [Security Measures](#security-measures)
7. [Testing Procedures](#testing-procedures)
8. [Go-Live Process](#go-live-process)
9. [Post-Go-Live Monitoring](#post-go-live-monitoring)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Go-Live Checklist

Before going live, ensure you have:

- [ ] **Business Requirements:**
  - ✅ Business is legally registered
  - ✅ Business bank account is set up
  - ✅ Tax identification numbers are available
  - ✅ Business website is operational

- [ ] **Technical Requirements:**
  - ✅ SSL certificate is installed and working
  - ✅ Application is running on production domain
  - ✅ Database backups are configured
  - ✅ Monitoring and logging are set up

- [ ] **Compliance Requirements:**
  - ✅ Privacy policy is published
  - ✅ Terms of service are published
  - ✅ PCI compliance measures are understood
  - ✅ Data protection regulations are reviewed

---

## 🏦 Stripe Account Setup

### Step 1: Create Stripe Account

1. **Go to [stripe.com](https://stripe.com)** and create an account
2. **Choose account type:** Business account
3. **Complete business verification:**
   - Business details
   - Bank account information
   - Tax information
   - Identity verification documents

### Step 2: Complete Account Activation

1. **Submit required documents:**
   - Business registration documents
   - Bank statements
   - Identification documents

2. **Wait for approval** (usually 1-7 business days)

3. **Enable live payments** once approved

### Step 3: Configure Account Settings

1. **Dashboard → Settings → General:**
   - Set business name and logo
   - Configure business address
   - Set customer statement descriptor

2. **Dashboard → Settings → Billing:**
   - Configure billing details
   - Set up payment methods

---

## 💰 Creating Products and Pricing Plans

### Step 1: Create Products in Stripe Dashboard

1. **Navigate to Products** in your Stripe Dashboard
2. **Create the following products:**

#### Product 1: Sully Booking - Paid Plan
```
Name: Sully Booking - Paid Plan
Description: Professional booking system for restaurants and venues
Statement descriptor: SULLY PAID
```

#### Product 2: Sully Booking - Premium Plan
```
Name: Sully Booking - Premium Plan  
Description: Advanced booking system with premium features
Statement descriptor: SULLY PREMIUM
```

### Step 2: Create Pricing Plans

#### Paid Plan Pricing:
```
Product: Sully Booking - Paid Plan
Price: £29.99 GBP
Billing: Recurring monthly
Currency: GBP
Trial period: 14 days (optional)
```

#### Premium Plan Pricing:
```
Product: Sully Booking - Premium Plan
Price: £79.99 GBP
Billing: Recurring monthly
Currency: GBP
Trial period: 14 days (optional)
```

### Step 3: Copy Price IDs

After creating the pricing plans, copy the price IDs:
- Format: `price_1234567890abcdef`
- You'll need these for environment variables

---

## 🔧 Environment Configuration

### Step 1: Create Production Environment File

Create `/home/ubuntu/sully-booking-system/app/.env.production`:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sully_booking_production"

# Authentication
JWT_SECRET="your-super-secure-production-jwt-secret-key-here"

# Stripe Live Configuration
STRIPE_SECRET_KEY="sk_live_51XXXXXXXXX"  # Your live secret key
STRIPE_PUBLISHABLE_KEY="pk_live_51XXXXXXXXX"  # Your live publishable key
STRIPE_WEBHOOK_SECRET="whsec_XXXXXXXXX"  # Your webhook secret

# Stripe Product/Price IDs (from Step 3 above)
STRIPE_PAID_PRICE_ID="price_1XXXXXXXXX"     # Paid plan price ID
STRIPE_PREMIUM_PRICE_ID="price_1XXXXXXXXX"  # Premium plan price ID

# Environment Mode
NODE_ENV="production"
STRIPE_MODE="live"

# Application URLs
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
WEBHOOK_BASE_URL="https://yourdomain.com"
```

### Step 2: Verify Environment Variables

Run this command to verify your configuration:

```bash
cd /home/ubuntu/sully-booking-system/app
curl -X GET http://localhost:3000/api/stripe/config
```

Expected response:
```json
{
  "publishableKey": "pk_live_...",
  "isLiveMode": true,
  "isDemoMode": false,
  "configValid": true,
  "hasConfigErrors": false
}
```

---

## 🔗 Webhook Configuration

### Step 1: Create Webhook Endpoints in Stripe

1. **Go to Stripe Dashboard → Developers → Webhooks**
2. **Click "Add endpoint"**

#### Webhook Endpoint 1: Subscription Events
```
URL: https://yourdomain.com/api/subscriptions/webhook
Events to send:
- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
```

#### Webhook Endpoint 2: Payment Events
```
URL: https://yourdomain.com/api/payments/stripe/webhook
Events to send:
- payment_intent.succeeded
- payment_intent.payment_failed
- payment_intent.canceled
```

### Step 2: Configure Webhook Security

1. **Copy webhook signing secrets** from each endpoint
2. **Add to environment variables:**
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_your_subscription_webhook_secret"
   STRIPE_PAYMENT_WEBHOOK_SECRET="whsec_your_payment_webhook_secret"
   ```

### Step 3: Test Webhook Endpoints

Use Stripe CLI to test webhooks:

```bash
# Install Stripe CLI
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe

# Login to your Stripe account
stripe login

# Test webhooks
stripe listen --forward-to localhost:3000/api/subscriptions/webhook
stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
```

---

## 🔐 Security Measures

### Step 1: API Key Security

1. **Never commit API keys to version control**
2. **Use environment variables only**
3. **Rotate keys regularly**
4. **Monitor API key usage in Stripe Dashboard**

### Step 2: Webhook Security

1. **Always verify webhook signatures**
2. **Use HTTPS only for webhook endpoints**
3. **Implement idempotency for webhook handlers**
4. **Log webhook events for monitoring**

### Step 3: PCI Compliance

1. **Never store card details on your servers**
2. **Use Stripe Elements for card collection**
3. **Ensure SSL/TLS is properly configured**
4. **Regular security audits**

### Step 4: Rate Limiting and Monitoring

```javascript
// Add to your API routes
const rateLimit = {
  max: 100, // Limit each IP to 100 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP'
};
```

---

## 🧪 Testing Procedures

### Step 1: Test Mode Validation

Before going live, test with Stripe test keys:

```bash
# Set test environment
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_MODE="test"
```

### Step 2: Test Payment Flows

#### Test 1: Successful Subscription Payment
```bash
# Test data for successful payment
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
Postal: Any valid postal code
```

#### Test 2: Failed Payment
```bash
# Test data for declined payment
Card Number: 4000 0000 0000 0002
```

#### Test 3: 3D Secure Authentication
```bash
# Test data for 3D Secure
Card Number: 4000 0027 6000 3184
```

### Step 3: End-to-End Testing Script

Create and run this test script:

```bash
#!/bin/bash
# test-live-payments.sh

echo "🧪 Testing Live Payment Integration..."

# Test 1: Configuration validation
echo "1. Testing Stripe configuration..."
curl -X GET https://yourdomain.com/api/stripe/config

# Test 2: Create checkout session
echo "2. Testing checkout session creation..."
curl -X POST https://yourdomain.com/api/subscriptions/create-checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEST_JWT_TOKEN" \
  -d '{
    "plan": "PAID",
    "successUrl": "https://yourdomain.com/success",
    "cancelUrl": "https://yourdomain.com/cancel"
  }'

# Test 3: Webhook endpoints
echo "3. Testing webhook endpoints..."
curl -X POST https://yourdomain.com/api/subscriptions/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test_signature" \
  -d '{"type": "customer.subscription.created"}'

echo "✅ All tests completed!"
```

### Step 4: Small Amount Live Testing

⚠️ **Important:** Test with real money using small amounts

1. **Create a live subscription for £0.50**
2. **Verify payment processing**
3. **Test cancellation and refunds**
4. **Monitor Stripe Dashboard for transactions**

---

## 🚀 Go-Live Process

### Phase 1: Pre-Launch (Day -1)

1. **Backup current system:**
   ```bash
   # Backup database
   pg_dump sully_booking_db > backup_before_live_$(date +%Y%m%d).sql
   
   # Backup application
   tar -czf app_backup_$(date +%Y%m%d).tar.gz /home/ubuntu/sully-booking-system
   ```

2. **Deploy to staging environment with live keys**
3. **Run comprehensive tests**
4. **Notify team of planned go-live**

### Phase 2: Go-Live (Day 0)

1. **Switch to production environment:**
   ```bash
   cd /home/ubuntu/sully-booking-system/app
   cp .env.production .env
   ```

2. **Restart application:**
   ```bash
   yarn build
   yarn start
   ```

3. **Verify live mode activation:**
   ```bash
   curl -X GET https://yourdomain.com/api/stripe/config
   # Should return: "isLiveMode": true
   ```

4. **Test critical payment flows**
5. **Monitor for 2-4 hours continuously**

### Phase 3: Post-Launch (Day +1)

1. **Review transaction logs**
2. **Check webhook delivery success rates**
3. **Monitor error rates and performance**
4. **Verify customer support processes**

---

## 📊 Post-Go-Live Monitoring

### Daily Monitoring Checklist

- [ ] **Check Stripe Dashboard:**
  - Successful payments
  - Failed payments
  - Dispute/chargeback alerts
  - Webhook delivery status

- [ ] **Application Monitoring:**
  - Error rates in payment APIs
  - Response times
  - Database performance
  - Server resources

- [ ] **Customer Experience:**
  - Support ticket volume
  - Payment completion rates
  - Customer feedback

### Weekly Reviews

1. **Financial reconciliation**
2. **Security audit logs**
3. **Performance optimization opportunities**
4. **Customer satisfaction metrics**

### Monitoring Tools Setup

```javascript
// Add to your application
const monitoring = {
  // Payment success rate
  paymentSuccessRate: successfulPayments / totalPaymentAttempts,
  
  // Average processing time
  averageProcessingTime: totalProcessingTime / totalPayments,
  
  // Error rate
  errorRate: failedRequests / totalRequests,
  
  // Webhook delivery success rate
  webhookSuccessRate: successfulWebhooks / totalWebhooks
};
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Stripe configuration error"
**Symptoms:** API returns configuration errors
**Solution:**
```bash
# Check environment variables
echo $STRIPE_SECRET_KEY
echo $STRIPE_PUBLISHABLE_KEY

# Verify they start with correct prefixes
# Live keys: sk_live_, pk_live_
# Test keys: sk_test_, pk_test_
```

#### Issue 2: Webhook signature verification failed
**Symptoms:** Webhook endpoints return 400 errors
**Solution:**
```bash
# Check webhook secret in Stripe Dashboard
# Update STRIPE_WEBHOOK_SECRET in environment

# Test webhook locally
stripe listen --forward-to localhost:3000/api/subscriptions/webhook
```

#### Issue 3: Payment intent creation fails
**Symptoms:** 500 errors when creating payments
**Solution:**
```javascript
// Check common causes:
1. Invalid price ID
2. Missing required fields
3. Amount validation (must be > 0)
4. Currency format (lowercase)
```

#### Issue 4: Subscription creation fails
**Symptoms:** Checkout sessions don't complete
**Solution:**
```bash
# Verify in Stripe Dashboard:
1. Customer exists
2. Price ID is correct
3. Payment method is valid
4. Account is activated for live payments
```

### Emergency Procedures

#### Rollback to Demo Mode
```bash
# Emergency rollback
export STRIPE_MODE="test"
export STRIPE_SECRET_KEY="sk_test_mock_key"
yarn restart
```

#### Payment Processing Issues
1. **Immediately check Stripe Dashboard**
2. **Review application logs**
3. **Contact Stripe support if needed**
4. **Notify customers of any issues**

---

## 📞 Support and Resources

### Stripe Resources
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Support:** https://support.stripe.com
- **Stripe Status Page:** https://status.stripe.com

### Emergency Contacts
- **Stripe Support:** Available 24/7 for live account issues
- **Technical Team:** [Your technical contact information]
- **Business Owner:** [Business owner contact information]

---

## 📝 Go-Live Checklist Summary

**Pre-Launch:**
- [ ] Stripe account activated
- [ ] Products and pricing created
- [ ] Environment variables configured
- [ ] Webhooks configured and tested
- [ ] Security measures implemented
- [ ] Testing completed
- [ ] Backups created

**Launch Day:**
- [ ] Production environment deployed
- [ ] Live mode verified
- [ ] Critical flows tested
- [ ] Monitoring activated
- [ ] Team notified

**Post-Launch:**
- [ ] Daily monitoring established
- [ ] Customer support ready
- [ ] Performance metrics tracked
- [ ] Financial reconciliation process

---

**🎉 Congratulations! Your Sully booking system is now live with real Stripe payments!**

Remember to monitor closely for the first few days and address any issues promptly. Keep this guide handy for future reference and troubleshooting.

---

*Last updated: [Current Date]*
*Version: 1.0*
