# SFS Analytics Engine

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

## Development

```bash
npm run dev        # Start dev server (port 5000)
npm run build      # Build for production
npm test           # Run tests
npm run sync       # Sync with Git (auto-commit)
```

## Environment Variables

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

## Contributing

Part of the SmartFlow Systems ecosystem. Follow organization coding standards.

## License

Proprietary - SmartFlow Systems

---

**Built with ❤️ by SmartFlow Systems**

For questions or support, visit [SmartFlow Systems](https://smartflow-systems.replit.app)
