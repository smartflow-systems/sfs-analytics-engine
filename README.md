# SFS Analytics Engine

<<<<<<< HEAD
**Centralized event tracking and analytics platform for all SmartFlow Systems (SFS) applications**

A production-ready Mixpanel alternative built specifically for the SFS ecosystem, powering usage-based billing, real-time analytics, and customer insights across all 13 SFS apps.

## Features

### Event Tracking
- **High-throughput ingestion**: Handle 1,000+ events/second
- **Real-time processing**: Events appear instantly in dashboards
- **Rich event properties**: Track custom metadata with each event
- **Session tracking**: Automatic session management and user journey tracking
- **Multi-tenant architecture**: Workspace isolation for data security

### Analytics & Insights
- **Real-time dashboards**: Live metrics updating every 30 seconds
- **Funnel analysis**: Track conversion rates through multi-step flows
- **Cohort retention**: Analyze user retention at 7, 30, and 90 days
- **Event explorer**: Search and filter through millions of events
- **Top events tracking**: Identify most frequent user actions

### Alerts & Monitoring
- **Anomaly detection**: Automatic spike detection in metrics
- **Usage limit warnings**: Alert when workspaces approach quotas
- **Churn risk detection**: Identify inactive users (14+ days)
- **Custom alerts**: Configure Slack, email, or webhook notifications

### Multi-tenancy & Billing
- **Workspace isolation**: Each customer gets a dedicated workspace
- **Usage-based pricing**:
  - Free: 10K events/month
  - Pro: 100K events/month
  - Enterprise: Unlimited + custom dashboards
- **API quota management**: Track and enforce event limits

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with SFS design system
- **Charts**: Recharts
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Event Queue**: Redis (optional, for high throughput)

### SFS Design System
- **Color Scheme**: HSL-based with SFS primary colors
- **Typography**: Inter for UI, JetBrains Mono for code
- **Elevation System**: Consistent hover/active states
- **Dark Mode**: Full support with next-themes
- **Glass Effects**: Backdrop blur for headers

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (local or Neon)
- Redis (optional, for production)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd sfs-analytics-engine
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Initialize the database**
```bash
npm run db:push
```

4. **Seed demo data (optional)**
```bash
# Start the dev server first
npm run dev

# In another terminal, seed demo data
curl -X POST http://localhost:5000/api/seed
```

5. **Open the dashboard**
```
http://localhost:5000
```

## API Endpoints

### Event Tracking

**POST /api/events** - Track a single event
```json
{
  "eventName": "invoice_sent",
  "userId": "user-456",
  "properties": {
    "amount": 1250,
    "currency": "GBP"
  }
}
```

**POST /api/events/batch** - Track multiple events (up to 1000)
```json
{
  "events": [
    { "eventName": "page_view", "userId": "user-123", "properties": {} },
    { "eventName": "button_click", "userId": "user-456", "properties": {} }
  ]
}
```

### Analytics

**GET /api/analytics/stats?range=7d**
```json
{
  "totalEvents": 12345,
  "uniqueUsers": 456
}
```

**GET /api/analytics/volume?range=7d**
```json
[
  { "date": "2024-01-15", "events": 456 },
  { "date": "2024-01-16", "events": 523 }
]
```

**GET /api/analytics/top-events?range=7d**
```json
[
  { "eventName": "page_view", "count": 5000, "change": 12.5 },
  { "eventName": "button_click", "count": 3200, "change": -5.2 }
]
```

**GET /api/analytics/event-types**
```json
[
  { "name": "page_view", "count": 5000, "users": 234, "avgProps": 3 }
]
```

### Reports

**GET /api/reports** - List all reports
**POST /api/reports** - Create a new report
**GET /api/reports/:id** - Get report by ID
**PATCH /api/reports/:id** - Update report
**DELETE /api/reports/:id** - Delete report

## SDK Usage (for other SFS apps)

```typescript
// Track an event
fetch('/api/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventName: 'invoice_sent',
    userId: 'user_456',
    properties: {
      amount: 1250,
      currency: 'GBP',
      customer_id: 'cust_123'
    }
  })
});

// Batch track events
fetch('/api/events/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    events: [
      { eventName: 'qr_scanned', userId: 'user_456', properties: { location: 'London' } },
      { eventName: 'link_clicked', userId: 'user_789', properties: { referrer: 'google' } }
    ]
  })
});
```

## Database Schema

### Core Tables
- **events**: Event tracking data (id, event_name, user_id, timestamp, properties)
- **reports**: Report definitions (id, name, description, type, config, created_at, updated_at)

### Indexes
- Timestamp (for fast date range queries)
- Event name (for filtering by event type)
- User ID (for user-specific analytics)

## Performance

