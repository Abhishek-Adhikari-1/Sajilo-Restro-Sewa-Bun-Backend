import {
  pgTable,
  text,
  real,
  integer,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { orders } from "./order.schema";
import { customers } from "./customer.schema";
import { users } from "./user.schema";

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "card",
  "mobile_wallet",
  "other",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const discountTypeEnum = pgEnum("discount_type", [
  "percentage",
  "fixed",
]);
export const taxTypeEnum = pgEnum("tax_type", ["percentage", "fixed"]);

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "restrict" })
    .notNull(),
  customerId: uuid("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  subtotal: real("subtotal").notNull(), // sum of all order items
  totalAmount: real("amount").notNull(), // final amount paid
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  discountType: discountTypeEnum("discount_type"),
  discountValue: real("discount_value"),
  taxType: taxTypeEnum("tax_type"),
  taxValue: real("tax_value"),
  notes: text("notes"),
  createdBy: uuid("created_by")
    .references(() => users.id, { onDelete: "restrict" })
    .notNull(), // staff who processed the payment
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
