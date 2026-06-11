import { pgTable, text, integer, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { tables } from "./table.schema";
import { users } from "./user.schema";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "in_progress",
  "ready",
  "served",
  "completed",
  "cancelled",
]);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  tableId: uuid("table_id")
    .references(() => tables.id, { onDelete: "restrict" })
    .notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id, { onDelete: "restrict" })
    .notNull(),
  guestsCount: integer("guests_count").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
