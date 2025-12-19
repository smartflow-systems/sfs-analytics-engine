# SFS Analytics Engine - API Documentation

## Overview

The SFS Analytics Engine provides comprehensive event tracking, analytics aggregation, and insights across the SmartFlow Systems ecosystem.

**Base URL:** `https://sfs-analytics-engine--Smart-F-Syst.replit.app`

**Version:** 1.0.0

---

## Table of Contents

1. [Health Check](#health-check)
2. [Events API](#events-api)
3. [Analytics & Insights](#analytics--insights)
4. [SFS Ecosystem Integration](#sfs-ecosystem-integration)
5. [Metadata & Utilities](#metadata--utilities)
6. [Data Models](#data-models)
7. [Examples](#examples)

---

## Health Check

### GET `/health`

Check if the service is running.

**Response:**
```json
{
  "ok": true,
  "service": "sfs-analytics-engine",
  "version": "1.0.0",
  "timestamp": "2025-11-29T12:00:00.000Z"
}
```

### GET `/api/health`

Alternative health check endpoint.

**Response:** Same as `/health`

---

## Events API

### POST `/api/events`

Track a new analytics event.

**Request Body:**
```json
{
  "eventName": "User Login",
  "eventType": "auth",
  "userId": "user_123",
  "sessionId": "session_abc",
  "source": "SmartFlowSite",
  "metadata": {
    "page": "/dashboard",
    "referrer": "google.com"
  }
}
```

**Fields:**
- `eventName` (required): Human-readable event name
- `eventType` (required): Category of event (page_view, click, form_submit, api_call, error, etc.)
- `userId` (optional): User identifier
- `sessionId` (optional): Session identifier
- `source` (optional): Which SFS application sent this event
- `metadata` (optional): Flexible JSON data for additional context

**Response:**
```json
{
  "success": true,
  "message": "Event tracked successfully",
  "event": {
    "id": "evt_123abc",
    "eventName": "User Login",
    "eventType": "auth",
    "userId": "user_123",
    "sessionId": "session_abc",
    "source": "SmartFlowSite",
    "metadata": { ... },
    "timestamp": "2025-11-29T12:00:00.000Z",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### GET `/api/events`

Retrieve events with optional filtering and pagination.

**Query Parameters:**
- `limit` (optional): Number of results to return (default: 100)
- `offset` (optional): Number of results to skip (default: 0)
- `eventType` (optional): Filter by event type
- `source` (optional): Filter by source application
- `userId` (optional): Filter by user ID
- `sessionId` (optional): Filter by session ID
- `startDate` (optional): Filter events after this date (ISO 8601)
- `endDate` (optional): Filter events before this date (ISO 8601)

**Example:**
```
GET /api/events?limit=50&eventType=page_view&source=SmartFlowSite
```

**Response:**
```json
{
  "success": true,
  "count": 50,
  "totalCount": 500,
  "events": [ ... ]
}
```

### GET `/api/events/type/:eventType`

Get all events of a specific type.

**Example:**
```
GET /api/events/type/page_view
```

**Response:**
```json
{
  "success": true,
  "eventType": "page_view",
  "count": 150,
  "events": [ ... ]
}
```

### GET `/api/events/source/:source`

Get all events from a specific source application.

**Example:**
```
GET /api/events/source/SocialScaleBooster
```

**Response:**
```json
{
  "success": true,
  "source": "SocialScaleBooster",
  "count": 75,
  "events": [ ... ]
}
```

---

## Analytics & Insights

### GET `/api/analytics/summary`

Get comprehensive analytics overview.

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalEvents": 500,
    "uniqueUsers": 42,
    "uniqueSessions": 89,
    "topEvents": [
      { "eventName": "Dashboard View", "count": 125 },
      { "eventName": "User Login", "count": 89 }
    ],
    "eventsByType": {
      "page_view": 200,
      "click": 150,
      "form_submit": 75,
      "api_call": 50,
      "error": 25
    },
    "eventsBySource": {
      "SmartFlowSite": 200,
      "SocialScaleBooster": 150,
      "SFSDataQueryEngine": 100,
      "sfs-marketing-and-growth": 50
    }
  }
}
```

### GET `/api/analytics/top-events`

Get the most frequently occurring events.

**Query Parameters:**
- `limit` (optional): Number of top events to return (default: 10)

**Example:**
```
GET /api/analytics/top-events?limit=5
```

**Response:**
```json
{
  "success": true,
  "topEvents": [
    { "eventName": "Dashboard View", "count": 125 },
    { "eventName": "User Login", "count": 89 },
    { "eventName": "Report Generated", "count": 67 },
    { "eventName": "Export Data", "count": 45 },
    { "eventName": "Settings Updated", "count": 34 }
  ]
}
```

### GET `/api/analytics/trends`

Get event trends over time.

**Query Parameters:**
- `period` (optional): Time period for grouping (hour, day, week, month) (default: day)

**Example:**
```
GET /api/analytics/trends?period=day
```

**Response:**
```json
{
  "success": true,
  "period": "day",
  "trends": [
    { "period": "2025-11-01", "count": 45 },
    { "period": "2025-11-02", "count": 52 },
    { "period": "2025-11-03", "count": 38 }
  ]
}
```

### GET `/api/analytics/range`

Get events within a specific date range.

**Query Parameters:**
- `startDate` (required): Start date (ISO 8601)
- `endDate` (required): End date (ISO 8601)

**Example:**
```
GET /api/analytics/range?startDate=2025-11-01&endDate=2025-11-30
```

**Response:**
```json
{
  "success": true,
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "count": 450,
  "events": [ ... ]
}
```

---

## SFS Ecosystem Integration

### POST `/api/webhook/event`

Webhook endpoint for bulk event tracking from other SFS services.

**Authentication:** Requires API key or SFS PAT token

**Request Body:**
```json
{
  "apiKey": "your-api-key-or-sfs-pat",
  "events": [
    {
      "eventName": "Post Created",
      "eventType": "social_action",
      "source": "SocialScaleBooster",
      "userId": "user_123",
      "metadata": { "platform": "twitter" }
    },
    {
      "eventName": "Campaign Launched",
      "eventType": "marketing",
      "source": "sfs-marketing-and-growth",
      "metadata": { "campaign": "summer-2025" }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 events tracked successfully",
  "count": 2
}
```

### GET `/api/integrations/:service/analytics`

Get analytics summary for a specific SFS service.

**Example:**
```
GET /api/integrations/SocialScaleBooster/analytics
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "service": "SocialScaleBooster",
    "totalEvents": 150,
    "uniqueUsers": 23,
    "uniqueSessions": 45,
    "eventTypes": {
      "social_action": 80,
      "page_view": 40,
      "api_call": 30
    }
  },
  "recentEvents": [ ... ]
}
```

---

## Metadata & Utilities

### GET `/api/meta/event-types`

Get all available event types in the system.

**Response:**
```json
{
  "success": true,
  "eventTypes": [
    "page_view",
    "click",
    "form_submit",
    "api_call",
    "error",
    "auth",
    "social_action",
    "marketing"
  ]
}
```

### GET `/api/meta/sources`

Get all source applications that have sent events.

**Response:**
```json
{
  "success": true,
  "sources": [
    "SmartFlowSite",
    "SocialScaleBooster",
    "SFSDataQueryEngine",
    "sfs-marketing-and-growth"
  ]
}
```

---

## Data Models

### AnalyticsEvent

```typescript
{
  id: string;                    // Unique event identifier
  eventName: string;             // Human-readable event name
  eventType: string;             // Event category
  userId?: string | null;        // Optional user identifier
  sessionId?: string | null;     // Optional session identifier
  metadata?: object | null;      // Flexible JSON metadata
  source?: string | null;        // Source application
  timestamp: Date;               // Event timestamp
  ipAddress?: string | null;     // IP address of requester
  userAgent?: string | null;     // User agent string
}
```

### Common Event Types

- `page_view` - Page or screen view
- `click` - Button or link click
- `form_submit` - Form submission
- `api_call` - API request made
- `error` - Error occurred
- `auth` - Authentication action (login, logout, signup)
- `social_action` - Social media interaction
- `marketing` - Marketing campaign action
- `data_export` - Data export action
- `report_generation` - Report generated

---

## Examples

### Track a Page View

```bash
curl -X POST https://sfs-analytics-engine--Smart-F-Syst.replit.app/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "Dashboard Viewed",
    "eventType": "page_view",
    "source": "SmartFlowSite",
    "userId": "user_123",
    "sessionId": "session_abc",
    "metadata": {
      "page": "/dashboard",
      "referrer": "google.com"
    }
  }'
```

### Get Analytics Summary

```bash
curl https://sfs-analytics-engine--Smart-F-Syst.replit.app/api/analytics/summary
```

### Filter Events by Date Range

```bash
curl "https://sfs-analytics-engine--Smart-F-Syst.replit.app/api/analytics/range?startDate=2025-11-01&endDate=2025-11-30"
```

### Bulk Event Tracking (Webhook)

```javascript
// Example from SocialScaleBooster
const response = await fetch('https://sfs-analytics-engine--Smart-F-Syst.replit.app/api/webhook/event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: process.env.SFS_PAT,
    events: [
      {
        eventName: 'Tweet Posted',
        eventType: 'social_action',
        source: 'SocialScaleBooster',
        userId: 'user_456',
        metadata: {
          platform: 'twitter',
          engagement: 42
        }
      }
    ]
  })
});
```

---

## Error Handling

All endpoints return standard error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (invalid API key)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. Future versions will include rate limiting based on API key.

---

## Authentication

For webhook endpoints, include your API key or SFS PAT token:

```bash
{
  "apiKey": "your-sfs-pat-token"
}
```

Set in environment variables:
- `API_KEY` - Custom API key
- `SFS_PAT` - SmartFlow Systems Personal Access Token

---

## Support

For issues or questions:
- GitHub: https://github.com/smartflow-systems/sfs-analytics-engine
- Documentation: /docs/

---

**Last Updated:** 2025-11-29
**Version:** 1.0.0
