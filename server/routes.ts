import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
