import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Workspaces table - multi-tenant support
export const workspaces = pgTable("workspaces", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subdomain: text("subdomain").unique(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  tier: text("tier").notNull().default("free"), // free, pro, enterprise
  eventQuota: integer("event_quota").notNull().default(10000), // events per month
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWorkspaceSchema = createInsertSchema(workspaces).pick({
  name: true,
  subdomain: true,
  ownerId: true,
  tier: true,
  eventQuota: true,
});

export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type Workspace = typeof workspaces.$inferSelect;

// Events table - core analytics data
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").references(() => workspaces.id).notNull(),
  userId: text("user_id"), // user ID from the customer's app
  event: text("event").notNull(), // e.g., "invoice_sent", "qr_scanned"
  properties: jsonb("properties").default({}), // event metadata
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  sessionId: text("session_id"), // for session tracking
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
}, (table) => ({
  workspaceIdx: index("workspace_idx").on(table.workspaceId),
  eventIdx: index("event_idx").on(table.event),
  timestampIdx: index("timestamp_idx").on(table.timestamp),
  userIdx: index("user_idx").on(table.userId),
}));

export const insertEventSchema = createInsertSchema(events).pick({
  workspaceId: true,
  userId: true,
  event: true,
  properties: true,
  timestamp: true,
  sessionId: true,
  ipAddress: true,
  userAgent: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Event queue for Redis batch processing
export const eventQueue = pgTable("event_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  payload: jsonb("payload").notNull(),
  processed: integer("processed").notNull().default(0), // 0 = pending, 1 = processed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Funnel definitions
export const funnels = pgTable("funnels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").references(() => workspaces.id).notNull(),
  name: text("name").notNull(),
  steps: jsonb("steps").notNull(), // array of event names
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFunnelSchema = createInsertSchema(funnels).pick({
  workspaceId: true,
  name: true,
  steps: true,
});

export type InsertFunnel = z.infer<typeof insertFunnelSchema>;
export type Funnel = typeof funnels.$inferSelect;

// Alerts configuration
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").references(() => workspaces.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // anomaly, usage_limit, churn_risk
  condition: jsonb("condition").notNull(), // alert trigger conditions
  notificationChannels: jsonb("notification_channels").notNull(), // slack, email, webhook
  enabled: integer("enabled").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  workspaceId: true,
  name: true,
  type: true,
  condition: true,
  notificationChannels: true,
  enabled: true,
});

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

// Daily aggregates for performance
export const dailyStats = pgTable("daily_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").references(() => workspaces.id).notNull(),
  date: timestamp("date").notNull(),
  event: text("event").notNull(),
  count: integer("count").notNull().default(0),
  uniqueUsers: integer("unique_users").notNull().default(0),
}, (table) => ({
  workspaceDateIdx: unique().on(table.workspaceId, table.date, table.event),
}));
