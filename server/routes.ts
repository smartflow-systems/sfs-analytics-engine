import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertEventSchema,
  batchInsertEventSchema,
  analyticsQuerySchema,
  insertReportSchema,
  insertWorkspaceSchema,
  insertFunnelSchema,
  insertAlertSchema,
  insertDashboardSchema,
  loginSchema,
  insertUserSchema,
  insertApiKeySchema,
} from "@shared/schema";
import { z } from "zod";
import {
  type AuthRequest,
  authenticateToken,
  authenticateApiKey,
  checkWorkspaceAccess,
  checkUsageQuota,
  requireAdmin,
  hashPassword,
  comparePassword,
  generateToken,
  generateApiKey,
} from "./auth";
import {
  stripe,
  createCheckoutSession,
  handleCheckoutComplete,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  createBillingPortalSession,
  getSubscriptionDetails,
  cancelSubscription,
  reactivateSubscription,
  type PlanType,
  PRICING_TIERS,
} from "./stripe";
import type Stripe from "stripe";

// Cache for analytics metrics
const metricsCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

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
  // ===== HEALTH & STATUS =====
  app.get("/health", (_, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/health", (_, res) => {
    res.json({ status: "healthy", service: "sfs-analytics-engine" });
  });

  // ===== AUTHENTICATION ROUTES =====

  // Register new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
      });

      // Create default workspace
      const workspace = await storage.createWorkspace({
        name: `${username}'s Workspace`,
        slug: `${username}-workspace-${Date.now()}`,
        ownerId: user.id,
      });

      // Add user as workspace member
      await storage.addWorkspaceMember({
        workspaceId: workspace.id,
        userId: user.id,
        role: "owner",
      });

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });

      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        workspace: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          plan: workspace.plan,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);

      // Get user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Get user's workspaces
      const workspaces = await storage.getWorkspacesByOwner(user.id);

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        workspaces: workspaces.map(w => ({
          id: w.id,
          name: w.name,
          slug: w.slug,
          plan: w.plan,
          eventCount: w.eventCount,
          eventQuota: w.eventQuota,
        })),
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const workspaces = await storage.getWorkspacesByOwner(user.id);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        workspaces: workspaces.map(w => ({
          id: w.id,
          name: w.name,
          slug: w.slug,
          plan: w.plan,
          eventCount: w.eventCount,
          eventQuota: w.eventQuota,
        })),
      });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // ===== WORKSPACE ROUTES =====

  // Get workspace details
  app.get("/api/workspaces/:workspaceId", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const workspace = await storage.getWorkspace(req.params.workspaceId);
      const members = await storage.getWorkspaceMembers(req.params.workspaceId);

      res.json({
        workspace,
        members,
      });
    } catch (error) {
      console.error("Get workspace error:", error);
      res.status(500).json({ error: "Failed to get workspace" });
    }
  });

  // Update workspace
  app.patch("/api/workspaces/:workspaceId", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const { name, plan, eventQuota } = req.body;
      const updated = await storage.updateWorkspace(req.params.workspaceId, {
        name,
        plan,
        eventQuota,
      });

      res.json(updated);
    } catch (error) {
      console.error("Update workspace error:", error);
      res.status(500).json({ error: "Failed to update workspace" });
    }
  });

  // ===== API KEY ROUTES =====

  // Get API keys for workspace
  app.get("/api/workspaces/:workspaceId/api-keys", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const keys = await storage.getApiKeysByWorkspace(req.params.workspaceId);
      // Don't return the actual keys, only metadata
      const safeKeys = keys.map(k => ({
        id: k.id,
        name: k.name,
        lastUsedAt: k.lastUsedAt,
        createdAt: k.createdAt,
        expiresAt: k.expiresAt,
        isActive: k.isActive,
        keyPreview: k.key.substring(0, 12) + "..." + k.key.substring(k.key.length - 4),
      }));

      res.json(safeKeys);
    } catch (error) {
      console.error("Get API keys error:", error);
      res.status(500).json({ error: "Failed to get API keys" });
    }
  });

  // Create new API key
  app.post("/api/workspaces/:workspaceId/api-keys", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const { name } = insertApiKeySchema.parse(req.body);
      const key = generateApiKey();

      const apiKey = await storage.createApiKey({
        workspaceId: req.params.workspaceId,
        name,
        key,
      });

      // Return the full key only on creation
      res.status(201).json({
        ...apiKey,
        message: "Save this key securely. You won't be able to see it again.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Create API key error:", error);
      res.status(500).json({ error: "Failed to create API key" });
    }
  });

  // Delete API key
  app.delete("/api/workspaces/:workspaceId/api-keys/:keyId", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteApiKey(req.params.keyId);
      if (!success) {
        return res.status(404).json({ error: "API key not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete API key error:", error);
      res.status(500).json({ error: "Failed to delete API key" });
    }
  });

  // ===== EVENT TRACKING ROUTES =====

  // Create single event (requires API key)
  app.post("/api/events", authenticateApiKey, checkUsageQuota, async (req: AuthRequest, res) => {
    try {
      const event = insertEventSchema.parse({
        ...req.body,
        workspaceId: req.workspaceId,
      });

      const newEvent = await storage.createEvent(event);
      await storage.incrementWorkspaceEventCount(req.workspaceId!);

      // Clear cache for this workspace
      const cachePrefix = `workspace:${req.workspaceId}`;
      for (const key of metricsCache.keys()) {
        if (key.startsWith(cachePrefix)) {
          metricsCache.delete(key);
        }
      }

      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid event data", details: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  // Create batch events (requires API key)
  app.post("/api/events/batch", authenticateApiKey, checkUsageQuota, async (req: AuthRequest, res) => {
    try {
      const { events: eventsList } = batchInsertEventSchema.parse(req.body);

      // Add workspace ID to all events
      const eventsWithWorkspace = eventsList.map(e => ({
        ...e,
        workspaceId: req.workspaceId!,
      }));

      const newEvents = await storage.createEvents(eventsWithWorkspace);

      // Increment event count
      for (let i = 0; i < newEvents.length; i++) {
        await storage.incrementWorkspaceEventCount(req.workspaceId!);
      }

      // Clear cache
      const cachePrefix = `workspace:${req.workspaceId}`;
      for (const key of metricsCache.keys()) {
        if (key.startsWith(cachePrefix)) {
          metricsCache.delete(key);
        }
      }

      res.status(201).json({ inserted: newEvents.length, events: newEvents });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid batch data", details: error.errors });
      }
      console.error("Error creating batch events:", error);
      res.status(500).json({ error: "Failed to create events" });
    }
  });

  // Get events (authenticated users only)
  app.get("/api/workspaces/:workspaceId/events", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const query = analyticsQuerySchema.parse({
        eventName: req.query.eventName,
        eventType: req.query.eventType,
        source: req.query.source,
        userId: req.query.userId,
        sessionId: req.query.sessionId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: req.query.limit ? Number(req.query.limit) : 100,
        offset: req.query.offset ? Number(req.query.offset) : 0,
      });

      const eventsList = await storage.getEvents({
        ...query,
        workspaceId: req.params.workspaceId,
      });

      res.json(eventsList);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid query parameters", details: error.errors });
      }
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // ===== ANALYTICS ROUTES =====

  // Get analytics stats
  app.get("/api/workspaces/:workspaceId/analytics/stats", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const range = (req.query.range as string) || "7d";
      const { startDate, endDate } = getDateRange(range);

      const cacheKey = `workspace:${req.params.workspaceId}:stats:${range}`;
      const cached = getCached<unknown>(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const stats = await storage.getEventStats(req.params.workspaceId, startDate, endDate);

      // Calculate previous period for trends
      const prevStartDate = new Date(startDate);
      const prevEndDate = new Date(startDate);
      const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      prevStartDate.setDate(prevStartDate.getDate() - daysDiff);

      const prevStats = await storage.getEventStats(req.params.workspaceId, prevStartDate, prevEndDate);

      const result = {
        ...stats,
        trends: {
          eventsChange: prevStats.totalEvents > 0
            ? ((stats.totalEvents - prevStats.totalEvents) / prevStats.totalEvents) * 100
            : 0,
          usersChange: prevStats.uniqueUsers > 0
            ? ((stats.uniqueUsers - prevStats.uniqueUsers) / prevStats.uniqueUsers) * 100
            : 0,
        },
        period: { startDate, endDate },
      };

      setCache(cacheKey, result);
      res.json(result);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Get top events
  app.get("/api/workspaces/:workspaceId/analytics/top-events", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const range = (req.query.range as string) || "7d";
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const { startDate, endDate } = getDateRange(range);

      const cacheKey = `workspace:${req.params.workspaceId}:top-events:${range}:${limit}`;
      const cached = getCached<unknown>(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const topEvents = await storage.getTopEvents(req.params.workspaceId, limit, startDate, endDate);

      setCache(cacheKey, topEvents);
      res.json(topEvents);
    } catch (error) {
      console.error("Error fetching top events:", error);
      res.status(500).json({ error: "Failed to fetch top events" });
    }
  });

  // Get event volume
  app.get("/api/workspaces/:workspaceId/analytics/volume", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const range = (req.query.range as string) || "7d";
      const { startDate, endDate } = getDateRange(range);

      const cacheKey = `workspace:${req.params.workspaceId}:volume:${range}`;
      const cached = getCached<unknown>(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const volume = await storage.getEventVolume(req.params.workspaceId, startDate, endDate);

      setCache(cacheKey, volume);
      res.json(volume);
    } catch (error) {
      console.error("Error fetching event volume:", error);
      res.status(500).json({ error: "Failed to fetch event volume" });
    }
  });

  // Get event types
  app.get("/api/workspaces/:workspaceId/analytics/event-types", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const cacheKey = `workspace:${req.params.workspaceId}:event-types`;
      const cached = getCached<unknown>(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const eventTypes = await storage.getEventTypes(req.params.workspaceId);

      setCache(cacheKey, eventTypes);
      res.json(eventTypes);
    } catch (error) {
      console.error("Error fetching event types:", error);
      res.status(500).json({ error: "Failed to fetch event types" });
    }
  });

  // ===== REPORT ROUTES =====

  // Get reports
  app.get("/api/workspaces/:workspaceId/reports", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const reports = await storage.getReports(req.params.workspaceId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  // Create report
  app.post("/api/workspaces/:workspaceId/reports", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const report = insertReportSchema.parse({
        ...req.body,
        workspaceId: req.params.workspaceId,
        createdBy: req.user!.userId,
      });

      const newReport = await storage.createReport(report);
      res.status(201).json(newReport);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid report data", details: error.errors });
      }
      console.error("Error creating report:", error);
      res.status(500).json({ error: "Failed to create report" });
    }
  });

  // Update report
  app.patch("/api/workspaces/:workspaceId/reports/:reportId", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const updated = await storage.updateReport(req.params.reportId, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating report:", error);
      res.status(500).json({ error: "Failed to update report" });
    }
  });

  // Delete report
  app.delete("/api/workspaces/:workspaceId/reports/:reportId", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteReport(req.params.reportId);
      if (!success) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting report:", error);
      res.status(500).json({ error: "Failed to delete report" });
    }
  });

  // ===== FUNNEL ROUTES =====

  // Get funnels
  app.get("/api/workspaces/:workspaceId/funnels", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const funnels = await storage.getFunnels(req.params.workspaceId);
      res.json(funnels);
    } catch (error) {
      console.error("Error fetching funnels:", error);
      res.status(500).json({ error: "Failed to fetch funnels" });
    }
  });

  // Create funnel
  app.post("/api/workspaces/:workspaceId/funnels", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const funnel = insertFunnelSchema.parse({
        ...req.body,
        workspaceId: req.params.workspaceId,
        createdBy: req.user!.userId,
      });

      const newFunnel = await storage.createFunnel(funnel);
      res.status(201).json(newFunnel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid funnel data", details: error.errors });
      }
      console.error("Error creating funnel:", error);
      res.status(500).json({ error: "Failed to create funnel" });
    }
  });

  // ===== ALERT ROUTES =====

  // Get alerts
  app.get("/api/workspaces/:workspaceId/alerts", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const alerts = await storage.getAlerts(req.params.workspaceId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // Create alert
  app.post("/api/workspaces/:workspaceId/alerts", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const alert = insertAlertSchema.parse({
        ...req.body,
        workspaceId: req.params.workspaceId,
        createdBy: req.user!.userId,
      });

      const newAlert = await storage.createAlert(alert);
      res.status(201).json(newAlert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid alert data", details: error.errors });
      }
      console.error("Error creating alert:", error);
      res.status(500).json({ error: "Failed to create alert" });
    }
  });

  // ===== DASHBOARD ROUTES =====

  // Get dashboards
  app.get("/api/workspaces/:workspaceId/dashboards", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const dashboards = await storage.getDashboards(req.params.workspaceId);
      res.json(dashboards);
    } catch (error) {
      console.error("Error fetching dashboards:", error);
      res.status(500).json({ error: "Failed to fetch dashboards" });
    }
  });

  // Create dashboard
  app.post("/api/workspaces/:workspaceId/dashboards", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      const dashboard = insertDashboardSchema.parse({
        ...req.body,
        workspaceId: req.params.workspaceId,
        createdBy: req.user!.userId,
      });

      const newDashboard = await storage.createDashboard(dashboard);
      res.status(201).json(newDashboard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid dashboard data", details: error.errors });
      }
      console.error("Error creating dashboard:", error);
      res.status(500).json({ error: "Failed to create dashboard" });
    }
  });

  // ===== BILLING & STRIPE ROUTES =====

  // Get pricing tiers
  app.get("/api/billing/pricing", (_, res) => {
    res.json(PRICING_TIERS);
  });

  // Create checkout session for plan upgrade
  app.post("/api/billing/create-checkout", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Billing is not configured" });
      }

      const { plan, successUrl, cancelUrl } = req.body;
      const workspaceId = req.params.workspaceId || req.body.workspaceId;

      if (!plan || !successUrl || !cancelUrl || !workspaceId) {
        return res.status(400).json({
          error: "Missing required fields: plan, successUrl, cancelUrl, workspaceId"
        });
      }

      // Validate plan type
      if (!PRICING_TIERS[plan as PlanType]) {
        return res.status(400).json({ error: "Invalid plan type" });
      }

      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const session = await createCheckoutSession(
        workspaceId,
        plan as PlanType,
        successUrl,
        cancelUrl,
        user.email
      );

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error("Create checkout error:", error);
      res.status(500).json({
        error: "Failed to create checkout session",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create billing portal session
  app.post("/api/billing/portal", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Billing is not configured" });
      }

      const { returnUrl, workspaceId } = req.body;

      if (!returnUrl || !workspaceId) {
        return res.status(400).json({ error: "Missing returnUrl or workspaceId" });
      }

      const session = await createBillingPortalSession(workspaceId, returnUrl);

      res.json({ url: session.url });
    } catch (error) {
      console.error("Create billing portal error:", error);
      res.status(500).json({
        error: "Failed to create billing portal session",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get subscription details
  app.get("/api/billing/subscription/:workspaceId", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      if (!stripe) {
        return res.json({ subscription: null, upcomingInvoice: null });
      }

      const details = await getSubscriptionDetails(req.params.workspaceId);

      res.json(details);
    } catch (error) {
      console.error("Get subscription error:", error);
      res.status(500).json({ error: "Failed to get subscription details" });
    }
  });

  // Cancel subscription
  app.post("/api/billing/cancel", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Billing is not configured" });
      }

      const { workspaceId } = req.body;

      if (!workspaceId) {
        return res.status(400).json({ error: "Missing workspaceId" });
      }

      await cancelSubscription(workspaceId);

      res.json({ success: true, message: "Subscription will be canceled at period end" });
    } catch (error) {
      console.error("Cancel subscription error:", error);
      res.status(500).json({
        error: "Failed to cancel subscription",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Reactivate subscription
  app.post("/api/billing/reactivate", authenticateToken, checkWorkspaceAccess, async (req: AuthRequest, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Billing is not configured" });
      }

      const { workspaceId } = req.body;

      if (!workspaceId) {
        return res.status(400).json({ error: "Missing workspaceId" });
      }

      await reactivateSubscription(workspaceId);

      res.json({ success: true, message: "Subscription reactivated" });
    } catch (error) {
      console.error("Reactivate subscription error:", error);
      res.status(500).json({
        error: "Failed to reactivate subscription",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Stripe webhook handler
  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Billing is not configured" });
      }

      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !webhookSecret) {
        return res.status(400).json({ error: "Missing signature or webhook secret" });
      }

      let event: Stripe.Event;

      try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
          req.body,
          sig as string,
          webhookSecret
        );
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return res.status(400).json({
          error: "Webhook signature verification failed",
          message: err instanceof Error ? err.message : "Unknown error"
        });
      }

      // Handle the event
      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
          console.log(`Checkout completed: ${event.data.object.id}`);
          break;

        case "customer.subscription.updated":
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          console.log(`Subscription updated: ${event.data.object.id}`);
          break;

        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          console.log(`Subscription deleted: ${event.data.object.id}`);
          break;

        case "invoice.payment_failed":
          const invoice = event.data.object as Stripe.Invoice;
          console.warn(`Payment failed for invoice: ${invoice.id}`);
          // TODO: Send email notification to customer
          break;

        case "invoice.payment_succeeded":
          const paidInvoice = event.data.object as Stripe.Invoice;
          console.log(`Payment succeeded for invoice: ${paidInvoice.id}`);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook handler error:", error);
      res.status(500).json({
        error: "Webhook handler failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
