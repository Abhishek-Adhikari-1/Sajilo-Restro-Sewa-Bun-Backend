import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { categories } from "./category.schema";
import { images } from "./image.schema";
import { relations } from "drizzle-orm";
import { orderItems } from "./order_item.schema";

export const menus = pgTable("menus", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(), // Store in exact amount (floats supported)
  estimatedPreparationTime: integer("estimated_preparation_time"), // minutes
  imageId: uuid("image_id").references(() => images.id, {
    onDelete: "set null",
  }),
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

export const menusRelations = relations(menus, ({ many }) => ({
  orderItems: many(orderItems),
}));

export type Menu = typeof menus.$inferSelect;
export type NewMenu = typeof menus.$inferInsert;
