import {
  pgTable,
  integer,
  text,
  timestamp,
  uuid,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";
import { customers } from "./customer.schema";
import { relations } from "drizzle-orm";
import { orders } from "./order.schema";

export const tableStatusEnum = pgEnum("table_status", [
  "available",
  "occupied",
  "reserved",
  "cleaning",
  "unavailable",
]);

export const tables = pgTable("tables", {
  id: uuid("id").primaryKey().defaultRandom(),
  tableNumber: integer("table_number").notNull(),
  section: text("section").notNull(), // e.g., "Indoor", "Outdoor"
  capacity: integer("capacity").notNull(),
  occupiedSeats: integer("occupied_seats").notNull().default(0),
  status: tableStatusEnum("status").notNull().default("available"),
  activeOrders: varchar("active_orders", { length: 8 }).array().notNull().default([]),
  reservedFor: uuid("reserved_for").references(() => customers.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Table = typeof tables.$inferSelect;
export type NewTable = typeof tables.$inferInsert;

export const tablesRelations = relations(tables, ({ many }) => ({
  orders: many(orders),
}));
