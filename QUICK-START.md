# Quick Start Guide - SFS Analytics Engine

Get your analytics platform running in under 10 minutes.

---

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or Neon account)
- Stripe account (for billing)

---

## 1. Clone & Install (2 minutes)

```bash
cd sfs-analytics-engine
npm install
```

---

## 2. Database Setup (3 minutes)

### Option A: Neon (Recommended - Free tier available)

1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy the connection string

### Option B: Local PostgreSQL

```bash
# Create database
createdb sfs_analytics

# Your connection string:
postgresql://user:password@localhost:5432/sfs_analytics
```

---

## 3. Environment Configuration (2 minutes)

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` with your values:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database

# Security (generate random strings)
JWT_SECRET=your-secret-here-change-this
SESSION_SECRET=your-session-secret-here

# Stripe (get from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Frontend
VITE_API_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

**Generate secrets:**
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Session Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 4. Create Database Tables (1 minute)

```bash
npm run db:push
```

This creates all 9 tables with proper indexes.

---

## 5. Start the App (1 minute)

```bash
# Development mode (auto-reload)
npm run dev
```

**Your app is now running!**

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 6. Create Your First Account

1. Open http://localhost:5173
2. Click "Start Free" or "Sign In"
3. Go to "Sign Up" and create an account
4. You'll be redirected to the dashboard

---

## 7. Create API Key & Track Events

1. Go to **Settings** → **API Keys**
2. Click "Create API Key"
3. Copy your key (starts with `sfs_`)

**Test event tracking:**

```bash
curl -X POST http://localhost:5000/api/events \
  -H "X-API-Key: sfs_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "User Signup",
    "eventType": "conversion",
    "userId": "user_123",
    "properties": {
      "plan": "free",
      "source": "landing_page"
    }
  }'
```

**Check your dashboard** - you should see 1 event!

---

## 8. Set Up Stripe Billing (Optional - 5 minutes)

### Quick Setup

1. Go to https://dashboard.stripe.com
2. Get your test API keys (Developers → API Keys)
3. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   ```

### Create Products

1. Go to Products → Add Product
2. Create "Analytics Pro" - $49/month recurring
3. Copy the Price ID (starts with `price_`)
4. Add to `.env`:
   ```
   STRIPE_PRICE_PRO=price_...
   ```

### Webhook Setup

1. Developers → Webhooks → Add Endpoint
2. URL: `http://localhost:5000/api/webhooks/stripe`
3. Events: Select all `customer.subscription.*` and `checkout.session.completed`
4. Copy Signing Secret
5. Add to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

**For local testing:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from stripe.com/docs/stripe-cli

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

**Full guide:** See `docs/STRIPE-SETUP.md`

---

## Common Commands

```bash
# Development (with auto-reload)
npm run dev

# Production build
npm run build

# Production start
npm start

# Database operations
npm run db:push      # Create/update tables
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio (GUI)

# Testing
npm test

# Linting
npm run lint
```

---

## Troubleshooting

### Port already in use
```bash
# Kill process on port 5000 or 5173
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database connection fails
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

### Stripe webhooks not working
- Use Stripe CLI for local testing
- Check webhook signature in Stripe dashboard
- Verify `STRIPE_WEBHOOK_SECRET` matches

### Events not appearing
- Check API key is correct
- Verify workspace ID in requests
- Check browser console for errors
- Look at server logs for errors

---

## What to Do Next

### 1. Customize Your Instance
- Update company name in `client/src/pages/Landing.tsx`
- Add your logo
- Configure domain

### 2. Deploy to Production
- Choose hosting: Vercel, Railway, Render, or Fly.io
- Set environment variables in hosting dashboard
- Point domain to deployment
- Enable HTTPS

### 3. Configure Stripe for Live Mode
- Complete Stripe account activation
- Create live products
- Update environment variables with live keys
- Test with real payment

### 4. Start Marketing
- Share on social media
- Post on Product Hunt
- Write comparison blog posts
- Create demo videos

---

## Production Deployment

### Vercel (Recommended for Next.js)

```bash
npm install -g vercel
vercel

# Set environment variables in Vercel dashboard
# Deploy: vercel --prod
```

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Docker

```bash
# Build image
docker build -t sfs-analytics .

# Run container
docker run -p 5000:5000 --env-file .env sfs-analytics
```

---

## Need Help?

- **Setup Guide:** `SETUP.md`
- **Stripe Guide:** `docs/STRIPE-SETUP.md`
- **Feature List:** `docs/WHATS-BUILT.md`
- **Build Summary:** `docs/BUILD-SUMMARY.md`
- **GitHub Issues:** https://github.com/smartflow-systems/sfs-analytics-engine/issues

---

## Success Checklist

- [ ] Database connected and tables created
- [ ] App running on localhost
- [ ] Created user account
- [ ] Generated API key
- [ ] Sent test event successfully
- [ ] Event appears in dashboard
- [ ] Stripe configured (if using billing)
- [ ] Exported data to CSV/JSON
- [ ] Tested plan upgrade flow

**All checked?** You're ready to deploy! 🚀

---

**Time to first event tracked: < 10 minutes**

**Time to first paying customer: 1-2 weeks**

**Let's build something amazing!**
