# Deploying to Replit - Complete Guide

This guide will help you deploy your SFS Analytics Engine to Replit in under 15 minutes.

---

## 🚀 Quick Deploy

### Step 1: Import from GitHub

1. Go to https://replit.com
2. Click **Create Repl**
3. Select **Import from GitHub**
4. Paste your repo URL: `https://github.com/smartflow-systems/sfs-analytics-engine`
5. Click **Import from GitHub**

Replit will automatically:
- Clone your repository
- Detect Node.js
- Install dependencies (this may take 2-3 minutes)

---

## Step 2: Set Up Database

### Option A: Neon PostgreSQL (Recommended - Free tier available)

1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy the connection string (looks like `postgresql://user:pass@host/database`)

### Option B: Replit PostgreSQL

1. In your Repl, click **Tools** → **Database**
2. Enable **PostgreSQL**
3. Copy the connection string from the panel

---

## Step 3: Configure Environment Variables (Secrets)

In your Repl sidebar, click **🔒 Secrets** and add these:

### Required Secrets

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/database

# Security
JWT_SECRET=your-random-32-character-secret-here
SESSION_SECRET=your-session-secret-here

# Frontend (Replit auto-fills these)
VITE_API_URL=https://your-repl-name.your-username.repl.co
CLIENT_URL=https://your-repl-name.your-username.repl.co
```

**Generate secrets:**
```bash
# In the Replit Shell, run:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Optional: Stripe Billing Secrets

If you want to enable billing:

```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

STRIPE_PRICE_PRO=price_your_pro_price_id
STRIPE_PRICE_BUSINESS=price_your_business_price_id
STRIPE_PRICE_ENTERPRISE=price_your_enterprise_price_id
```

See `docs/STRIPE-SETUP.md` for detailed Stripe configuration.

---

## Step 4: Initialize Database

In the Replit **Shell**, run:

```bash
npm run db:push
```

This creates all 9 database tables with proper indexes.

**You should see:**
```
✓ Schema created successfully
✓ Migrations complete
```

---

## Step 5: Run the App

Click the big green **Run** button at the top!

Replit will:
1. Install dependencies (if not already done)
2. Start the development server
3. Open your app in the built-in browser

**Your app is now live!**

Access it at: `https://your-repl-name.your-username.repl.co`

---

## Step 6: Test Everything

1. **Visit your landing page** - Should see professional marketing page
2. **Click "Start Free"** - Go to registration
3. **Create an account** - Register with email/password
4. **Login** - Should redirect to dashboard
5. **Go to Settings → API Keys** - Create an API key
6. **Test event tracking**:

```bash
curl -X POST https://your-repl-name.your-username.repl.co/api/events \
  -H "X-API-Key: sfs_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "Test Event",
    "eventType": "test",
    "userId": "user_123"
  }'
```

7. **Check dashboard** - Should see 1 event!

---

## Step 7: Deploy to Production (Optional)

### Make It Always-On

By default, Replit Repls go to sleep after inactivity.

**Option 1: Replit Deployments (Recommended)**

1. Click **Deploy** button in top right
2. Choose deployment type:
   - **Autoscale** - Scales automatically ($7/mo minimum)
   - **Reserved VM** - Dedicated resources (from $10/mo)
   - **Static** - For frontend only (free)

