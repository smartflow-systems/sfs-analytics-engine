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
  - Pro: 100K events/month (£29/month)
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
- **Color Scheme**: HSL-based with SFS Blue primary (#3B82F6)
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
curl -X POST http://localhost:5000/api/seed/demo-data
```

5. **Open the dashboard**
```
http://localhost:5000
```

## API Endpoints

### Event Tracking

**POST /api/track**
```json
{
  "workspaceId": "workspace-123",
  "userId": "user-456",
  "event": "invoice_sent",
  "properties": {
    "amount": 1250,
    "currency": "GBP"
  },
  "sessionId": "session-789",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Analytics

**GET /api/analytics/overview**
```
Query params: ?workspaceId=xxx&startDate=2024-01-01&endDate=2024-01-31
Response: { totalEvents, uniqueUsers, activeUsersNow, topEvents }
```

**GET /api/analytics/events**
```
Query params: ?workspaceId=xxx&eventType=invoice_sent&startDate=xxx&endDate=xxx
Response: { events: [...], count: 123 }
```

**GET /api/analytics/daily**
```
Query params: ?workspaceId=xxx&startDate=xxx&endDate=xxx
Response: { data: [{ date: "2024-01-15", count: 456 }] }
```

**GET /api/analytics/retention**
```
Query params: ?workspaceId=xxx&cohortDate=2024-01-01
Response: { cohortSize, retention: [{ day: 7, retained: 45, retentionRate: "75.0" }] }
```

### Funnels

**POST /api/funnels**
```json
{
  "workspaceId": "workspace-123",
  "name": "Signup to Paid",
  "steps": ["signup", "trial_started", "invoice_paid"]
}
```

**GET /api/funnels/:id/analyze**
```
Query params: ?startDate=xxx&endDate=xxx
Response: { funnel, steps: [...], conversionRate: "12.5" }
```

### Alerts

**POST /api/alerts**
```json
{
  "workspaceId": "workspace-123",
  "name": "High Invoice Volume",
  "type": "anomaly",
  "condition": { event: "invoice_sent", threshold: 1000 },
  "notificationChannels": { slack: "webhook-url", email: "alerts@example.com" }
}
```

## SDK Usage (for other SFS apps)

```typescript
import { trackEvent } from '@sfs/analytics-sdk';

// Track an event
await trackEvent('invoice_sent', {
  amount: 1250,
  currency: 'GBP',
  customer_id: 'cust_123'
});

// Track with user context
await trackEvent('qr_scanned', {
  qr_code_id: 'qr_789',
  location: 'London'
}, {
  userId: 'user_456',
  sessionId: 'session_abc'
});
```

## Database Schema

### Core Tables
- **workspaces**: Multi-tenant workspace configuration
- **events**: Event tracking data (partitioned by month)
- **users**: Admin users and workspace owners
- **funnels**: Funnel definitions for conversion tracking
- **alerts**: Alert configurations
- **daily_stats**: Pre-aggregated daily statistics

### Indexes
- Workspace ID + Timestamp (for fast date range queries)
- Event name (for filtering by event type)
- User ID (for cohort analysis)

## Performance

### Targets
- **Event ingestion**: <100ms p95 latency
- **Dashboard queries**: <200ms response time
- **Concurrent users**: 1,000+ simultaneous connections
- **Event throughput**: 1,000 events/second

### Optimization Techniques
- Redis event queue for batching (10-second windows)
- PostgreSQL table partitioning by month
- Materialized views for daily/weekly aggregates
- Database connection pooling
- React Query caching (30s refresh)

## Deployment

### Production Checklist
- [ ] Set DATABASE_URL to production PostgreSQL
- [ ] Configure Redis for event queuing
- [ ] Set up database backups (90-day retention)
- [ ] Enable SSL for database connections
- [ ] Configure CORS for allowed domains
- [ ] Set up monitoring (e.g., Sentry, LogRocket)
- [ ] Configure rate limiting
- [ ] Set up CI/CD pipeline
- [ ] Enable database replication (read replicas)

### Environment Variables
See `.env.example` for all configuration options.

### Scaling
- **Horizontal scaling**: Load balance across multiple Express instances
- **Database**: Use read replicas for analytics queries
- **Caching**: Redis for hot data (active sessions, real-time counters)
- **CDN**: Serve static assets via CDN

## Architecture Decisions

### Why PostgreSQL over ClickHouse?
- Simpler operational overhead
- Strong ACID guarantees
- Excellent JSON support for event properties
- Can scale to 10M events/day with proper partitioning
- Migrate to ClickHouse when hitting 100M+ events/day

### Why Direct Insert over Redis Queue?
- For <1,000 events/sec, database can handle direct writes
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

## Roadmap

- [ ] GraphQL API for complex queries
- [ ] Webhook output to customer data warehouses
- [ ] Custom dashboard builder (drag & drop)
- [ ] A/B testing framework
- [ ] User segmentation
- [ ] Predictive churn models
- [ ] Data export (CSV, JSON)
- [ ] Mobile SDK (React Native)
- [ ] Live visualization of event streams

## License

MIT License - Built for SmartFlow Systems

## Support

For questions or issues:
- GitHub Issues: [repository-url]/issues
- Email: support@smartflowsystems.com
- Docs: https://docs.sfs.dev/analytics
