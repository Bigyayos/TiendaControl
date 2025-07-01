import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  manager: varchar("manager", { length: 255 }).notNull(),
  employees: integer("employees").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  monthlyObjective: decimal("monthly_objective", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: varchar("role", { length: 50 }).notNull(), // 'manager' or 'vendedor'
  storeId: integer("store_id").references(() => stores.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull().references(() => stores.id),
  employeeId: integer("employee_id").references(() => employees.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const objectives = pgTable("objectives", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull().references(() => stores.id),
  period: varchar("period", { length: 50 }).notNull(), // 'diario', 'semanal', 'mensual'
  target: decimal("target", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertStoreSchema = createInsertSchema(stores).pick({
  name: true,
  address: true,
  manager: true,
  employees: true,
  isActive: true,
  monthlyObjective: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).pick({
  name: true,
  email: true,
  role: true,
  storeId: true,
  isActive: true,
});

export const insertSaleSchema = createInsertSchema(sales).pick({
  storeId: true,
  employeeId: true,
  amount: true,
  date: true,
});

export const insertObjectiveSchema = createInsertSchema(objectives).pick({
  storeId: true,
  period: true,
  target: true,
  startDate: true,
  endDate: true,
});

// Custom schema for objective updates that handles dates as strings
export const updateObjectiveSchema = z.object({
  storeId: z.number().optional(),
  period: z.string().optional(),
  target: z.string().optional(),
  startDate: z.union([z.string(), z.date()]).optional().transform((val) => {
    if (typeof val === 'string') return new Date(val);
    return val;
  }),
  endDate: z.union([z.string(), z.date()]).optional().transform((val) => {
    if (typeof val === 'string') return new Date(val);
    return val;
  }),
});

// Types
export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type Objective = typeof objectives.$inferSelect;
export type InsertObjective = z.infer<typeof insertObjectiveSchema>;

export type UpdateObjective = z.infer<typeof updateObjectiveSchema>;
