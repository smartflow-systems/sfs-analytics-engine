import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventName: text("event_name").notNull(),
  userId: text("user_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  properties: jsonb("properties").$type<Record<string, unknown>>().default({}),
}, (table) => [
  index("idx_events_name").on(table.eventName),
  index("idx_events_user").on(table.userId),
  index("idx_events_timestamp").on(table.timestamp),
  index("idx_events_name_timestamp").on(table.eventName, table.timestamp),
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

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull().default("on-demand"),
  config: jsonb("config").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

export const analyticsQuerySchema = z.object({
  eventName: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
