import { pgTable, uuid, integer } from "drizzle-orm/pg-core";

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey(),
  amount: integer("amount").notNull(),
});
