import { pgTable, text, timestamp, uuid, decimal } from "drizzle-orm/pg-core";
import { users } from "./user.schema";

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  notes: text("notes"),
  date: timestamp("date", { mode: "date", withTimezone: true }).notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
