import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertWorkspaceSchema, insertFunnelSchema, insertAlertSchema } from "@shared/schema";
import { z } from "zod";
import AnalyticsWebSocketServer from "./websocket";

// For demo purposes, we'll use a hardcoded workspace ID
// In production, this would come from authentication/session
const DEMO_WORKSPACE_ID = "demo-workspace-001";

let wsServer: AnalyticsWebSocketServer;

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize WebSocket server
  wsServer = new AnalyticsWebSocketServer(httpServer);

  // ==================== EVENT TRACKING ====================

  /**
   * POST /api/track
   * High-throughput event ingestion endpoint
   * Body: { workspaceId, userId, event, properties, timestamp, sessionId }
   */
  app.post("/api/track", async (req: Request, res: Response) => {
    try {
      const eventData = insertEventSchema.parse({
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      // In production, this would queue to Redis and batch insert
      // For now, we'll insert directly to the database
      const event = await storage.createEvent(eventData);

      // Broadcast event to WebSocket clients
      if (wsServer) {
        wsServer.broadcastEvent(eventData.workspaceId, event);
      }

      res.json({ success: true, eventId: event.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid event data", details: error.errors });
      } else {
        console.error("Event tracking error:", error);
        res.status(500).json({ error: "Failed to track event" });
      }
    }
  });

  // ==================== ANALYTICS ENDPOINTS ====================

  /**
   * GET /api/analytics/overview
   * Get high-level analytics overview
   * Query: workspaceId, startDate, endDate
   */
  app.get("/api/analytics/overview", async (req: Request, res: Response) => {
    try {
      const workspaceId = (req.query.workspaceId as string) || DEMO_WORKSPACE_ID;
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : new Date();

      const [totalEvents, uniqueUsers, activeNow, topEvents] = await Promise.all([
        storage.getEventCount(workspaceId, startDate, endDate),
        storage.getUniqueUserCount(workspaceId, startDate, endDate),
        storage.getActiveUsersNow(workspaceId),
        storage.getTopEvents(workspaceId, startDate, endDate, 10),
      ]);

      res.json({
        totalEvents,
        uniqueUsers,
        activeUsersNow: activeNow,
        topEvents,
        dateRange: { startDate, endDate },
      });
    } catch (error) {
      console.error("Analytics overview error:", error);
      res.status(500).json({ error: "Failed to fetch analytics overview" });
    }
  });

  /**
   * GET /api/analytics/events
   * Get event list with filtering
   * Query: workspaceId, startDate, endDate, eventType
   */
  app.get("/api/analytics/events", async (req: Request, res: Response) => {
    try {
      const workspaceId = (req.query.workspaceId as string) || DEMO_WORKSPACE_ID;
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : new Date();
      const eventType = req.query.eventType as string | undefined;

      const events = eventType
        ? await storage.getEventsByType(workspaceId, eventType, startDate, endDate)
        : await storage.getEventsByWorkspace(workspaceId, startDate, endDate);

      res.json({ events, count: events.length });
    } catch (error) {
      console.error("Events fetch error:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  /**
   * GET /api/analytics/daily
   * Get daily event counts for charts
   * Query: workspaceId, startDate, endDate
   */
  app.get("/api/analytics/daily", async (req: Request, res: Response) => {
    try {
      const workspaceId = (req.query.workspaceId as string) || DEMO_WORKSPACE_ID;
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : new Date();

      const dailyCounts = await storage.getDailyEventCounts(workspaceId, startDate, endDate);

      res.json({ data: dailyCounts });
    } catch (error) {
      console.error("Daily analytics error:", error);
      res.status(500).json({ error: "Failed to fetch daily analytics" });
    }
  });

  /**
   * GET /api/analytics/retention
   * Get cohort retention analysis
   * Query: workspaceId, cohortDate
   */
  app.get("/api/analytics/retention", async (req: Request, res: Response) => {
    try {
      const workspaceId = (req.query.workspaceId as string) || DEMO_WORKSPACE_ID;
      const cohortDate = req.query.cohortDate
        ? new Date(req.query.cohortDate as string)
        : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

      const retention = await storage.getCohortRetention(workspaceId, cohortDate);

      res.json(retention);
    } catch (error) {
      console.error("Retention analysis error:", error);
      res.status(500).json({ error: "Failed to fetch retention data" });
    }
  });

  // ==================== FUNNEL ENDPOINTS ====================

  /**
   * GET /api/funnels
   * Get all funnels for a workspace
   */
  app.get("/api/funnels", async (req: Request, res: Response) => {
    try {
      const workspaceId = (req.query.workspaceId as string) || DEMO_WORKSPACE_ID;
      const funnels = await storage.getFunnelsByWorkspace(workspaceId);

      res.json({ funnels });
    } catch (error) {
      console.error("Funnels fetch error:", error);
      res.status(500).json({ error: "Failed to fetch funnels" });
    }
  });

  /**
   * POST /api/funnels
   * Create a new funnel
   */
  app.post("/api/funnels", async (req: Request, res: Response) => {
    try {
      const funnelData = insertFunnelSchema.parse({
        ...req.body,
        workspaceId: req.body.workspaceId || DEMO_WORKSPACE_ID,
      });

      const funnel = await storage.createFunnel(funnelData);

      res.json({ success: true, funnel });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid funnel data", details: error.errors });
      } else {
        console.error("Funnel creation error:", error);
        res.status(500).json({ error: "Failed to create funnel" });
      }
    }
  });

  /**
   * GET /api/funnels/:id/analyze
   * Analyze funnel conversion
   */
  app.get("/api/funnels/:id/analyze", async (req: Request, res: Response) => {
    try {
      const funnelId = req.params.id;
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : new Date();

      const analysis = await storage.analyzeFunnel(funnelId, startDate, endDate);

      if (!analysis) {
        res.status(404).json({ error: "Funnel not found" });
        return;
      }

      res.json(analysis);
    } catch (error) {
      console.error("Funnel analysis error:", error);
      res.status(500).json({ error: "Failed to analyze funnel" });
    }
  });

  // ==================== ALERT ENDPOINTS ====================

  /**
   * GET /api/alerts
   * Get all alerts for a workspace
   */
  app.get("/api/alerts", async (req: Request, res: Response) => {
    try {
      const workspaceId = (req.query.workspaceId as string) || DEMO_WORKSPACE_ID;
      const alerts = await storage.getAlertsByWorkspace(workspaceId);

      res.json({ alerts });
    } catch (error) {
      console.error("Alerts fetch error:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  /**
   * POST /api/alerts
   * Create a new alert
   */
  app.post("/api/alerts", async (req: Request, res: Response) => {
    try {
      const alertData = insertAlertSchema.parse({
        ...req.body,
        workspaceId: req.body.workspaceId || DEMO_WORKSPACE_ID,
      });

      const alert = await storage.createAlert(alertData);

      res.json({ success: true, alert });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid alert data", details: error.errors });
      } else {
        console.error("Alert creation error:", error);
        res.status(500).json({ error: "Failed to create alert" });
      }
    }
  });

  /**
   * PATCH /api/alerts/:id
   * Update alert status
   */
  app.patch("/api/alerts/:id", async (req: Request, res: Response) => {
    try {
      const alertId = req.params.id;
      const { enabled } = req.body;

      if (typeof enabled !== "boolean") {
        res.status(400).json({ error: "enabled must be a boolean" });
        return;
      }

      await storage.updateAlertStatus(alertId, enabled);

      res.json({ success: true });
    } catch (error) {
      console.error("Alert update error:", error);
      res.status(500).json({ error: "Failed to update alert" });
    }
  });

  // ==================== WORKSPACE ENDPOINTS ====================

  /**
   * POST /api/workspaces
   * Create a new workspace
   */
  app.post("/api/workspaces", async (req: Request, res: Response) => {
    try {
      const workspaceData = insertWorkspaceSchema.parse(req.body);
      const workspace = await storage.createWorkspace(workspaceData);

      res.json({ success: true, workspace });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid workspace data", details: error.errors });
      } else {
        console.error("Workspace creation error:", error);
        res.status(500).json({ error: "Failed to create workspace" });
      }
    }
  });

  /**
   * GET /api/workspaces/:id
   * Get workspace details
   */
  app.get("/api/workspaces/:id", async (req: Request, res: Response) => {
    try {
      const workspace = await storage.getWorkspace(req.params.id);

      if (!workspace) {
        res.status(404).json({ error: "Workspace not found" });
        return;
      }

      res.json({ workspace });
    } catch (error) {
      console.error("Workspace fetch error:", error);
      res.status(500).json({ error: "Failed to fetch workspace" });
    }
  });

  // ==================== DEMO DATA SEEDING ====================

  /**
   * POST /api/seed/demo-data
   * Seed demo analytics data for testing
   */
  app.post("/api/seed/demo-data", async (req: Request, res: Response) => {
    try {
      const workspaceId = DEMO_WORKSPACE_ID;
      const events: string[] = [
        "invoice_sent",
        "invoice_viewed",
        "invoice_paid",
        "qr_scanned",
        "link_clicked",
        "email_sent",
        "signup",
        "login",
      ];

      // Generate 1000 demo events over the past 30 days
      const promises = [];
      for (let i = 0; i < 1000; i++) {
        const randomDaysAgo = Math.floor(Math.random() * 30);
        const timestamp = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000);
        const event = events[Math.floor(Math.random() * events.length)];
        const userId = `user-${Math.floor(Math.random() * 100)}`;

        promises.push(
          storage.createEvent({
            workspaceId,
            userId,
            event,
            properties: { amount: Math.floor(Math.random() * 5000), currency: "GBP" },
            timestamp,
            sessionId: `session-${i}`,
          })
        );
      }

      await Promise.all(promises);

      res.json({ success: true, message: "Demo data seeded successfully", count: 1000 });
    } catch (error) {
      console.error("Demo data seeding error:", error);
      res.status(500).json({ error: "Failed to seed demo data" });
    }
  });

  return httpServer;
}
