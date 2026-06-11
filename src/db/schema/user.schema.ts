import {
  pgTable,
  uuid,
  text,
  pgEnum,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { images } from "./image.schema";
import { accounts } from "./account.schema";
import { sessions } from "./session.schema";

export const userStatusEnum = pgEnum("user_status", [
  "inactive",
  "active",
  "suspended",
  "disabled",
]);

export const userRoleEnum = pgEnum("user_roles", [
  "waiter",
  "cashier",
  "kitchen",
  "admin",
]);

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  status: userStatusEnum("status").notNull().default("inactive"),
  role: userRoleEnum("role").notNull().default("waiter"),

  // FK → images; nullable (user may not have an avatar)
  imageId: uuid("image_id").references(() => images.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ─── Relations ────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ one, many }) => ({
  avatar: one(images, {
    fields: [users.imageId],
    references: [images.id],
  }),
  accounts: many(accounts),
  sessions: many(sessions),
}));

// ─── Types ────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserStatus = (typeof userStatusEnum.enumValues)[number];
