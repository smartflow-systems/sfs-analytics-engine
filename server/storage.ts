import { db } from "./db";
import {
  users,
  workspaces,
  events,
  funnels,
  alerts,
  dailyStats,
  type User,
  type InsertUser,
  type Workspace,
  type InsertWorkspace,
  type Event,
  type InsertEvent,
  type Funnel,
  type InsertFunnel,
  type Alert,
  type InsertAlert,
} from "@shared/schema";
import { eq, and, gte, lte, desc, sql, count, countDistinct } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Workspace methods
  getWorkspace(id: string): Promise<Workspace | undefined>;
  getWorkspacesByOwnerId(ownerId: string): Promise<Workspace[]>;
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  updateWorkspaceTier(id: string, tier: string, eventQuota: number): Promise<void>;

  // Event methods
  createEvent(event: InsertEvent): Promise<Event>;
  getEventsByWorkspace(workspaceId: string, startDate: Date, endDate: Date): Promise<Event[]>;
  getEventCount(workspaceId: string, startDate: Date, endDate: Date): Promise<number>;
  getUniqueUserCount(workspaceId: string, startDate: Date, endDate: Date): Promise<number>;
  getTopEvents(workspaceId: string, startDate: Date, endDate: Date, limit: number): Promise<{ event: string; count: number }[]>;
  getEventsByType(workspaceId: string, eventName: string, startDate: Date, endDate: Date): Promise<Event[]>;

  // Funnel methods
  getFunnelsByWorkspace(workspaceId: string): Promise<Funnel[]>;
  createFunnel(funnel: InsertFunnel): Promise<Funnel>;
  analyzeFunnel(funnelId: string, startDate: Date, endDate: Date): Promise<any>;

  // Alert methods
  getAlertsByWorkspace(workspaceId: string): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlertStatus(id: string, enabled: boolean): Promise<void>;

  // Analytics methods
  getDailyEventCounts(workspaceId: string, startDate: Date, endDate: Date): Promise<{ date: string; count: number }[]>;
  getActiveUsersNow(workspaceId: string): Promise<number>;
  getCohortRetention(workspaceId: string, cohortDate: Date): Promise<any>;
}

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Workspace methods
  async getWorkspace(id: string): Promise<Workspace | undefined> {
    const result = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
    return result[0];
  }

  async getWorkspacesByOwnerId(ownerId: string): Promise<Workspace[]> {
    return db.select().from(workspaces).where(eq(workspaces.ownerId, ownerId));
  }

  async createWorkspace(workspace: InsertWorkspace): Promise<Workspace> {
    const result = await db.insert(workspaces).values(workspace).returning();
    return result[0];
  }

  async updateWorkspaceTier(id: string, tier: string, eventQuota: number): Promise<void> {
    await db.update(workspaces)
      .set({ tier, eventQuota, updatedAt: new Date() })
      .where(eq(workspaces.id, id));
  }

  // Event methods
  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async getEventsByWorkspace(workspaceId: string, startDate: Date, endDate: Date): Promise<Event[]> {
    return db.select().from(events)
      .where(
        and(
          eq(events.workspaceId, workspaceId),
          gte(events.timestamp, startDate),
          lte(events.timestamp, endDate)
        )
      )
      .orderBy(desc(events.timestamp))
      .limit(1000);
  }

  async getEventCount(workspaceId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await db.select({ count: count() }).from(events)
      .where(
        and(
          eq(events.workspaceId, workspaceId),
          gte(events.timestamp, startDate),
          lte(events.timestamp, endDate)
        )
      );
    return result[0]?.count || 0;
  }

  async getUniqueUserCount(workspaceId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await db.select({ count: countDistinct(events.userId) }).from(events)
      .where(
        and(
          eq(events.workspaceId, workspaceId),
          gte(events.timestamp, startDate),
          lte(events.timestamp, endDate)
        )
      );
    return result[0]?.count || 0;
  }

  async getTopEvents(workspaceId: string, startDate: Date, endDate: Date, limit: number): Promise<{ event: string; count: number }[]> {
    const result = await db.select({
      event: events.event,
      count: count()
    })
      .from(events)
      .where(
        and(
          eq(events.workspaceId, workspaceId),
          gte(events.timestamp, startDate),
          lte(events.timestamp, endDate)
        )
      )
      .groupBy(events.event)
      .orderBy(desc(count()))
      .limit(limit);

    return result.map(r => ({ event: r.event, count: Number(r.count) }));
  }

  async getEventsByType(workspaceId: string, eventName: string, startDate: Date, endDate: Date): Promise<Event[]> {
    return db.select().from(events)
      .where(
        and(
          eq(events.workspaceId, workspaceId),
          eq(events.event, eventName),
          gte(events.timestamp, startDate),
          lte(events.timestamp, endDate)
        )
      )
      .orderBy(desc(events.timestamp))
      .limit(1000);
  }

  // Funnel methods
  async getFunnelsByWorkspace(workspaceId: string): Promise<Funnel[]> {
    return db.select().from(funnels).where(eq(funnels.workspaceId, workspaceId));
  }

  async createFunnel(funnel: InsertFunnel): Promise<Funnel> {
    const result = await db.insert(funnels).values(funnel).returning();
    return result[0];
  }

  async analyzeFunnel(funnelId: string, startDate: Date, endDate: Date): Promise<any> {
    // Get funnel definition
    const funnel = await db.select().from(funnels).where(eq(funnels.id, funnelId)).limit(1);
    if (!funnel[0]) return null;

    const steps = funnel[0].steps as string[];
    const workspaceId = funnel[0].workspaceId;

    // For each step, count unique users who completed it
    const stepCounts = await Promise.all(
      steps.map(async (step) => {
        const result = await db.select({ count: countDistinct(events.userId) })
          .from(events)
          .where(
            and(
              eq(events.workspaceId, workspaceId),
              eq(events.event, step),
              gte(events.timestamp, startDate),
              lte(events.timestamp, endDate)
            )
          );
        return { step, count: result[0]?.count || 0 };
      })
    );

    return {
      funnel: funnel[0],
      steps: stepCounts,
      conversionRate: stepCounts.length > 0
        ? ((stepCounts[stepCounts.length - 1].count / stepCounts[0].count) * 100).toFixed(2)
        : 0
    };
  }

  // Alert methods
  async getAlertsByWorkspace(workspaceId: string): Promise<Alert[]> {
    return db.select().from(alerts).where(eq(alerts.workspaceId, workspaceId));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const result = await db.insert(alerts).values(alert).returning();
    return result[0];
  }

  async updateAlertStatus(id: string, enabled: boolean): Promise<void> {
    await db.update(alerts)
      .set({ enabled: enabled ? 1 : 0 })
      .where(eq(alerts.id, id));
  }

  // Analytics methods
  async getDailyEventCounts(workspaceId: string, startDate: Date, endDate: Date): Promise<{ date: string; count: number }[]> {
    const result = await db.select({
      date: sql`DATE(${events.timestamp})`,
      count: count()
    })
      .from(events)
      .where(
        and(
          eq(events.workspaceId, workspaceId),
          gte(events.timestamp, startDate),
          lte(events.timestamp, endDate)
        )
      )
      .groupBy(sql`DATE(${events.timestamp})`)
      .orderBy(sql`DATE(${events.timestamp})`);

    return result.map(r => ({
      date: String(r.date),
      count: Number(r.count)
    }));
  }

  async getActiveUsersNow(workspaceId: string): Promise<number> {
    // Users active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = await db.select({ count: countDistinct(events.userId) })
      .from(events)
      .where(
        and(
          eq(events.workspaceId, workspaceId),
          gte(events.timestamp, fiveMinutesAgo)
        )
      );
    return result[0]?.count || 0;
  }

  async getCohortRetention(workspaceId: string, cohortDate: Date): Promise<any> {
    // This is a simplified cohort retention calculation
    // In production, you'd want more sophisticated cohort analysis
    const endOfCohortDay = new Date(cohortDate);
    endOfCohortDay.setDate(endOfCohortDay.getDate() + 1);

    // Get users who were active on cohort day
    const cohortUsers = await db.selectDistinct({ userId: events.userId })
      .from(events)
      .where(
        and(
          eq(events.workspaceId, workspaceId),
          gte(events.timestamp, cohortDate),
          lte(events.timestamp, endOfCohortDay)
        )
      );

    const cohortSize = cohortUsers.length;

    // Calculate retention for days 7, 30, 90
    const retentionPeriods = [7, 30, 90];
    const retention = await Promise.all(
      retentionPeriods.map(async (days) => {
        const periodStart = new Date(cohortDate);
        periodStart.setDate(periodStart.getDate() + days);
        const periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 1);

        const activeUsers = await db.selectDistinct({ userId: events.userId })
          .from(events)
          .where(
            and(
              eq(events.workspaceId, workspaceId),
              gte(events.timestamp, periodStart),
              lte(events.timestamp, periodEnd)
            )
          );

        const activeCount = activeUsers.filter(au =>
          cohortUsers.some(cu => cu.userId === au.userId)
        ).length;

        return {
          day: days,
          retained: activeCount,
          retentionRate: cohortSize > 0 ? ((activeCount / cohortSize) * 100).toFixed(2) : 0
        };
      })
    );

    return {
      cohortDate,
      cohortSize,
      retention
    };
  }
}

export const storage = new DbStorage();
