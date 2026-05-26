import { and, eq, gte, sql } from "drizzle-orm";

import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { db } from "@/lib/db";
import { mealLogs, profiles } from "@/lib/db/schema";
import { getTrackingDayStart } from "@/lib/nutrition/day-boundary";
import { buildDailyQuota } from "@/lib/nutrition/quota";
import type { DailyQuota, MacroTargets } from "@/lib/nutrition/types";

export async function getProfileBySession(sessionId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.sessionId, sessionId))
    .limit(1);

  return profile ?? null;
}

export async function getProfileByUserId(userId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  return profile ?? null;
}

export function profileToTargets(profile: {
  tdee: number;
  targetKcal: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
}): MacroTargets {
  // Using a conservative daily target so sodium can participate in "quota today" UI.
  // If you later want it tied to a profile setting, we can move it into the DB/profile model.
  const targetSodiumMg = 2000;

  return {
    tdee: profile.tdee,
    targetKcal: profile.targetKcal,
    targetProteinG: profile.targetProteinG,
    targetCarbsG: profile.targetCarbsG,
    targetFatG: profile.targetFatG,
    targetSodiumMg,
  };
}

export async function getTodayMeals(profileId: string) {
  return db
    .select()
    .from(mealLogs)
    .where(
      and(
        eq(mealLogs.profileId, profileId),
        gte(mealLogs.loggedAt, getTrackingDayStart()),
      ),
    )
    .orderBy(sql`${mealLogs.loggedAt} desc`);
}

export async function deleteTodayMeals(profileId: string) {
  const todayRows = await db
    .select({ imagePath: mealLogs.imagePath })
    .from(mealLogs)
    .where(
      and(
        eq(mealLogs.profileId, profileId),
        gte(mealLogs.loggedAt, getTrackingDayStart()),
      ),
    );

  await db
    .delete(mealLogs)
    .where(
      and(
        eq(mealLogs.profileId, profileId),
        gte(mealLogs.loggedAt, getTrackingDayStart()),
      ),
    );

  return todayRows.map((row) => row.imagePath).filter(Boolean) as string[];
}

export async function deleteMealForProfile(profileId: string, mealId: string) {
  const result = await db
    .delete(mealLogs)
    .where(
      and(eq(mealLogs.id, mealId), eq(mealLogs.profileId, profileId)),
    )
    .returning({ id: mealLogs.id, imagePath: mealLogs.imagePath });

  return result[0] ?? null;
}

export async function updateMealForProfile(
  profileId: string,
  mealId: string,
  data: {
    foodName: string;
    proteinG: number;
    carbsG: number;
    fatG: number;
    sodiumMg: number;
    kcal: number;
  },
) {
  const result = await db
    .update(mealLogs)
    .set({
      foodName: data.foodName,
      proteinG: data.proteinG,
      carbsG: data.carbsG,
      fatG: data.fatG,
      sodiumMg: data.sodiumMg,
      kcal: data.kcal,
    })
    .where(
      and(eq(mealLogs.id, mealId), eq(mealLogs.profileId, profileId)),
    )
    .returning({ id: mealLogs.id });

  return result.length > 0;
}

export async function getDailyQuotaForProfile(profileId: string, targets: MacroTargets) {
  const todayMeals = await getTodayMeals(profileId);

  const consumed = todayMeals.reduce(
    (acc, meal) => ({
      proteinG: acc.proteinG + meal.proteinG,
      carbsG: acc.carbsG + meal.carbsG,
      fatG: acc.fatG + meal.fatG,
      sodiumMg: acc.sodiumMg + meal.sodiumMg,
      kcal: acc.kcal + meal.kcal,
    }),
    { proteinG: 0, carbsG: 0, fatG: 0, sodiumMg: 0, kcal: 0 },
  );

  return {
    meals: todayMeals,
    quota: buildDailyQuota(targets, consumed),
  };
}

export type DashboardData = {
  profile: NonNullable<Awaited<ReturnType<typeof getCurrentProfile>>>;
  quota: DailyQuota;
  meals: Awaited<ReturnType<typeof getTodayMeals>>;
};

export async function getDashboardData(): Promise<DashboardData | null> {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const targets = profileToTargets(profile);
  const { meals, quota } = await getDailyQuotaForProfile(profile.id, targets);

  return { profile, quota, meals };
}
