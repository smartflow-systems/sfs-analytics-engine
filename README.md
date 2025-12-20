# SFS Analytics Engine 📊

**Open-source analytics platform that's 10x cheaper than Mixpanel**

A production-ready SaaS analytics platform with event tracking, real-time dashboards, billing integration, and data export. Built for developers who want powerful analytics without the enterprise price tag.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)](https://www.postgresql.org/)

---

## 🚀 Quick Start

Get running in under 10 minutes:

```bash
# Clone and install
git clone https://github.com/smartflow-systems/sfs-analytics-engine.git
cd sfs-analytics-engine
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL

# Create database tables
npm run db:push

# Start the app
npm run dev
```

**🎉 Open http://localhost:5173 and start tracking events!**

For detailed setup instructions, see [QUICK-START.md](./QUICK-START.md)

---

## ✨ Features

### 📈 Event Tracking & Analytics
- **Unlimited event types** - Track anything: page views, clicks, purchases, signups
- **Real-time dashboards** - See what's happening right now
- **Custom properties** - Add any metadata to your events (JSON support)
- **Batch ingestion** - Send thousands of events at once
- **API key authentication** - Secure your event tracking

### 💰 Built-In Monetization
- **Stripe integration** - Accept payments out of the box
- **Subscription management** - Auto-upgrade on payment
- **Usage quotas** - Automatically enforce event limits
- **4 pricing tiers** - Free, Pro ($49/mo), Business ($199/mo), Enterprise
- **Customer portal** - Self-service billing management

### 🔐 Multi-Tenant Architecture
- **Workspace isolation** - Each customer gets their own data space
- **Team collaboration** - Invite team members (ready for future)
- **Role-based access** - Owner, admin, member roles
- **Secure by default** - JWT auth, bcrypt passwords, workspace-scoped queries

### 📊 Data Export
- **CSV export** - Download for spreadsheets
- **JSON export** - Raw data for analysis
- **10K event limit** - Export up to 10,000 events at once

### 🎨 Beautiful UI
- **Modern landing page** - Conversion-optimized with pricing
- **Dark mode** - Full theme support
- **Responsive design** - Works on all devices
- **Professional dashboards** - Charts, tables, and metrics
- **shadcn/ui components** - Beautiful, accessible components

---

## 🏗️ Tech Stack

### Frontend
- **React 18** + **TypeScript** - Type-safe UI
- **Vite** - Lightning-fast builds
- **TanStack Query** - Smart data fetching
- **Wouter** - Tiny router
- **shadcn/ui** - Beautiful components
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization

### Backend
- **Node.js** + **Express** - Fast, proven stack
- **PostgreSQL** - Reliable relational database
- **Drizzle ORM** - Type-safe SQL queries
- **Stripe** - Payment processing
- **Zod** - Runtime validation
- **JWT** - Secure authentication

---

## 💸 Pricing Model

### Why We're 10x Cheaper

| Provider | Price | Event Limit | Our Advantage |
|----------|-------|-------------|---------------|
| Mixpanel | $89/mo + $0.0003/event | ~300K events | **10x cheaper** |
| Amplitude | $61/mo + overages | 10M/year cap | **No caps** |
| Segment | $120/mo | Limited sources | **Unlimited** |
| **SFS Analytics** | **$49/mo flat** | **500K events** | **🎉 Best value** |

### Subscription Tiers

- **Free**: $0/mo - 10,000 events/month - Perfect for side projects
- **Pro**: $49/mo - 500,000 events/month - For growing businesses
- **Business**: $199/mo - 5,000,000 events/month - For scaling companies
- **Enterprise**: Custom - Unlimited events - For large organizations

**No overage fees. No surprises. Just flat, predictable pricing.**

---

## 📖 Documentation

- **[Quick Start](./QUICK-START.md)** - Get running in 10 minutes
- **[Setup Guide](./SETUP.md)** - Detailed installation
- **[Stripe Setup](./docs/STRIPE-SETUP.md)** - Configure billing
- **[Build Summary](./docs/BUILD-SUMMARY.md)** - Complete feature list
- **[What's Built](./docs/WHATS-BUILT.md)** - Architecture deep dive

---

## 🎯 Use Cases

### SaaS Analytics
Track user behavior, conversion funnels, and retention. Understand what features drive engagement.

### Product Analytics
Monitor feature adoption, user journeys, and drop-off points. Make data-driven decisions.

### Usage-Based Billing
Track API calls, resource usage, and generate invoices. Bill customers accurately.

### Marketing Attribution
Track campaign performance, conversion sources, and ROI. Optimize your marketing spend.

### Mobile App Analytics
Track in-app events, user sessions, and crash reports. Build better mobile experiences.

---

## 🔥 Key Features Explained

### Event Tracking API

Track events with a simple API call:

```bash
curl -X POST https://your-domain.com/api/events \
  -H "X-API-Key: sfs_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "Purchase Completed",
    "eventType": "conversion",
    "userId": "user_123",
    "properties": {
      "amount": 99.99,
      "plan": "pro",
      "currency": "USD"
    }
  }'
```

### Real-Time Dashboard

- **Total Events** - See your event volume
- **Unique Users** - Track active users
- **Top Events** - Most frequent actions
- **Event Volume Chart** - Trends over time
- **Date Range Picker** - Filter by time period

### Billing Integration

1. User clicks "Upgrade to Pro"
2. Redirected to Stripe checkout
3. After payment, webhook auto-upgrades workspace
4. Event quota increases from 10K → 500K
5. User can manage subscription in Stripe portal

### Data Export

Export your events for further analysis:

- **CSV Format** - Import into Excel, Google Sheets
- **JSON Format** - Process with custom scripts
- **Automatic Download** - One-click export
- **Smart Naming** - Files named with workspace and date

---

## 🚢 Deployment

### One-Click Deploy

Deploy to your favorite platform:

**Vercel:**
```bash
vercel --prod
```

**Railway:**
```bash
railway up
```

**Render:**
```bash
# Connect GitHub repo and deploy
```

**Docker:**
```bash
docker build -t sfs-analytics .
docker run -p 5000:5000 --env-file .env sfs-analytics
```

### Environment Variables

Required for production:

```bash
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_PRICE_PRO=price_your_price_id
STRIPE_PRICE_BUSINESS=price_your_price_id
```

See [.env.example](./.env.example) for complete list.

---

## 📊 Database Schema

9 production tables:

- **users** - User accounts with authentication
- **workspaces** - Multi-tenant workspaces with billing
- **workspace_members** - Team collaboration
- **api_keys** - API keys for event tracking
- **events** - Event data (18 fields, 9 indexes)
- **reports** - Custom analytics reports
- **funnels** - Conversion funnel definitions
- **alerts** - Automated alert rules
- **dashboards** - Custom dashboard layouts

---

## 🔒 Security

- **✅ Passwords hashed** with bcrypt
- **✅ JWT authentication** with expiration
- **✅ API key system** for event tracking
- **✅ Workspace isolation** - Data never leaks between tenants
- **✅ Stripe webhook verification** - Secure payment processing
- **✅ SQL injection protection** - Drizzle ORM parameterized queries
- **✅ XSS protection** - React auto-escaping

---

## 🎨 Screenshots

### Landing Page
Professional marketing page with pricing and features.

### Dashboard
Real-time metrics, charts, and event tracking.

### Settings
API key management, billing portal, team collaboration.

### Events Explorer
Search, filter, and export your event data.

---

## 🛣️ Roadmap

### ✅ Completed
- [x] Event tracking API
- [x] Real-time analytics
- [x] Multi-tenant architecture
- [x] Stripe billing integration
- [x] Data export (CSV/JSON)
- [x] Landing page
- [x] Dashboard UI
- [x] Authentication system

### 🚧 In Progress
- [ ] WebSocket for real-time updates
- [ ] Email notifications
- [ ] Funnel visualizations

### 📋 Planned
- [ ] Team collaboration features
- [ ] Advanced filtering
- [ ] Custom integrations (Slack, Discord)
- [ ] Mobile SDKs
- [ ] API rate limiting
- [ ] Data retention policies
- [ ] Admin dashboard
- [ ] A/B testing support

---

## 📈 Revenue Projections

**Conservative (Year 1):**
- 20 Pro users ($49/mo) = $11,760/yr
- 5 Business users ($199/mo) = $11,940/yr
- **Total: $23,700/yr**

**Moderate (Year 2):**
- 100 Pro users = $58,800/yr
- 25 Business users = $59,700/yr
- 2 Enterprise users = $23,976/yr
- **Total: $142,476/yr**

**Optimistic (Year 3):**
- 300 Pro users = $176,400/yr
- 100 Business users = $238,800/yr
- 10 Enterprise users = $119,880/yr
- **Total: $535,080/yr**

---

## 🤝 Contributing

We welcome contributions! Here's how to help:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with:
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful components
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe SQL
- [Stripe](https://stripe.com/) - Payment processing
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Vercel](https://vercel.com/) - Deployment platform

---

## 🔗 Links

- **Live Demo**: Coming soon
- **Documentation**: [docs/](./docs/)
- **API Reference**: Coming soon
- **GitHub**: https://github.com/smartflow-systems/sfs-analytics-engine
- **Issues**: https://github.com/smartflow-systems/sfs-analytics-engine/issues

---

## 💬 Support

- **Documentation**: Check the [docs](./docs/) folder
- **GitHub Issues**: Report bugs or request features
- **Email**: support@smartflow-systems.com
- **Discord**: Coming soon

---

## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub!

---

**Built with ❤️ by Smartflow Systems**

**Making analytics accessible to everyone.**

---

## 🚀 Get Started Now

```bash
git clone https://github.com/smartflow-systems/sfs-analytics-engine.git
cd sfs-analytics-engine
npm install
npm run dev
```

**Your analytics platform is ready in under 10 minutes!**

See [QUICK-START.md](./QUICK-START.md) for detailed instructions.

---

**Go build something amazing! 🎉**
