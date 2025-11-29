# Event Tracking & Analytics Platform

## Overview
A comprehensive event tracking and analytics platform built with Express, PostgreSQL, and React. The platform enables real-time event ingestion, analytics dashboards, and custom reporting.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Recharts
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (via Drizzle ORM)
- **Caching**: In-memory cache with 30-second TTL for analytics queries

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── AppSidebar.tsx     # Navigation sidebar
│   │   │   ├── DateRangePicker.tsx # Date range selector
│   │   │   ├── EventChart.tsx     # Event volume chart
│   │   │   ├── RecentEventsTable.tsx # Recent events table
│   │   │   ├── StatCard.tsx       # Metric stat card
│   │   │   ├── ThemeToggle.tsx    # Dark/light mode toggle
│   │   │   └── TopEventsList.tsx  # Top events list
│   │   ├── lib/
│   │   │   ├── dateContext.tsx    # Date range context provider
│   │   │   └── queryClient.ts     # TanStack Query config
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx      # Main analytics dashboard
│   │   │   ├── Events.tsx         # Event explorer
│   │   │   ├── Reports.tsx        # Report management
│   │   │   └── Settings.tsx       # App settings
│   │   └── App.tsx                # Root component with routing
├── server/
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data access layer
│   └── index.ts           # Server entry point
├── shared/
│   └── schema.ts          # Database schema & Zod types
```

## Database Schema

### Events Table
- `id` (varchar, UUID) - Primary key
- `event_name` (text) - Event type name
- `user_id` (text) - User identifier
- `timestamp` (timestamp) - When event occurred
- `properties` (jsonb) - Custom event properties

### Reports Table
- `id` (varchar, UUID) - Primary key
- `name` (text) - Report name
- `description` (text) - Report description
- `type` (text) - "on-demand" or "scheduled"
- `config` (jsonb) - Report configuration
- `created_at` (timestamp) - Creation time
- `updated_at` (timestamp) - Last update time

## API Endpoints

### Event Ingestion
- `POST /api/events` - Create single event
- `POST /api/events/batch` - Batch create events (up to 1000)

### Event Queries
- `GET /api/events` - List events with filtering
- `GET /api/events/:id` - Get event by ID

### Analytics
- `GET /api/analytics/stats?range=7d` - Get overview stats
- `GET /api/analytics/top-events?range=7d` - Get top events with change %
- `GET /api/analytics/volume?range=7d` - Get event volume over time
- `GET /api/analytics/event-types` - Get all event types summary

### Reports
- `GET /api/reports` - List all reports
- `POST /api/reports` - Create report
- `GET /api/reports/:id` - Get report
- `PATCH /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

### Utilities
- `POST /api/seed` - Seed sample data for testing

## Key Features

1. **Real-time Dashboard**
   - Total events and unique users metrics
   - Event volume time series chart
   - Top events with trend indicators
   - Recent activity table

2. **Event Explorer**
   - Search and filter events
   - View event details modal
   - Event type breakdown

3. **Report Management**
   - Create custom reports
   - Export reports as JSON
   - Delete reports

4. **Date Range Filtering**
   - Today, 7 days, 30 days, 90 days presets
   - Context-based filtering across dashboard

## Development

### Running the Application
```bash
npm run dev
```

### Database Migrations
```bash
npm run db:push
```

## Event Tracking Integration

To send events from your application:

```javascript
// Single event
fetch('/api/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventName: 'page_view',
    userId: 'user_123',
    properties: { page: '/home', source: 'direct' }
  })
});

// Batch events
fetch('/api/events/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    events: [
      { eventName: 'button_click', userId: 'user_123', properties: {} },
      { eventName: 'form_submit', userId: 'user_456', properties: {} }
    ]
  })
});
```
