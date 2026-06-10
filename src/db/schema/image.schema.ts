import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const images = pgTable("images", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  publicId: text("public_id").notNull().unique(),
  assetId: text("asset_id").notNull(),

  url: text("url").notNull(),
  secureUrl: text("secure_url").notNull(),

  format: text("format"), 
  resourceType: text("resource_type").default("image"),
  width: integer("width"),
  height: integer("height"),
  bytes: integer("bytes"),
  folder: text("folder"),

  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
