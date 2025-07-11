import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("user"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  size: text("size").notNull(),
  status: text("status").notNull().default("suspended"),
  creditsPerHour: decimal("credits_per_hour", { precision: 10, scale: 3 }).notNull(),
  nodes: integer("nodes").notNull(),
  autoSuspend: boolean("auto_suspend").notNull().default(true),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dataSources = pgTable("data_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // csv, excel, json, parquet, database
  fileName: text("file_name"),
  filePath: text("file_path"),
  schema: jsonb("schema"), // Column definitions and types
  rowCount: integer("row_count").default(0),
  status: text("status").notNull().default("processing"), // processing, ready, error
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const queryHistory = pgTable("query_history", {
  id: serial("id").primaryKey(),
  sqlQuery: text("sql_query").notNull(),
  status: text("status").notNull(), // running, completed, error
  duration: integer("duration"), // milliseconds
  rowsReturned: integer("rows_returned"),
  creditsUsed: decimal("credits_used", { precision: 10, scale: 6 }),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  userId: integer("user_id").references(() => users.id),
  executedAt: timestamp("executed_at").defaultNow(),
});

export const charts = pgTable("charts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // bar, line, pie, scatter, heatmap, treemap
  configuration: jsonb("configuration").notNull(), // Chart config including axes, colors, etc.
  dataSourceId: integer("data_source_id").references(() => dataSources.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dashboards = pgTable("dashboards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  layout: jsonb("layout").notNull(), // Dashboard layout configuration
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  messages: jsonb("messages").notNull(), // Array of conversation messages
  context: jsonb("context"), // Current data context for AI
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Private Equity Specific Tables
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sector: text("sector").notNull(),
  region: text("region").notNull(),
  foundedDate: timestamp("founded_date"),
  employees: integer("employees"),
  revenue: decimal("revenue", { precision: 15, scale: 2 }),
  ebitda: decimal("ebitda", { precision: 15, scale: 2 }),
  netIncome: decimal("net_income", { precision: 15, scale: 2 }),
  totalAssets: decimal("total_assets", { precision: 15, scale: 2 }),
  totalDebt: decimal("total_debt", { precision: 15, scale: 2 }),
  equity: decimal("equity", { precision: 15, scale: 2 }),
  marketCap: decimal("market_cap", { precision: 15, scale: 2 }),
  description: text("description"),
  stage: text("stage"), // seed, series_a, series_b, growth, mature
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  passwordHash: true,
});

export const insertWarehouseSchema = createInsertSchema(warehouses).omit({
  id: true,
  createdAt: true,
});

export const insertDataSourceSchema = createInsertSchema(dataSources).omit({
  id: true,
  createdAt: true,
});

export const insertQueryHistorySchema = createInsertSchema(queryHistory).omit({
  id: true,
  executedAt: true,
});

export const insertChartSchema = createInsertSchema(charts).omit({
  id: true,
  createdAt: true,
});

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
});

export const insertAIConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type DataSource = typeof dataSources.$inferSelect;
export type InsertDataSource = z.infer<typeof insertDataSourceSchema>;
export type QueryHistory = typeof queryHistory.$inferSelect;
export type InsertQueryHistory = z.infer<typeof insertQueryHistorySchema>;
export type Chart = typeof charts.$inferSelect;
export type InsertChart = z.infer<typeof insertChartSchema>;
export type Dashboard = typeof dashboards.$inferSelect;
export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type AIConversation = typeof aiConversations.$inferSelect;
export type InsertAIConversation = z.infer<typeof insertAIConversationSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
