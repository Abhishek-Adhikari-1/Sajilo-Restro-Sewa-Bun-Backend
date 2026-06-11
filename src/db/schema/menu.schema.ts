import { pgTable, text, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { categories } from "./category.schema";
import { images } from "./image.schema";

export const menus = pgTable("menus", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Store in cents/paisa
  estimatedPreparationTime: integer("estimated_preparation_time"), // minutes
  imageId: uuid("image_id").references(() => images.id, { onDelete: "set null" }),
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "restrict" })
    .notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Menu = typeof menus.$inferSelect;
export type NewMenu = typeof menus.$inferInsert;
