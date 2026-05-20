import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { mealLogs, profiles } from "@/lib/db/schema";
import { buildDailyQuota } from "@/lib/nutrition/quota";
import type { DailyQuota, MacroTargets } from "@/lib/nutrition/types";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

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
        gte(mealLogs.loggedAt, startOfToday()),
      ),
    )
    .orderBy(sql`${mealLogs.loggedAt} desc`);
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
