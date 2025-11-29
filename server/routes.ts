import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAnalyticsEventSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ============================================================================
  // HEALTH CHECK ENDPOINT - SFS Standard
  // ============================================================================
  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      ok: true,
      service: "sfs-analytics-engine",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      ok: true,
      service: "sfs-analytics-engine",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  });

  // ============================================================================
  // ANALYTICS EVENTS API
  // ============================================================================

  // Track a new event
  app.post("/api/events", async (req: Request, res: Response) => {
    try {
      const validatedData = insertAnalyticsEventSchema.parse(req.body);

      // Extract IP and User Agent from request
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      const event = await storage.createEvent({
        ...validatedData,
        ipAddress,
        userAgent,
      });

      res.status(201).json({
        success: true,
        message: "Event tracked successfully",
        event,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: "Invalid event data",
        error: error.message,
      });
    }
  });

  // Get events with filtering
  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      const {
        limit,
        offset,
        eventType,
        source,
        userId,
        sessionId,
        startDate,
        endDate,
      } = req.query;

      const events = await storage.getEvents({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        eventType: eventType as string,
        source: source as string,
        userId: userId as string,
        sessionId: sessionId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      const totalCount = await storage.getEventCount();

      res.json({
        success: true,
        count: events.length,
        totalCount,
        events,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch events",
        error: error.message,
      });
    }
  });

  // Get events by type
  app.get("/api/events/type/:eventType", async (req: Request, res: Response) => {
    try {
      const { eventType } = req.params;
      const events = await storage.getEventsByType(eventType);

      res.json({
        success: true,
        eventType,
        count: events.length,
        events,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch events by type",
        error: error.message,
      });
    }
  });

  // Get events by source
  app.get("/api/events/source/:source", async (req: Request, res: Response) => {
    try {
      const { source } = req.params;
      const events = await storage.getEventsBySource(source);

      res.json({
        success: true,
        source,
        count: events.length,
        events,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch events by source",
        error: error.message,
      });
    }
  });

  // ============================================================================
  // ANALYTICS AGGREGATIONS & INSIGHTS
  // ============================================================================

  // Get analytics summary/overview
  app.get("/api/analytics/summary", async (req: Request, res: Response) => {
    try {
      const totalEvents = await storage.getEventCount();
      const topEvents = await storage.getTopEvents(10);

      // Get recent events (last 100)
      const recentEvents = await storage.getEvents({ limit: 100 });

      // Calculate unique users and sessions
      const uniqueUsers = new Set(recentEvents.filter(e => e.userId).map(e => e.userId)).size;
      const uniqueSessions = new Set(recentEvents.filter(e => e.sessionId).map(e => e.sessionId)).size;

      // Calculate events by type
      const eventsByType: Record<string, number> = {};
      recentEvents.forEach(event => {
        eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      });

      // Calculate events by source
      const eventsBySource: Record<string, number> = {};
      recentEvents.forEach(event => {
        if (event.source) {
          eventsBySource[event.source] = (eventsBySource[event.source] || 0) + 1;
        }
      });

      res.json({
        success: true,
        summary: {
          totalEvents,
          uniqueUsers,
          uniqueSessions,
          topEvents,
          eventsByType,
          eventsBySource,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch analytics summary",
        error: error.message,
      });
    }
  });

  // Get top events
  app.get("/api/analytics/top-events", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const topEvents = await storage.getTopEvents(limit);

      res.json({
        success: true,
        topEvents,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch top events",
        error: error.message,
      });
    }
  });

  // Get event trends over time
  app.get("/api/analytics/trends", async (req: Request, res: Response) => {
    try {
      const period = (req.query.period as 'hour' | 'day' | 'week' | 'month') || 'day';
      const trends = await storage.getEventTrends(period);

      res.json({
        success: true,
        period,
        trends,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch event trends",
        error: error.message,
      });
    }
  });

  // Get events by date range
  app.get("/api/analytics/range", async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate and endDate are required",
        });
      }

      const events = await storage.getEventsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({
        success: true,
        startDate,
        endDate,
        count: events.length,
        events,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch events by date range",
        error: error.message,
      });
    }
  });

  // ============================================================================
  // SFS ECOSYSTEM INTEGRATION ENDPOINTS
  // ============================================================================

  // Webhook endpoint for other SFS services to send events
  app.post("/api/webhook/event", async (req: Request, res: Response) => {
    try {
      const { apiKey, events } = req.body;

      // Simple API key validation (in production, use proper JWT/OAuth)
      if (apiKey !== process.env.API_KEY && apiKey !== process.env.SFS_PAT) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Invalid API key",
        });
      }

      if (!events || !Array.isArray(events)) {
        return res.status(400).json({
          success: false,
          message: "Events array is required",
        });
      }

      const createdEvents = [];
      for (const eventData of events) {
        const validatedData = insertAnalyticsEventSchema.parse(eventData);
        const event = await storage.createEvent(validatedData);
        createdEvents.push(event);
      }

      res.json({
        success: true,
        message: `${createdEvents.length} events tracked successfully`,
        count: createdEvents.length,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: "Failed to process webhook events",
        error: error.message,
      });
    }
  });

  // Get analytics for specific SFS service
  app.get("/api/integrations/:service/analytics", async (req: Request, res: Response) => {
    try {
      const { service } = req.params;
      const events = await storage.getEventsBySource(service);

      const summary = {
        service,
        totalEvents: events.length,
        uniqueUsers: new Set(events.filter(e => e.userId).map(e => e.userId)).size,
        uniqueSessions: new Set(events.filter(e => e.sessionId).map(e => e.sessionId)).size,
        eventTypes: {} as Record<string, number>,
      };

      events.forEach(event => {
        summary.eventTypes[event.eventType] = (summary.eventTypes[event.eventType] || 0) + 1;
      });

      res.json({
        success: true,
        summary,
        recentEvents: events.slice(0, 50),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch service analytics",
        error: error.message,
      });
    }
  });

  // ============================================================================
  // UTILITY ENDPOINTS
  // ============================================================================

  // Get available event types
  app.get("/api/meta/event-types", async (req: Request, res: Response) => {
    try {
      const events = await storage.getEvents({ limit: 1000 });
      const eventTypes = [...new Set(events.map(e => e.eventType))];

      res.json({
        success: true,
        eventTypes,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch event types",
        error: error.message,
      });
    }
  });

  // Get available sources
  app.get("/api/meta/sources", async (req: Request, res: Response) => {
    try {
      const events = await storage.getEvents({ limit: 1000 });
      const sources = [...new Set(events.filter(e => e.source).map(e => e.source))];

      res.json({
        success: true,
        sources,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch sources",
        error: error.message,
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
