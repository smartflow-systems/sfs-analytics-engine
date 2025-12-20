# 🚀 Deployment Checklist

Use this checklist to deploy your SFS Analytics Engine to production.

---

## ✅ Pre-Deployment (Local Testing)

### Code Quality
- [x] All code committed to GitHub
- [x] No merge conflicts
- [x] Dependencies up to date
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] All tests passing (if you added tests)
- [ ] No console errors in browser

### Database
- [ ] Database schema finalized
- [ ] Migrations created and tested
- [ ] Sample data works correctly
- [ ] Indexes created for performance

### Environment Variables
- [ ] `.env.example` is up to date
- [ ] No secrets in `.env.example`
- [ ] All required variables documented

---

## 🎯 Choose Your Deployment Platform

Pick ONE platform and complete its checklist:

### Option 1: Replit (Easiest - 15 minutes)
- [ ] Follow [REPLIT-DEPLOY.md](./REPLIT-DEPLOY.md)
- [ ] Import from GitHub
- [ ] Set up Secrets
- [ ] Run `npm run db:push`
- [ ] Test the app
- [ ] Deploy to production

### Option 2: Vercel (Best for Frontend)
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Run `vercel` in project root
- [ ] Set environment variables in dashboard
- [ ] Configure database URL
- [ ] Deploy: `vercel --prod`

### Option 3: Railway (Best for Full-Stack)
- [ ] Sign up at railway.app
- [ ] Connect GitHub repository
- [ ] Add PostgreSQL database
- [ ] Set environment variables
- [ ] Deploy automatically

### Option 4: Render (Good Free Tier)
- [ ] Sign up at render.com
- [ ] Create Web Service from GitHub
- [ ] Add PostgreSQL database
- [ ] Set environment variables
- [ ] Deploy

---

## 🗄️ Database Setup

### Neon PostgreSQL (Recommended)
- [ ] Sign up at neon.tech
- [ ] Create new project
- [ ] Copy connection string
- [ ] Add to `DATABASE_URL` env var
- [ ] Run migrations: `npm run db:push`

### Alternative: Supabase
- [ ] Sign up at supabase.com
- [ ] Create new project
- [ ] Get connection string
- [ ] Add to `DATABASE_URL`
- [ ] Run migrations

### Alternative: Railway PostgreSQL
- [ ] Add PostgreSQL in Railway dashboard
- [ ] Copy connection string
- [ ] Use Railway's internal URL

---

## 🔐 Environment Variables

Copy these to your deployment platform:

### Required (Backend)
```bash
DATABASE_URL=postgresql://user:pass@host/database
JWT_SECRET=your-32-character-random-secret
SESSION_SECRET=your-session-secret
PORT=5000
NODE_ENV=production
```

### Required (Frontend)
```bash
VITE_API_URL=https://your-domain.com
CLIENT_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

### Optional (Stripe Billing)
```bash
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_PRICE_PRO=price_xxxxx
STRIPE_PRICE_BUSINESS=price_xxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxx
```

### Generate Secrets
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Session Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 💳 Stripe Setup (Optional but Recommended)

Follow [docs/STRIPE-SETUP.md](./docs/STRIPE-SETUP.md) for complete guide:

- [ ] Create Stripe account
- [ ] Get API keys (test mode first)
- [ ] Create products (Pro, Business, Enterprise)
- [ ] Get price IDs
- [ ] Set up webhook endpoint
- [ ] Add webhook secret
- [ ] Test with test card: 4242 4242 4242 4242
- [ ] Switch to live mode when ready

---

## 🧪 Testing Checklist

### Frontend
- [ ] Landing page loads correctly
- [ ] Registration works
- [ ] Login works
- [ ] Dashboard displays
- [ ] Settings page loads
- [ ] Dark mode toggle works
- [ ] Responsive on mobile

### Backend
- [ ] Health endpoint: `GET /health`
- [ ] User registration: `POST /api/auth/register`
- [ ] User login: `POST /api/auth/login`
- [ ] Event tracking: `POST /api/events`
- [ ] Analytics: `GET /api/workspaces/:id/analytics/stats`

### Event Tracking Test
```bash
# Create account and get API key, then:
curl -X POST https://your-domain.com/api/events \
  -H "X-API-Key: sfs_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "Test Event",
    "eventType": "test",
    "userId": "test_user_123"
  }'
