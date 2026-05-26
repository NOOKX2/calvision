import {
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { authUsers } from "./auth-schema";

export { authAccounts, authSessions, authUsers, authVerificationTokens } from "./auth-schema";

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  userId: text("user_id").unique().references(() => authUsers.id, {
    onDelete: "set null",
  }),
  sex: text("sex").notNull(),
  age: integer("age").notNull(),
  weightKg: real("weight_kg").notNull(),
  heightCm: real("height_cm").notNull(),
  activityLevel: text("activity_level").notNull(),
  goal: text("goal").notNull(),
  tdee: integer("tdee").notNull(),
  targetKcal: integer("target_kcal").notNull(),
  targetProteinG: real("target_protein_g").notNull(),
  targetCarbsG: real("target_carbs_g").notNull(),
  targetFatG: real("target_fat_g").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const mealLogs = pgTable("meal_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  foodName: text("food_name"),
  proteinG: real("protein_g").notNull(),
  carbsG: real("carbs_g").notNull(),
  fatG: real("fat_g").notNull(),
  sodiumMg: real("sodium_mg").notNull().default(0),
  kcal: integer("kcal").notNull(),
  imagePath: text("image_path"),
  loggedAt: timestamp("logged_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type MealLog = typeof mealLogs.$inferSelect;
