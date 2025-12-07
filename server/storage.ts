import { type User, type InsertUser, type AnalyticsEvent, type InsertAnalyticsEvent } from "@shared/schema";
import { randomUUID, randomInt } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Analytics Events
  createEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getEvents(options?: EventQueryOptions): Promise<AnalyticsEvent[]>;
  getEventsByDateRange(startDate: Date, endDate: Date): Promise<AnalyticsEvent[]>;
  getEventsByType(eventType: string): Promise<AnalyticsEvent[]>;
  getEventsBySource(source: string): Promise<AnalyticsEvent[]>;
  getEventCount(): Promise<number>;
  getTopEvents(limit?: number): Promise<Array<{ eventName: string; count: number }>>;
  getEventTrends(period: 'hour' | 'day' | 'week' | 'month'): Promise<Array<{ period: string; count: number }>>;
}

export interface EventQueryOptions {
  limit?: number;
  offset?: number;
  eventType?: string;
  source?: string;
  userId?: string;
  sessionId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private events: Map<string, AnalyticsEvent>;

  constructor() {
    this.users = new Map();
    this.events = new Map();

    // Seed with sample analytics data
    this.seedSampleData();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createEvent(insertEvent: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const id = randomUUID();
    const event: AnalyticsEvent = {
      id,
      eventName: insertEvent.eventName,
      eventType: insertEvent.eventType,
      userId: insertEvent.userId || null,
      sessionId: insertEvent.sessionId || null,
      metadata: insertEvent.metadata || null,
      source: insertEvent.source || null,
      timestamp: new Date(),
      ipAddress: insertEvent.ipAddress || null,
      userAgent: insertEvent.userAgent || null,
    };
    this.events.set(id, event);
    return event;
  }

  async getEvents(options: EventQueryOptions = {}): Promise<AnalyticsEvent[]> {
    let events = Array.from(this.events.values());

    // Apply filters
    if (options.eventType) {
      events = events.filter(e => e.eventType === options.eventType);
    }
    if (options.source) {
      events = events.filter(e => e.source === options.source);
    }
    if (options.userId) {
      events = events.filter(e => e.userId === options.userId);
    }
    if (options.sessionId) {
      events = events.filter(e => e.sessionId === options.sessionId);
    }
    if (options.startDate) {
      events = events.filter(e => e.timestamp >= options.startDate!);
    }
    if (options.endDate) {
      events = events.filter(e => e.timestamp <= options.endDate!);
    }

    // Sort by timestamp descending (newest first)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 100;
    return events.slice(offset, offset + limit);
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<AnalyticsEvent[]> {
    return this.getEvents({ startDate, endDate });
  }

  async getEventsByType(eventType: string): Promise<AnalyticsEvent[]> {
    return this.getEvents({ eventType });
  }

  async getEventsBySource(source: string): Promise<AnalyticsEvent[]> {
    return this.getEvents({ source });
  }

  async getEventCount(): Promise<number> {
    return this.events.size;
  }

  async getTopEvents(limit: number = 10): Promise<Array<{ eventName: string; count: number }>> {
    const events = Array.from(this.events.values());
    const eventCounts = new Map<string, number>();

    events.forEach(event => {
      const count = eventCounts.get(event.eventName) || 0;
      eventCounts.set(event.eventName, count + 1);
    });

    return Array.from(eventCounts.entries())
      .map(([eventName, count]) => ({ eventName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getEventTrends(period: 'hour' | 'day' | 'week' | 'month'): Promise<Array<{ period: string; count: number }>> {
    const events = Array.from(this.events.values());
    const trendMap = new Map<string, number>();

    events.forEach(event => {
      const periodKey = this.getPeriodKey(event.timestamp, period);
      const count = trendMap.get(periodKey) || 0;
      trendMap.set(periodKey, count + 1);
    });

    return Array.from(trendMap.entries())
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private getPeriodKey(date: Date, period: 'hour' | 'day' | 'week' | 'month'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');

    switch (period) {
      case 'hour':
        return `${year}-${month}-${day} ${hour}:00`;
      case 'day':
        return `${year}-${month}-${day}`;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return `${weekStart.getFullYear()}-W${String(Math.ceil(weekStart.getDate() / 7)).padStart(2, '0')}`;
      case 'month':
        return `${year}-${month}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  private seedSampleData() {
    // Generate sample events for the last 30 days
    const now = new Date();
    const eventTypes = ['page_view', 'click', 'form_submit', 'api_call', 'error'];
    const eventNames = [
      'Dashboard View',
      'User Login',
      'Report Generated',
      'Export Data',
      'Settings Updated',
      'Chart Interaction',
      'Filter Applied',
      'Search Query',
      'Button Click',
      'Form Submission',
    ];
    const sources = ['SmartFlowSite', 'SocialScaleBooster', 'SFSDataQueryEngine', 'sfs-marketing-and-growth'];

    for (let i = 0; i < 500; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);

      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - daysAgo);
      timestamp.setHours(timestamp.getHours() - hoursAgo);
      timestamp.setMinutes(timestamp.getMinutes() - minutesAgo);

      const event: AnalyticsEvent = {
        id: randomUUID(),
        eventName: eventNames[Math.floor(Math.random() * eventNames.length)],
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        userId: Math.random() > 0.5 ? `user_${Math.floor(Math.random() * 100)}` : null,
        sessionId: `session_${randomInt(0, 50)}`,
        metadata: {
          page: `/page-${Math.floor(Math.random() * 10)}`,
          duration: Math.floor(Math.random() * 300),
        },
        source: sources[Math.floor(Math.random() * sources.length)],
        timestamp,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0',
      };

      this.events.set(event.id, event);
    }
  }
}

export const storage = new MemStorage();