3. Configure:
   - Add all your Secrets (they'll be copied)
   - Set deployment region
   - Configure custom domain (optional)

4. Click **Deploy**

Your app will be deployed with:
- Custom domain support
- Always-on 24/7
- Automatic scaling
- Production-grade performance

**Option 2: UptimeRobot (Free Keep-Alive)**

1. Keep your free Repl alive with UptimeRobot
2. Go to https://uptimerobot.com
3. Add New Monitor:
   - Type: HTTP(s)
   - URL: Your Repl URL
   - Interval: Every 5 minutes

---

## Replit Configuration Files

### `.replit` Configuration

Your `.replit` file is already configured:

```toml
run = "npm run dev"
language = "nodejs"
modules = ["nodejs-20"]

[deployment]
run = ["sh", "-c", "npm run build && npm start"]
deploymentTarget = "cloudrun"

[[ports]]
localPort = 5000
externalPort = 80
```

### `replit.nix` (Auto-generated)

Replit automatically manages your Nix configuration for Node.js 20.

---

## Environment Variables for Replit

### Auto-Set by Replit

These are automatically set when you deploy:

```bash
REPL_ID=your-repl-id
REPL_OWNER=your-username
REPLIT_DB_URL=your-replit-db-url
```

### You Need to Set

In **Secrets** tab:

```bash
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=...
SESSION_SECRET=...

# URLs (update with your Repl URL)
VITE_API_URL=https://your-repl.repl.co
CLIENT_URL=https://your-repl.repl.co
CORS_ORIGIN=https://your-repl.repl.co

# Optional: Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_BUSINESS=price_...
```

---

## Troubleshooting

### "Cannot connect to database"

**Solution:**
1. Check `DATABASE_URL` is set in Secrets
2. Verify connection string is correct
3. Make sure database exists
4. Test connection:
```bash
psql $DATABASE_URL
```

### "Port 5000 already in use"

**Solution:**
1. Replit might be using a different port
2. Check `.replit` file - port should be 5000
3. Restart the Repl

### "Dependencies not installing"

**Solution:**
1. Clear cache: Shell → `rm -rf node_modules package-lock.json`
2. Reinstall: `npm install`
3. Check package.json is valid

### "Stripe webhooks not working"

**Solution:**
1. For development, use Stripe CLI:
```bash
npm install -g stripe
stripe listen --forward-to https://your-repl.repl.co/api/webhooks/stripe
```

2. For production:
   - Set up webhook in Stripe Dashboard
   - Point to: `https://your-repl.repl.co/api/webhooks/stripe`
   - Add `STRIPE_WEBHOOK_SECRET` to Secrets

### "App goes to sleep"

**Solution:**
- Use Replit Deployments (always-on)
- Or use UptimeRobot free plan (pings every 5 min)

---

## Performance Tips

### 1. Use Production Build

For production, use `npm start` instead of `npm run dev`:

```bash
npm run build
npm start
```

### 2. Enable Compression

Already configured in your Express app with compression middleware.

### 3. Use CDN for Assets

For better performance, serve static assets from a CDN:
- Cloudflare (free)
- Vercel (free tier)
- BunnyCDN (paid, very fast)

### 4. Database Connection Pooling

Already configured with Drizzle ORM and Neon serverless driver.

---

## Monitoring & Logs

### View Logs

In Replit:
1. Click **Console** tab
2. See real-time server logs
3. Monitor requests, errors, and events

### Error Tracking

Add Sentry for production error tracking:

```bash
npm install @sentry/node
```

Then in your `server/index.ts`:

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
});
```

---

## Custom Domain

### Add Your Domain to Replit

1. Click **Deploy** → **Custom Domain**
2. Enter your domain (e.g., `analytics.yourdomain.com`)
3. Add DNS records:
   ```
   Type: CNAME
   Name: analytics
   Value: your-repl.repl.co
   ```
4. Wait for DNS propagation (5-60 minutes)
5. Replit automatically provisions SSL certificate

### Update Environment Variables

After adding custom domain, update:

```bash
VITE_API_URL=https://analytics.yourdomain.com
CLIENT_URL=https://analytics.yourdomain.com
CORS_ORIGIN=https://analytics.yourdomain.com
```

---

## Backup & Disaster Recovery

### Database Backups

**Neon (automatic):**
- Point-in-time recovery
- Automatic daily backups
- 7-day retention on free tier

**Manual backup:**
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Code Backups

Your code is already backed up on GitHub! Just:

```bash
git pull origin main
```

---

## Scaling Checklist

When you start getting traffic:

### At 100 Users
- [ ] Monitor server logs for errors
- [ ] Check database query performance
- [ ] Set up error tracking (Sentry)
- [ ] Add analytics (Google Analytics)

### At 1,000 Users
- [ ] Upgrade to Replit Autoscale deployment
- [ ] Add Redis for caching
- [ ] Enable database connection pooling
- [ ] Set up monitoring (UptimeRobot)

### At 10,000 Users
- [ ] Consider dedicated server (AWS, DigitalOcean)
- [ ] Add load balancing
- [ ] Set up CDN for assets
- [ ] Implement rate limiting

---

## Cost Breakdown

### Free Tier (Development)

- **Replit**: Free (with sleep mode)
- **Neon Database**: Free tier (0.5GB storage)
- **Stripe**: No monthly fee (2.9% + $0.30 per transaction)
- **Total**: $0/month

### Paid (Production)

- **Replit Autoscale**: $7-20/month
- **Neon Pro**: $19/month (3GB storage)
- **Stripe**: Transaction fees only
- **Domain**: $12/year
- **Total**: ~$26-40/month

### Revenue Potential

With just 20 paid users ($49/mo each):
- **Revenue**: $980/month
- **Costs**: $40/month
- **Profit**: $940/month (96% margin!)

---

## Next Steps After Deployment

1. ✅ **Test everything** - Create account, track events, export data
2. ✅ **Set up Stripe** - Follow `docs/STRIPE-SETUP.md`
3. ✅ **Configure domain** - Add your custom domain
4. ✅ **Enable monitoring** - Set up UptimeRobot or Sentry
5. ✅ **Create content** - Write blog posts about your analytics platform
6. ✅ **Start marketing** - Post on Product Hunt, Hacker News, Reddit
7. ✅ **Get customers** - Reach out to potential users

---

## Support

- **Replit Docs**: https://docs.replit.com
- **Community**: https://replit.com/community
- **GitHub Issues**: https://github.com/smartflow-systems/sfs-analytics-engine/issues
- **Discord**: Coming soon

---

## Quick Command Reference

```bash
# Install dependencies
npm install

# Create database tables
npm run db:push

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# View database in GUI
npm run db:studio

# Generate new migration
npm run db:generate

# Run migrations
npm run db:migrate

# Test event tracking
curl -X POST https://your-repl.repl.co/api/events \
  -H "X-API-Key: your_key" \
  -H "Content-Type: application/json" \
  -d '{"eventName":"Test","eventType":"test"}'
```

---

**Your SFS Analytics Engine is now live on Replit!** 🎉

Start tracking events, analyzing data, and making money!

**Need help?** Check the other docs in the `/docs` folder or open an issue on GitHub.
