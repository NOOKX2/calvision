import { and, eq, gte, sql } from "drizzle-orm";

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

export function profileToTargets(profile: {
  tdee: number;
  targetKcal: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
}): MacroTargets {
  return {
    tdee: profile.tdee,
    targetKcal: profile.targetKcal,
    targetProteinG: profile.targetProteinG,
    targetCarbsG: profile.targetCarbsG,
    targetFatG: profile.targetFatG,
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

export async function getDailyQuotaForProfile(profileId: string, targets: MacroTargets) {
  const todayMeals = await getTodayMeals(profileId);

  const consumed = todayMeals.reduce(
    (acc, meal) => ({
      proteinG: acc.proteinG + meal.proteinG,
      carbsG: acc.carbsG + meal.carbsG,
      fatG: acc.fatG + meal.fatG,
      kcal: acc.kcal + meal.kcal,
    }),
    { proteinG: 0, carbsG: 0, fatG: 0, kcal: 0 },
  );

  return {
    meals: todayMeals,
    quota: buildDailyQuota(targets, consumed),
  };
}

export type DashboardData = {
  profile: NonNullable<Awaited<ReturnType<typeof getProfileBySession>>>;
  quota: DailyQuota;
  meals: Awaited<ReturnType<typeof getTodayMeals>>;
};

export async function getDashboardData(
  sessionId: string,
): Promise<DashboardData | null> {
  const profile = await getProfileBySession(sessionId);
  if (!profile) return null;

  const targets = profileToTargets(profile);
  const { meals, quota } = await getDailyQuotaForProfile(profile.id, targets);

  return { profile, quota, meals };
}
