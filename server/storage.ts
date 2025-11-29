import { 
  type User, 
  type InsertUser, 
  type Event, 
  type InsertEvent,
  type Report,
  type InsertReport,
  type AnalyticsQuery,
  users, 
  events,
  reports
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte, count, countDistinct } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createEvent(event: InsertEvent): Promise<Event>;
  createEvents(eventsList: InsertEvent[]): Promise<Event[]>;
  getEvents(query: AnalyticsQuery): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  
  getEventStats(startDate?: Date, endDate?: Date): Promise<{
    totalEvents: number;
    uniqueUsers: number;
  }>;
  getTopEvents(limit?: number, startDate?: Date, endDate?: Date): Promise<{
    eventName: string;
    count: number;
  }[]>;
  getEventVolume(startDate?: Date, endDate?: Date): Promise<{
    date: string;
    events: number;
  }[]>;
  getEventTypes(): Promise<{
    name: string;
    count: number;
    users: number;
    avgProps: number;
  }[]>;
  
  getReports(): Promise<Report[]>;
  getReportById(id: string): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: string, report: Partial<InsertReport>): Promise<Report | undefined>;
  deleteReport(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async createEvents(eventsList: InsertEvent[]): Promise<Event[]> {
    if (eventsList.length === 0) return [];
    const newEvents = await db.insert(events).values(eventsList).returning();
    return newEvents;
  }

  async getEvents(query: AnalyticsQuery): Promise<Event[]> {
    const conditions = [];
    
    if (query.eventName) {
      conditions.push(eq(events.eventName, query.eventName));
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

  async getEventStats(startDate?: Date, endDate?: Date): Promise<{
    totalEvents: number;
    uniqueUsers: number;
  }> {
    const conditions = [];
    if (startDate) conditions.push(gte(events.timestamp, startDate));
    if (endDate) conditions.push(lte(events.timestamp, endDate));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [result] = await db.select({
      totalEvents: count(),
      uniqueUsers: countDistinct(events.userId),
    }).from(events).where(whereClause);

    return {
      totalEvents: result?.totalEvents || 0,
      uniqueUsers: result?.uniqueUsers || 0,
    };
  }

  async getTopEvents(limit = 10, startDate?: Date, endDate?: Date): Promise<{
    eventName: string;
    count: number;
  }[]> {
    const conditions = [];
    if (startDate) conditions.push(gte(events.timestamp, startDate));
    if (endDate) conditions.push(lte(events.timestamp, endDate));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

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

  async getEventVolume(startDate?: Date, endDate?: Date): Promise<{
    date: string;
    events: number;
  }[]> {
    const conditions = [];
    if (startDate) conditions.push(gte(events.timestamp, startDate));
    if (endDate) conditions.push(lte(events.timestamp, endDate));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

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

  async getEventTypes(): Promise<{
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
      .groupBy(events.eventName)
      .orderBy(desc(count()));

    return result.map(r => ({
      name: r.name,
      count: r.count,
      users: r.users,
      avgProps: Math.round(r.avgProps || 0),
    }));
  }

  async getReports(): Promise<Report[]> {
    return db.select().from(reports).orderBy(desc(reports.updatedAt));
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
}

export const storage = new DatabaseStorage();
