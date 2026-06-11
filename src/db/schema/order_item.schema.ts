import { pgTable, integer, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { orders } from "./order.schema";
import { menus } from "./menu.schema";

export const orderItemStatusEnum = pgEnum("order_item_status", [
  "pending",
  "preparing",
  "ready",
  "served",
  "cancelled",
]);

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  menuId: uuid("menu_id")
    .references(() => menus.id, { onDelete: "restrict" })
    .notNull(),
  quantity: integer("quantity").notNull(),
  priceAtTime: integer("price_at_time").notNull(), // snapshot of menu.price
  notes: text("notes"),
  status: orderItemStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
