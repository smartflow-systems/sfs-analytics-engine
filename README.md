# SFS Analytics Engine

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

## Development

```bash
npm run dev        # Start dev server (port 5000)
npm run build      # Build for production
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
```

## Environment Variables

See `.env.example` for all configuration options.

## Contributing

Part of the SmartFlow Systems ecosystem. Follow organization coding standards.

## License

Proprietary - SmartFlow Systems
