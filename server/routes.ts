import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
<<<<<<< HEAD
import { 
  insertEventSchema, 
  batchInsertEventSchema, 
  analyticsQuerySchema,
  insertReportSchema 
} from "@shared/schema";
import { z } from "zod";

const metricsCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30000; 

function getCached<T>(key: string): T | null {
  const cached = metricsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  return null;
}

function setCache(key: string, data: unknown): void {
  metricsCache.set(key, { data, timestamp: Date.now() });
}

function getDateRange(range: string): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (range) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(startDate.getDate() - 90);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }
  
  return { startDate, endDate };
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/events", async (req, res) => {
    try {
      const event = insertEventSchema.parse(req.body);
      const newEvent = await storage.createEvent(event);
      metricsCache.clear();
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid event data", details: error.errors });
      } else {
        console.error("Error creating event:", error);
        res.status(500).json({ error: "Failed to create event" });
      }
    }
  });

  app.post("/api/events/batch", async (req, res) => {
    try {
      const { events: eventsList } = batchInsertEventSchema.parse(req.body);
      const newEvents = await storage.createEvents(eventsList);
      metricsCache.clear();
      res.status(201).json({ inserted: newEvents.length, events: newEvents });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid batch data", details: error.errors });
      } else {
        console.error("Error creating batch events:", error);
        res.status(500).json({ error: "Failed to create events" });
      }
    }
  });

  app.get("/api/events", async (req, res) => {
    try {
      const query = analyticsQuerySchema.parse({
        eventName: req.query.eventName,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: req.query.limit ? Number(req.query.limit) : 100,
        offset: req.query.offset ? Number(req.query.offset) : 0,
      });
      const eventsList = await storage.getEvents(query);
      res.json(eventsList);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid query parameters", details: error.errors });
      } else {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Failed to fetch events" });
      }
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEventById(req.params.id);
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const range = (req.query.range as string) || "7d";
      const cacheKey = `stats_${range}`;
      
      const cached = getCached<{ totalEvents: number; uniqueUsers: number }>(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const { startDate, endDate } = getDateRange(range);
      const stats = await storage.getEventStats(startDate, endDate);
      
      const prevEndDate = new Date(startDate);
      const prevStartDate = new Date(startDate);
      prevStartDate.setTime(prevStartDate.getTime() - (endDate.getTime() - startDate.getTime()));
      
      const prevStats = await storage.getEventStats(prevStartDate, prevEndDate);
      
      const eventChange = prevStats.totalEvents > 0 
        ? ((stats.totalEvents - prevStats.totalEvents) / prevStats.totalEvents) * 100 
        : 0;
      const userChange = prevStats.uniqueUsers > 0 
        ? ((stats.uniqueUsers - prevStats.uniqueUsers) / prevStats.uniqueUsers) * 100 
        : 0;

      const result = {
        totalEvents: stats.totalEvents,
        uniqueUsers: stats.uniqueUsers,
        eventChange: Math.round(eventChange * 10) / 10,
        userChange: Math.round(userChange * 10) / 10,
      };
      
      setCache(cacheKey, result);
      res.json(result);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/analytics/top-events", async (req, res) => {
    try {
      const range = (req.query.range as string) || "7d";
      const limit = Number(req.query.limit) || 10;
      const cacheKey = `top_events_${range}_${limit}`;
      
      const cached = getCached<{ eventName: string; count: number }[]>(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const { startDate, endDate } = getDateRange(range);
      const topEvents = await storage.getTopEvents(limit, startDate, endDate);
      
      const prevEndDate = new Date(startDate);
      const prevStartDate = new Date(startDate);
      prevStartDate.setTime(prevStartDate.getTime() - (endDate.getTime() - startDate.getTime()));
      const prevTopEvents = await storage.getTopEvents(limit, prevStartDate, prevEndDate);
      
      const prevCountMap = new Map(prevTopEvents.map(e => [e.eventName, e.count]));
      
      const result = topEvents.map(event => {
        const prevCount = prevCountMap.get(event.eventName) || 0;
        const change = prevCount > 0 
          ? ((event.count - prevCount) / prevCount) * 100 
          : (event.count > 0 ? 100 : 0);
        return {
          ...event,
          change: Math.round(change),
        };
      });
      
      setCache(cacheKey, result);
      res.json(result);
    } catch (error) {
      console.error("Error fetching top events:", error);
      res.status(500).json({ error: "Failed to fetch top events" });
    }
  });

  app.get("/api/analytics/volume", async (req, res) => {
    try {
      const range = (req.query.range as string) || "7d";
      const cacheKey = `volume_${range}`;
      
      const cached = getCached<{ date: string; events: number }[]>(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const { startDate, endDate } = getDateRange(range);
      const volume = await storage.getEventVolume(startDate, endDate);
      
      setCache(cacheKey, volume);
      res.json(volume);
    } catch (error) {
      console.error("Error fetching event volume:", error);
      res.status(500).json({ error: "Failed to fetch event volume" });
    }
  });

  app.get("/api/analytics/event-types", async (req, res) => {
    try {
      const cacheKey = "event_types";
      
      const cached = getCached<{ name: string; count: number; users: number; avgProps: number }[]>(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const eventTypes = await storage.getEventTypes();
      
      setCache(cacheKey, eventTypes);
      res.json(eventTypes);
    } catch (error) {
      console.error("Error fetching event types:", error);
      res.status(500).json({ error: "Failed to fetch event types" });
    }
  });

  app.get("/api/reports", async (req, res) => {
    try {
      const reportsList = await storage.getReports();
      res.json(reportsList);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.get("/api/reports/:id", async (req, res) => {
    try {
      const report = await storage.getReportById(req.params.id);
      if (!report) {
        res.status(404).json({ error: "Report not found" });
        return;
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ error: "Failed to fetch report" });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const report = insertReportSchema.parse(req.body);
      const newReport = await storage.createReport(report);
      res.status(201).json(newReport);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid report data", details: error.errors });
      } else {
        console.error("Error creating report:", error);
        res.status(500).json({ error: "Failed to create report" });
      }
    }
  });

  app.patch("/api/reports/:id", async (req, res) => {
    try {
      const report = insertReportSchema.partial().parse(req.body);
      const updated = await storage.updateReport(req.params.id, report);
      if (!updated) {
        res.status(404).json({ error: "Report not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid report data", details: error.errors });
      } else {
        console.error("Error updating report:", error);
        res.status(500).json({ error: "Failed to update report" });
      }
    }
  });

  app.delete("/api/reports/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteReport(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Report not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting report:", error);
      res.status(500).json({ error: "Failed to delete report" });
    }
  });

  app.post("/api/seed", async (req, res) => {
    try {
      const eventNames = ["page_view", "button_click", "form_submit", "video_play", "search", "add_to_cart", "checkout"];
      const userIds = Array.from({ length: 50 }, (_, i) => `user_${1000 + i}`);
      const eventsToCreate = [];
      
      const now = new Date();
      for (let i = 0; i < 500; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);
        const timestamp = new Date(now);
        timestamp.setDate(timestamp.getDate() - daysAgo);
        timestamp.setHours(timestamp.getHours() - hoursAgo);
        
        eventsToCreate.push({
          eventName: eventNames[Math.floor(Math.random() * eventNames.length)],
          userId: userIds[Math.floor(Math.random() * userIds.length)],
          properties: {
            page: `/page-${Math.floor(Math.random() * 10)}`,
            source: ["direct", "organic", "referral", "paid"][Math.floor(Math.random() * 4)],
          },
        });
      }
      
      const created = await storage.createEvents(eventsToCreate);
      metricsCache.clear();
      res.json({ message: `Seeded ${created.length} events` });
    } catch (error) {
      console.error("Error seeding data:", error);
      res.status(500).json({ error: "Failed to seed data" });
=======
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
>>>>>>> fab568c6475a339b59d9300af6414b664c295e9e
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