```

### Stripe Test (if enabled)
- [ ] Click "Upgrade to Pro"
- [ ] Redirected to Stripe Checkout
- [ ] Use test card: 4242 4242 4242 4242
- [ ] Complete payment
- [ ] Verify plan upgraded in database
- [ ] Check webhook received in Stripe dashboard

---

## 🌐 Domain Setup (Optional)

### Purchase Domain
- [ ] Buy domain from Namecheap, GoDaddy, or Cloudflare
- [ ] Cost: ~$10-15/year

### DNS Configuration
- [ ] Add CNAME record pointing to your deployment
- [ ] Example: `analytics.yourdomain.com` → `your-app.vercel.app`
- [ ] Wait for DNS propagation (5-60 minutes)
- [ ] Test: `ping analytics.yourdomain.com`

### SSL Certificate
Most platforms auto-provision SSL:
- [x] Vercel: Automatic
- [x] Railway: Automatic
- [x] Render: Automatic
- [x] Replit: Automatic

---

## 📊 Monitoring Setup

### Error Tracking - Sentry (Recommended)
- [ ] Sign up at sentry.io (free tier available)
- [ ] Create new project
- [ ] Get DSN
- [ ] Install: `npm install @sentry/node @sentry/react`
- [ ] Add to code
- [ ] Test error tracking

### Uptime Monitoring - UptimeRobot (Free)
- [ ] Sign up at uptimerobot.com
- [ ] Add HTTP monitor
- [ ] URL: Your production URL
- [ ] Interval: Every 5 minutes
- [ ] Get alerts via email/SMS

### Analytics - Google Analytics (Optional)
- [ ] Create GA4 property
- [ ] Get measurement ID
- [ ] Add to frontend
- [ ] Test events

---

## 🔒 Security Checklist

### Before Going Live
- [ ] HTTPS enabled (SSL certificate)
- [ ] Secrets not in code or GitHub
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (TODO - add later)
- [ ] SQL injection protected (✅ using Drizzle ORM)
- [ ] XSS protected (✅ React auto-escaping)
- [ ] Passwords hashed (✅ using bcrypt)
- [ ] JWT tokens secured
- [ ] API keys secured
- [ ] Stripe webhooks verified

### Dependabot Alert
GitHub detected 1 moderate vulnerability:
- [ ] Visit: https://github.com/smartflow-systems/sfs-analytics-engine/security/dependabot/1
- [ ] Review the vulnerability
- [ ] Update the dependency
- [ ] Test after update
- [ ] Commit and deploy

---

## 📱 Marketing Checklist (Post-Deployment)

### Content
- [ ] Update landing page copy
- [ ] Add your logo
- [ ] Add screenshots
- [ ] Write product description
- [ ] Create demo video

### Launch
- [ ] Post on Product Hunt
- [ ] Share on Hacker News (Show HN)
- [ ] Post on Reddit (r/SideProject, r/SaaS)
- [ ] Share on Twitter/X
- [ ] Share on LinkedIn
- [ ] Email newsletter subscribers

### SEO
- [ ] Add meta tags
- [ ] Create sitemap.xml
- [ ] Submit to Google Search Console
- [ ] Create blog (optional)
- [ ] Write comparison articles (vs Mixpanel, vs Amplitude)

---

## 💰 Business Checklist

### Legal
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Cookie Policy
- [ ] GDPR compliance (if EU users)

### Support
- [ ] Set up support email
- [ ] Create documentation site
- [ ] Join relevant communities
- [ ] Set up Discord/Slack community

### Growth
- [ ] Set revenue goals
- [ ] Track key metrics (MRR, churn, CAC)
- [ ] Create referral program
- [ ] Offer free trial
- [ ] Build email drip campaign

---

## 🎯 First Week Goals

- [ ] Get 10 sign-ups
- [ ] Get 1 paying customer
- [ ] Track 1,000 events
- [ ] Get feedback from users
- [ ] Fix any critical bugs
- [ ] Improve based on feedback

---

## 📞 Support & Help

### Documentation
- [Quick Start Guide](./QUICK-START.md)
- [Stripe Setup](./docs/STRIPE-SETUP.md)
- [Replit Deploy](./REPLIT-DEPLOY.md)
- [Build Summary](./docs/BUILD-SUMMARY.md)

### Community
- GitHub Issues: Report bugs
- Discord: Coming soon
- Email: support@your-domain.com

---

## ✨ Final Checks

Before announcing your launch:

- [ ] Everything works on mobile
- [ ] Everything works in different browsers
- [ ] Email notifications work (if enabled)
- [ ] Payment flow tested end-to-end
- [ ] Data export tested
- [ ] API documentation accurate
- [ ] Error messages user-friendly
- [ ] Loading states smooth
- [ ] No broken links

---

## 🚀 Launch Commands

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Check Production Build
```bash
NODE_ENV=production npm start
```

---

## 🎉 You're Ready to Launch!

When all checkboxes are ticked:

1. Take a deep breath
2. Click that Deploy button
3. Share with the world
4. Monitor for issues
5. Iterate based on feedback
6. Make money! 💰

**Remember:**
- Start with test mode (Stripe)
- Test everything thoroughly
- Monitor errors closely first week
- Listen to user feedback
- Iterate quickly

---

**Good luck with your launch!** 🚀

**You've built something amazing. Now go make it successful!**
