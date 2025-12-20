import {
  type User,
  type InsertUser,
  type Event,
  type InsertEvent,
  type Report,
  type InsertReport,
  type Workspace,
  type InsertWorkspace,
  type WorkspaceMember,
  type InsertWorkspaceMember,
  type ApiKey,
  type InsertApiKey,
  type Funnel,
  type InsertFunnel,
  type Alert,
  type InsertAlert,
  type Dashboard,
  type InsertDashboard,
  type AnalyticsQuery,
  users,
  events,
  reports,
  workspaces,
  workspaceMembers,
  apiKeys,
  funnels,
  alerts,
  dashboards,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte, count, countDistinct } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Workspace methods
  getWorkspace(id: string): Promise<Workspace | undefined>;
  getWorkspaceBySlug(slug: string): Promise<Workspace | undefined>;
  getWorkspacesByOwner(ownerId: string): Promise<Workspace[]>;
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  updateWorkspace(id: string, workspace: Partial<InsertWorkspace>): Promise<Workspace | undefined>;
  incrementWorkspaceEventCount(id: string): Promise<void>;

  // Workspace Member methods
  getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]>;
  addWorkspaceMember(member: InsertWorkspaceMember): Promise<WorkspaceMember>;
  removeWorkspaceMember(workspaceId: string, userId: string): Promise<boolean>;

  // API Key methods
  getApiKey(key: string): Promise<ApiKey | undefined>;
  getApiKeysByWorkspace(workspaceId: string): Promise<ApiKey[]>;
  createApiKey(apiKey: InsertApiKey & { key: string }): Promise<ApiKey>;
  updateApiKeyLastUsed(id: string): Promise<void>;
  deleteApiKey(id: string): Promise<boolean>;

  // Event methods
  createEvent(event: InsertEvent): Promise<Event>;
  createEvents(eventsList: InsertEvent[]): Promise<Event[]>;
  getEvents(query: AnalyticsQuery & { workspaceId?: string }): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;

  // Analytics methods
  getEventStats(workspaceId: string, startDate?: Date, endDate?: Date): Promise<{
    totalEvents: number;
    uniqueUsers: number;
  }>;
  getTopEvents(workspaceId: string, limit?: number, startDate?: Date, endDate?: Date): Promise<{
    eventName: string;
    count: number;
  }[]>;
  getEventVolume(workspaceId: string, startDate?: Date, endDate?: Date): Promise<{
    date: string;
    events: number;
  }[]>;
  getEventTypes(workspaceId: string): Promise<{
    name: string;
    count: number;
    users: number;
    avgProps: number;
  }[]>;

  // Report methods
  getReports(workspaceId: string): Promise<Report[]>;
  getReportById(id: string): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: string, report: Partial<InsertReport>): Promise<Report | undefined>;
  deleteReport(id: string): Promise<boolean>;

  // Funnel methods
  getFunnels(workspaceId: string): Promise<Funnel[]>;
  getFunnelById(id: string): Promise<Funnel | undefined>;
  createFunnel(funnel: InsertFunnel): Promise<Funnel>;
  updateFunnel(id: string, funnel: Partial<InsertFunnel>): Promise<Funnel | undefined>;
  deleteFunnel(id: string): Promise<boolean>;

  // Alert methods
  getAlerts(workspaceId: string): Promise<Alert[]>;
  getActiveAlerts(workspaceId: string): Promise<Alert[]>;
  getAlertById(id: string): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, alert: Partial<InsertAlert>): Promise<Alert | undefined>;
  deleteAlert(id: string): Promise<boolean>;

  // Dashboard methods
  getDashboards(workspaceId: string): Promise<Dashboard[]>;
  getDashboardById(id: string): Promise<Dashboard | undefined>;
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  updateDashboard(id: string, dashboard: Partial<InsertDashboard>): Promise<Dashboard | undefined>;
  deleteDashboard(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Workspace methods
  async getWorkspace(id: string): Promise<Workspace | undefined> {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    return workspace;
  }

  async getWorkspaceBySlug(slug: string): Promise<Workspace | undefined> {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.slug, slug));
    return workspace;
  }

  async getWorkspacesByOwner(ownerId: string): Promise<Workspace[]> {
    return db.select().from(workspaces).where(eq(workspaces.ownerId, ownerId));
  }

  async createWorkspace(workspace: InsertWorkspace): Promise<Workspace> {
    const [newWorkspace] = await db.insert(workspaces).values(workspace).returning();
    return newWorkspace;
  }

  async updateWorkspace(id: string, workspace: Partial<InsertWorkspace>): Promise<Workspace | undefined> {
    const [updated] = await db.update(workspaces)
      .set({ ...workspace, updatedAt: new Date() })
      .where(eq(workspaces.id, id))
      .returning();
    return updated;
  }

  async incrementWorkspaceEventCount(id: string): Promise<void> {
    await db.update(workspaces)
      .set({ eventCount: sql`${workspaces.eventCount} + 1` })
      .where(eq(workspaces.id, id));
  }

  // Workspace Member methods
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return db.select().from(workspaceMembers).where(eq(workspaceMembers.workspaceId, workspaceId));
  }

  async addWorkspaceMember(member: InsertWorkspaceMember): Promise<WorkspaceMember> {
    const [newMember] = await db.insert(workspaceMembers).values(member).returning();
    return newMember;
  }

  async removeWorkspaceMember(workspaceId: string, userId: string): Promise<boolean> {
    const result = await db.delete(workspaceMembers)
      .where(and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      ))
      .returning();
    return result.length > 0;
  }

  // API Key methods
  async getApiKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.key, key));
    return apiKey;
  }

  async getApiKeysByWorkspace(workspaceId: string): Promise<ApiKey[]> {
    return db.select().from(apiKeys).where(eq(apiKeys.workspaceId, workspaceId));
  }

  async createApiKey(apiKey: InsertApiKey & { key: string }): Promise<ApiKey> {
    const [newApiKey] = await db.insert(apiKeys).values(apiKey).returning();
    return newApiKey;
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    await db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, id));
  }

  async deleteApiKey(id: string): Promise<boolean> {
    const result = await db.delete(apiKeys).where(eq(apiKeys.id, id)).returning();
    return result.length > 0;
  }

  // Event methods
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async createEvents(eventsList: InsertEvent[]): Promise<Event[]> {
    if (eventsList.length === 0) return [];
    const newEvents = await db.insert(events).values(eventsList).returning();
    return newEvents;
  }

  async getEvents(query: AnalyticsQuery & { workspaceId?: string }): Promise<Event[]> {
    const conditions = [];

    if (query.workspaceId) {
      conditions.push(eq(events.workspaceId, query.workspaceId));
    }
    if (query.eventName) {
      conditions.push(eq(events.eventName, query.eventName));
    }
    if (query.eventType) {
      conditions.push(eq(events.eventType, query.eventType));
    }
    if (query.source) {
      conditions.push(eq(events.source, query.source));
    }
    if (query.userId) {
      conditions.push(eq(events.userId, query.userId));
    }
    if (query.sessionId) {
      conditions.push(eq(events.sessionId, query.sessionId));
    }
    if (query.startDate) {
      conditions.push(gte(events.timestamp, new Date(query.startDate)));
    }
    if (query.endDate) {
      conditions.push(lte(events.timestamp, new Date(query.endDate)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return db.select()
      .from(events)
      .where(whereClause)
      .orderBy(desc(events.timestamp))
      .limit(query.limit)
      .offset(query.offset);
  }

  async getEventById(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  // Analytics methods
  async getEventStats(workspaceId: string, startDate?: Date, endDate?: Date): Promise<{
    totalEvents: number;
    uniqueUsers: number;
  }> {
    const conditions = [eq(events.workspaceId, workspaceId)];
    if (startDate) conditions.push(gte(events.timestamp, startDate));
    if (endDate) conditions.push(lte(events.timestamp, endDate));
    const whereClause = and(...conditions);

    const [result] = await db.select({
      totalEvents: count(),
      uniqueUsers: countDistinct(events.userId),
    }).from(events).where(whereClause);

    return {
      totalEvents: result?.totalEvents || 0,
      uniqueUsers: result?.uniqueUsers || 0,
    };
  }

  async getTopEvents(workspaceId: string, limit = 10, startDate?: Date, endDate?: Date): Promise<{
    eventName: string;
    count: number;
  }[]> {
    const conditions = [eq(events.workspaceId, workspaceId)];
    if (startDate) conditions.push(gte(events.timestamp, startDate));
    if (endDate) conditions.push(lte(events.timestamp, endDate));
    const whereClause = and(...conditions);

    const result = await db.select({
      eventName: events.eventName,
      count: count(),
    })
      .from(events)
      .where(whereClause)
      .groupBy(events.eventName)
      .orderBy(desc(count()))
      .limit(limit);

    return result.map(r => ({
      eventName: r.eventName,
      count: r.count,
    }));
  }

  async getEventVolume(workspaceId: string, startDate?: Date, endDate?: Date): Promise<{
    date: string;
    events: number;
  }[]> {
    const conditions = [eq(events.workspaceId, workspaceId)];
    if (startDate) conditions.push(gte(events.timestamp, startDate));
    if (endDate) conditions.push(lte(events.timestamp, endDate));
    const whereClause = and(...conditions);

    const result = await db.select({
      date: sql<string>`DATE(${events.timestamp})`,
      events: count(),
    })
      .from(events)
      .where(whereClause)
      .groupBy(sql`DATE(${events.timestamp})`)
      .orderBy(sql`DATE(${events.timestamp})`);

    return result.map(r => ({
      date: r.date,
      events: r.events,
    }));
  }

  async getEventTypes(workspaceId: string): Promise<{
    name: string;
    count: number;
    users: number;
    avgProps: number;
  }[]> {
    const result = await db.select({
      name: events.eventName,
      count: count(),
      users: countDistinct(events.userId),
      avgProps: sql<number>`AVG(COALESCE((SELECT count(*) FROM jsonb_object_keys(${events.properties}::jsonb)), 0))`,
    })
      .from(events)
      .where(eq(events.workspaceId, workspaceId))
      .groupBy(events.eventName)
      .orderBy(desc(count()));

    return result.map(r => ({
      name: r.name,
      count: r.count,
      users: r.users,
      avgProps: Math.round(r.avgProps || 0),
    }));
  }

  // Report methods
  async getReports(workspaceId: string): Promise<Report[]> {
    return db.select().from(reports)
      .where(eq(reports.workspaceId, workspaceId))
      .orderBy(desc(reports.updatedAt));
  }

  async getReportById(id: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async updateReport(id: string, report: Partial<InsertReport>): Promise<Report | undefined> {
    const [updated] = await db.update(reports)
      .set({ ...report, updatedAt: new Date() })
      .where(eq(reports.id, id))
      .returning();
    return updated;
  }

  async deleteReport(id: string): Promise<boolean> {
    const result = await db.delete(reports).where(eq(reports.id, id)).returning();
    return result.length > 0;
  }

  // Funnel methods
  async getFunnels(workspaceId: string): Promise<Funnel[]> {
    return db.select().from(funnels)
      .where(eq(funnels.workspaceId, workspaceId))
      .orderBy(desc(funnels.createdAt));
  }

  async getFunnelById(id: string): Promise<Funnel | undefined> {
    const [funnel] = await db.select().from(funnels).where(eq(funnels.id, id));
    return funnel;
  }

  async createFunnel(funnel: InsertFunnel): Promise<Funnel> {
    const [newFunnel] = await db.insert(funnels).values(funnel).returning();
    return newFunnel;
  }

  async updateFunnel(id: string, funnel: Partial<InsertFunnel>): Promise<Funnel | undefined> {
    const [updated] = await db.update(funnels)
      .set({ ...funnel, updatedAt: new Date() })
      .where(eq(funnels.id, id))
      .returning();
    return updated;
  }

  async deleteFunnel(id: string): Promise<boolean> {
    const result = await db.delete(funnels).where(eq(funnels.id, id)).returning();
    return result.length > 0;
  }

  // Alert methods
  async getAlerts(workspaceId: string): Promise<Alert[]> {
    return db.select().from(alerts)
      .where(eq(alerts.workspaceId, workspaceId))
      .orderBy(desc(alerts.createdAt));
  }

  async getActiveAlerts(workspaceId: string): Promise<Alert[]> {
    return db.select().from(alerts)
      .where(and(
        eq(alerts.workspaceId, workspaceId),
        eq(alerts.isActive, true)
      ))
      .orderBy(desc(alerts.createdAt));
  }

  async getAlertById(id: string): Promise<Alert | undefined> {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, id));
    return alert;
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async updateAlert(id: string, alert: Partial<InsertAlert>): Promise<Alert | undefined> {
    const [updated] = await db.update(alerts)
      .set({ ...alert, updatedAt: new Date() })
      .where(eq(alerts.id, id))
      .returning();
    return updated;
  }

  async deleteAlert(id: string): Promise<boolean> {
    const result = await db.delete(alerts).where(eq(alerts.id, id)).returning();
    return result.length > 0;
  }

  // Dashboard methods
  async getDashboards(workspaceId: string): Promise<Dashboard[]> {
    return db.select().from(dashboards)
      .where(eq(dashboards.workspaceId, workspaceId))
      .orderBy(desc(dashboards.updatedAt));
  }

  async getDashboardById(id: string): Promise<Dashboard | undefined> {
    const [dashboard] = await db.select().from(dashboards).where(eq(dashboards.id, id));
    return dashboard;
  }

  async createDashboard(dashboard: InsertDashboard): Promise<Dashboard> {
    const [newDashboard] = await db.insert(dashboards).values(dashboard).returning();
    return newDashboard;
  }

  async updateDashboard(id: string, dashboard: Partial<InsertDashboard>): Promise<Dashboard | undefined> {
    const [updated] = await db.update(dashboards)
      .set({ ...dashboard, updatedAt: new Date() })
      .where(eq(dashboards.id, id))
      .returning();
    return updated;
  }

  async deleteDashboard(id: string): Promise<boolean> {
    const result = await db.delete(dashboards).where(eq(dashboards.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
