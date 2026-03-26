import { integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const bookingStatusEnum = pgEnum("booking_status", ["confirmed"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionStart: timestamp("session_start", { withTimezone: true }).notNull(),
    sessionEnd: timestamp("session_end", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    timezone: text("timezone").notNull(),
    status: bookingStatusEnum("status").default("confirmed").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueSessionStart: uniqueIndex("bookings_unique_session_start").on(table.sessionStart),
  }),
);

export type UserRecord = typeof users.$inferSelect;
export type BookingRecord = typeof bookings.$inferSelect;
