import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { tables } from "./table.schema";
import { users } from "./user.schema";
import { relations } from "drizzle-orm";
import { orderItems } from "./order_item.schema";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "preparing",
  "ready",
  "served",
  "billing",
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

export const ordersRelations = relations(orders, ({ one, many }) => ({
  table: one(tables, {
    fields: [orders.tableId],
    references: [tables.id],
  }),

  createdByUser: one(users, {
    fields: [orders.createdBy],
    references: [users.id],
  }),

  items: many(orderItems),
}));
