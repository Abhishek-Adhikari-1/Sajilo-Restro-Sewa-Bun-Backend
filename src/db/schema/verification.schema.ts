import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const verificationTypeEnum = pgEnum("verification_type", [
  "email_verification",
  "password_reset",
  "forgot_password",
  "oauth_callback",
]);

/**
 * Polymorphic one-time token store.
 *
 * identifier — scopes the token:
 *   "email:<email>"     → email verification / password reset
 *   "user_id:<uuid>"    → user-scoped actions
 *   "oauth:<state>"     → OAuth PKCE state
 *
 * token      — SHA-256 hex hash of the raw token sent to the user.
 *              The raw token travels only via the email link, never stored plain.
 *
 * metadata   — optional JSONB for extra context (e.g. redirect_uri, userId)
 */
export const verifications = pgTable(
  "verifications",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    identifier: text("identifier").notNull(),
    type: verificationTypeEnum("type").notNull(),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Fast lookup by identifier + type (used to invalidate old tokens)
    index("verifications_identifier_type_idx").on(table.identifier, table.type),
    // Fast lookup by hashed token on verify
    index("verifications_token_idx").on(table.token),
  ],
);

// ─── Types ────────────────────────────────────────────────────────────────────
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;
export type VerificationType = (typeof verificationTypeEnum.enumValues)[number];
