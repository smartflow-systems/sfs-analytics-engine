import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_users_email").on(table.email),
  index("idx_users_username").on(table.username),
]);

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Workspaces table - for multi-tenancy
export const workspaces = pgTable("workspaces", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerId: varchar("owner_id").notNull(),
  plan: text("plan").notNull().default("free"), // free, pro, business, enterprise
  eventQuota: integer("event_quota").notNull().default(10000),
  eventCount: integer("event_count").notNull().default(0),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("trialing"), // trialing, active, past_due, canceled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_workspaces_owner").on(table.ownerId),
  index("idx_workspaces_slug").on(table.slug),
]);

export const insertWorkspaceSchema = createInsertSchema(workspaces).pick({
  name: true,
  slug: true,
  ownerId: true,
});

export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type Workspace = typeof workspaces.$inferSelect;

// Workspace members - for team collaboration
export const workspaceMembers = pgTable("workspace_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull().default("member"), // owner, admin, member, viewer
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_workspace_members_workspace").on(table.workspaceId),
  index("idx_workspace_members_user").on(table.userId),
]);

export const insertWorkspaceMemberSchema = createInsertSchema(workspaceMembers).pick({
  workspaceId: true,
  userId: true,
  role: true,
});

export type InsertWorkspaceMember = z.infer<typeof insertWorkspaceMemberSchema>;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;

// API Keys table - for integration authentication
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").notNull(),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
}, (table) => [
  index("idx_api_keys_workspace").on(table.workspaceId),
  index("idx_api_keys_key").on(table.key),
]);

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  workspaceId: true,
  name: true,
});

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

// Analytics Events table - the core tracking data
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").notNull(),
  eventName: text("event_name").notNull(),
  eventType: text("event_type").notNull(), // page_view, click, form_submit, api_call, error, custom
  userId: text("user_id"),
  sessionId: varchar("session_id"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  properties: jsonb("properties").$type<Record<string, unknown>>().default({}),
  source: text("source"), // which SFS app sent this event
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  url: text("url"),
  referrer: text("referrer"),
  country: text("country"),
  city: text("city"),
  device: text("device"),
  browser: text("browser"),
  os: text("os"),
}, (table) => [
  index("idx_events_workspace").on(table.workspaceId),
  index("idx_events_name").on(table.eventName),
  index("idx_events_type").on(table.eventType),
  index("idx_events_user").on(table.userId),
  index("idx_events_session").on(table.sessionId),
  index("idx_events_timestamp").on(table.timestamp),
  index("idx_events_source").on(table.source),
  index("idx_events_workspace_timestamp").on(table.workspaceId, table.timestamp),
  index("idx_events_workspace_name").on(table.workspaceId, table.eventName),
]);

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  timestamp: true,
});

export const batchInsertEventSchema = z.object({
  events: z.array(insertEventSchema).min(1).max(1000),
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Reports table
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull().default("on-demand"), // on-demand, scheduled, real-time
  schedule: text("schedule"), // cron expression for scheduled reports
  config: jsonb("config").$type<Record<string, unknown>>().default({}),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_reports_workspace").on(table.workspaceId),
  index("idx_reports_created_by").on(table.createdBy),
]);

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// Funnels table - for conversion tracking
export const funnels = pgTable("funnels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  steps: jsonb("steps").$type<Array<{ eventName: string; order: number }>>().notNull(),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_funnels_workspace").on(table.workspaceId),
]);

export const insertFunnelSchema = createInsertSchema(funnels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFunnel = z.infer<typeof insertFunnelSchema>;
export type Funnel = typeof funnels.$inferSelect;

// Alerts table - for anomaly detection and notifications
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  condition: jsonb("condition").$type<Record<string, unknown>>().notNull(),
  channels: jsonb("channels").$type<Array<{ type: string; config: Record<string, unknown> }>>().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_alerts_workspace").on(table.workspaceId),
  index("idx_alerts_active").on(table.isActive),
]);

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

// Dashboards table - for custom dashboard builder
export const dashboards = pgTable("dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  layout: jsonb("layout").$type<Array<Record<string, unknown>>>().default([]),
  isDefault: boolean("is_default").notNull().default(false),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_dashboards_workspace").on(table.workspaceId),
  index("idx_dashboards_created_by").on(table.createdBy),
]);

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type Dashboard = typeof dashboards.$inferSelect;

// Analytics Query Schema
export const analyticsQuerySchema = z.object({
  eventName: z.string().optional(),
  eventType: z.string().optional(),
  source: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof loginSchema>;
