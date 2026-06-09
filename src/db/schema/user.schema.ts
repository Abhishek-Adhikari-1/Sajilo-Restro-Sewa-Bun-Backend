import { pgTable, uuid, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
});
