import {
  pgTable,
  integer,
  text,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { customers } from "./customer.schema";

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
