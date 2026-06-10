import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./user.schema";
import { sessions } from "./session.schema";

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // For credential auth: accountId === userId, providerId === "credentials"
    // For OAuth:           accountId === provider's user ID, providerId === "google" etc.
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),

    // Credential auth
    password: text("password"),

    // OAuth tokens
    accessToken: text("access_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      mode: "date",
      withTimezone: true,
    }),
    refreshToken: text("refresh_token"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      mode: "date",
      withTimezone: true,
    }),
    scope: text("scope"),
    idToken: text("id_token"),

    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // One account per provider per user
    uniqueIndex("accounts_user_id_provider_id_idx").on(
      table.userId,
      table.providerId,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────
export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  sessions: many(sessions),
}));

// ─── Types ────────────────────────────────────────────────────────────────────
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
