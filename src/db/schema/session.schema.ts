import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./user.schema";

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),

    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),

    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

// ─── Relations ────────────────────────────────────────────────────────────────
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