### Targets
- **Event ingestion**: <100ms p95 latency
- **Dashboard queries**: <200ms response time
- **Concurrent users**: 1,000+ simultaneous connections
- **Event throughput**: 1,000 events/second

### Optimization Techniques
- In-memory caching for analytics queries (30-second TTL)
- PostgreSQL table indexing
- React Query caching (30s refresh)
- Batch event ingestion support

## Project Structure

```
/client
  /src
    /components/ui    # shadcn components
    /components       # custom components
    /pages           # page components
    /hooks           # custom hooks
    /lib             # utilities
/server
  /routes.ts         # API routes
  /storage.ts        # database operations
  /db.ts             # database connection
/shared
  /schema.ts         # Drizzle schema & types
```
=======
[![CI/CD Pipeline](https://github.com/smartflow-systems/sfs-analytics-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/smartflow-systems/sfs-analytics-engine/actions/workflows/ci.yml)
[![CD](https://github.com/smartflow-systems/sfs-analytics-engine/actions/workflows/cd.yml/badge.svg)](https://github.com/smartflow-systems/sfs-analytics-engine/actions/workflows/cd.yml)
[![SmartFlow Systems](https://img.shields.io/badge/SmartFlow-Systems-FFD700?style=flat&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACZSURBVHgBnZLBDYAwDAPtzP+f1pE6Qjd](https://github.com/smartflow-systems)

Part of the **SmartFlow Systems** ecosystem.

## Overview

**SFS Analytics Engine** is a comprehensive event tracking and analytics platform designed for the SmartFlow Systems ecosystem. Track user interactions, monitor application performance, and gain insights across all SFS services.

🔗 **Live Demo:** [https://sfs-analytics-engine--Smart-F-Syst.replit.app](https://sfs-analytics-engine--Smart-F-Syst.replit.app)

## Features

### 📊 Analytics & Tracking
- **Event Tracking** - Track user actions, page views, clicks, form submissions, API calls, and errors
- **Real-time Monitoring** - Monitor events as they happen across your SFS ecosystem
- **Aggregation & Insights** - Get summaries, top events, and trend analysis
- **Flexible Metadata** - Attach custom JSON data to any event for rich context

### 🔗 SFS Ecosystem Integration
- **Cross-Service Analytics** - Track events from SmartFlowSite, SocialScaleBooster, SFSDataQueryEngine, and more
- **Webhook Support** - Bulk event ingestion from other SFS services
- **API-First Design** - RESTful API for easy integration
- **Service-Specific Insights** - Get analytics breakdowns per SFS application

### 💎 Additional Features
- **Date Range Filtering** - Query events by time period
- **User & Session Tracking** - Group events by user or session
- **Source Tracking** - Know which SFS app generated each event
- **Top Events Analysis** - Discover most frequent user actions
- **Trend Visualization** - View event counts over time (hourly, daily, weekly, monthly)
- **Health Monitoring** - SFS-standard health check endpoints

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, shadcn/ui, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Storage**: In-memory with 500+ sample events (upgradeable to PostgreSQL)
- **Validation**: Zod schema validation
- **UI Components**: shadcn/ui with SFS theme support
- **State Management**: React Query (@tanstack/react-query)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/smartflow-systems/sfs-analytics-engine.git
cd sfs-analytics-engine

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The application will start on `http://localhost:5000` (or the port specified in `PORT` environment variable).

## API Documentation

Full API documentation is available at [docs/API.md](docs/API.md)

### Quick Start - Track an Event

```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "User Login",
    "eventType": "auth",
    "source": "SmartFlowSite",
    "userId": "user_123",
    "metadata": { "page": "/dashboard" }
  }'
```

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check (SFS standard) |
| `/api/events` | POST | Track a new event |
| `/api/events` | GET | Retrieve events with filters |
| `/api/analytics/summary` | GET | Get analytics overview |
| `/api/analytics/top-events` | GET | Most frequent events |
| `/api/analytics/trends` | GET | Event trends over time |
| `/api/webhook/event` | POST | Bulk event tracking |
| `/api/integrations/:service/analytics` | GET | Service-specific analytics |

See [API Documentation](docs/API.md) for complete details.
>>>>>>> fab568c6475a339b59d9300af6414b664c295e9e

## Development

```bash
npm run dev        # Start dev server (port 5000)
npm run build      # Build for production
<<<<<<< HEAD
npm run db:push    # Push database schema
```

## Architecture Decisions

### Why PostgreSQL over ClickHouse?
- Simpler operational overhead
- Strong ACID guarantees
- Excellent JSON support for event properties
- Can scale to 10M events/day with proper partitioning
- Migrate to ClickHouse when hitting 100M+ events/day

### Why In-Memory Cache over Redis?
- For <1,000 events/sec, in-memory caching is sufficient
- Redis adds operational complexity
- Can add Redis later when throughput demands it

### Why Drizzle over Prisma?
- Lighter weight and faster
- Better TypeScript inference
- More control over SQL generation
- Excellent Neon serverless support

## Integration with Other SFS Apps

### Invoice App
```typescript
trackEvent('invoice_sent', { amount, customer_id, currency });
trackEvent('invoice_paid', { amount, payment_method });
```

### QR Code App
```typescript
trackEvent('qr_created', { type, campaign_id });
trackEvent('qr_scanned', { location, device });
```

### URL Shortener
```typescript
trackEvent('link_created', { original_url, custom_slug });
trackEvent('link_clicked', { referrer, country });
=======
npm test           # Run tests
npm run sync       # Sync with Git (auto-commit)
>>>>>>> fab568c6475a339b59d9300af6414b664c295e9e
```

## Environment Variables

<<<<<<< HEAD
See `.env.example` for all configuration options.
=======
See `.env.example` for configuration options:

```bash
# Application
PORT=5004
NODE_ENV=development

# Authentication (for webhook endpoints)
API_KEY=your-api-key-here
SFS_PAT=your-sfs-personal-access-token

# Optional: Time Series DB
TIMESERIES_DB_URL=http://localhost:8086
REDIS_URL=redis://localhost:6379
```

## Project Structure

```
/client                    # React frontend
  /src
    /components           # React components
    /components/ui        # shadcn UI components
    /pages               # Page components (Dashboard, Events, Reports, Settings)
    /hooks               # Custom React hooks
    /lib                 # Utilities
/server                   # Express backend
  index.ts              # Server entry point
  routes.ts             # API route definitions
  storage.ts            # Data storage layer (in-memory)
  vite.ts               # Vite dev server integration
/shared
  schema.ts             # Shared TypeScript schemas (Drizzle ORM)
/docs
  API.md                # Complete API documentation
/scripts                 # Deployment and utility scripts
```

## SFS Ecosystem Integration

### Sending Events from Other SFS Services

```javascript
// Example: Track an event from SocialScaleBooster
const response = await fetch('https://sfs-analytics-engine--Smart-F-Syst.replit.app/api/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventName: 'Post Published',
    eventType: 'social_action',
    source: 'SocialScaleBooster',
    userId: 'user_456',
    metadata: {
      platform: 'twitter',
      engagement: 42
    }
  })
});
```

### Bulk Event Tracking (Webhook)

```javascript
await fetch('https://sfs-analytics-engine--Smart-F-Syst.replit.app/api/webhook/event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: process.env.SFS_PAT,
    events: [
      { eventName: 'Campaign Launched', eventType: 'marketing', source: 'sfs-marketing-and-growth' },
      { eventName: 'Query Executed', eventType: 'data_query', source: 'SFSDataQueryEngine' }
    ]
  })
});
```

## Sample Data

The application seeds 500 sample events on startup for demonstration purposes, including:
- **Event Types**: page_view, click, form_submit, api_call, error
- **Sources**: SmartFlowSite, SocialScaleBooster, SFSDataQueryEngine, sfs-marketing-and-growth
- **Time Range**: Last 30 days

## Deployment

### Replit Deployment

This application is configured for Replit deployment:

1. Import the GitHub repository into Replit
2. Set environment variables in Replit Secrets
3. Run the project - it will automatically start on port 5000

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
NODE_ENV=production npm start
```

## SmartFlow Design System

This application follows the SFS design system:
- **Colors**: Brown/Black/Gold signature palette (customizable)
- **Dark Mode**: Full dark mode support with theme toggle
- **Circuit Flow**: Animated circuit background (optional)
- **Glass Cards**: Glassmorphism UI components
- **Responsive**: Mobile-first Tailwind CSS layout
- **Accessible**: ARIA-compliant shadcn components

## Health Check

Standard SFS health check endpoint:

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "ok": true,
  "service": "sfs-analytics-engine",
  "version": "1.0.0",
  "timestamp": "2025-11-29T12:00:00.000Z"
}
```

## Roadmap

- [ ] PostgreSQL integration (replace in-memory storage)
- [ ] Real-time WebSocket event streaming
- [ ] Custom dashboard builder
- [ ] Advanced filtering and segmentation
- [ ] Export to CSV/JSON/Excel
- [ ] Alert triggers based on event patterns
- [ ] User cohort analysis
- [ ] Funnel visualization
>>>>>>> fab568c6475a339b59d9300af6414b664c295e9e

## Contributing

Part of the SmartFlow Systems ecosystem. Follow organization coding standards.

## License

Proprietary - SmartFlow Systems
<<<<<<< HEAD
=======

---

**Built with ❤️ by SmartFlow Systems**

For questions or support, visit [SmartFlow Systems](https://smartflow-systems.replit.app)
>>>>>>> fab568c6475a339b59d9300af6414b664c295e9e
