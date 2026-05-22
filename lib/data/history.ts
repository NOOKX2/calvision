import { and, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { mealLogs } from "@/lib/db/schema";
import {
  formatTrackingDayKey,
  getRecentTrackingDayKeys,
  getTrackingDayBounds,
  getTrackingDayKey,
  getTrackingDayStart,
  parseTrackingDayKey,
} from "@/lib/nutrition/day-boundary";
import { quotaPercent } from "@/lib/nutrition/quota";
import type { MacroTargets } from "@/lib/nutrition/types";

import { getProfileBySession, profileToTargets } from "./profile";
import type { Profile } from "@/lib/db/schema";

const HISTORY_DAYS = 30;

export type DailySummary = {
  dayKey: string;
  label: string;
  isToday: boolean;
  mealCount: number;
  consumed: {
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  targetKcal: number;
  percent: number;
  diffKcal: number;
};

function formatDayLabel(dayKey: string, isToday: boolean) {
  if (isToday) return "วันนี้";

  return parseTrackingDayKey(dayKey).toLocaleDateString("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const emptyConsumed = () => ({
  kcal: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
});

export async function getDailySummaries(
  profileId: string,
  targets: MacroTargets,
): Promise<DailySummary[]> {
  const todayKey = getTrackingDayKey(new Date());
  const dayKeys = getRecentTrackingDayKeys(HISTORY_DAYS);
  const oldestKey = dayKeys[dayKeys.length - 1];
  const rangeStart = parseTrackingDayKey(oldestKey);

  const meals = await db
    .select()
    .from(mealLogs)
    .where(
      and(
        eq(mealLogs.profileId, profileId),
        gte(mealLogs.loggedAt, rangeStart),
      ),
    )
    .orderBy(sql`${mealLogs.loggedAt} desc`);

  const byDay = new Map<
    string,
    { mealCount: number; consumed: ReturnType<typeof emptyConsumed> }
  >();

  for (const meal of meals) {
    const key = getTrackingDayKey(meal.loggedAt);
    const bucket = byDay.get(key) ?? {
      mealCount: 0,
      consumed: emptyConsumed(),
    };

    bucket.mealCount += 1;
    bucket.consumed.kcal += meal.kcal;
    bucket.consumed.proteinG += meal.proteinG;
    bucket.consumed.carbsG += meal.carbsG;
    bucket.consumed.fatG += meal.fatG;
    byDay.set(key, bucket);
  }

  return dayKeys.map((dayKey) => {
    const bucket = byDay.get(dayKey) ?? {
      mealCount: 0,
      consumed: emptyConsumed(),
    };
    const isToday = dayKey === todayKey;

    return {
      dayKey,
      label: formatDayLabel(dayKey, isToday),
      isToday,
      mealCount: bucket.mealCount,
      consumed: bucket.consumed,
      targetKcal: targets.targetKcal,
      percent: quotaPercent(bucket.consumed.kcal, targets.targetKcal),
      diffKcal: bucket.consumed.kcal - targets.targetKcal,
    };
  });
}

export async function getMealsForTrackingDay(
  profileId: string,
  dayKey: string,
) {
  const { start, end } = getTrackingDayBounds(dayKey);

  return db
    .select()
    .from(mealLogs)
    .where(
      and(
        eq(mealLogs.profileId, profileId),
        gte(mealLogs.loggedAt, start),
        lt(mealLogs.loggedAt, end),
      ),
    )
    .orderBy(sql`${mealLogs.loggedAt} desc`);
}

export type HistoryPageData = {
  profile: Profile;
  summaries: DailySummary[];
  selectedDay: string;
  selectedLabel: string;
  selectedMeals: Awaited<ReturnType<typeof getMealsForTrackingDay>>;
  targets: MacroTargets;
};

export async function getHistoryPageData(
  sessionId: string,
  selectedDay?: string | null,
): Promise<HistoryPageData | null> {
  const profile = await getProfileBySession(sessionId);
  if (!profile) return null;

  const targets = profileToTargets(profile);
  const summaries = await getDailySummaries(profile.id, targets);
  const todayKey = formatTrackingDayKey(getTrackingDayStart());
  const validKeys = new Set(summaries.map((s) => s.dayKey));

  const day =
    selectedDay && validKeys.has(selectedDay)
      ? selectedDay
      : (summaries.find((s) => s.mealCount > 0)?.dayKey ?? todayKey);

  const selectedSummary = summaries.find((s) => s.dayKey === day);
  const selectedMeals = await getMealsForTrackingDay(profile.id, day);

  return {
    profile,
    summaries,
    selectedDay: day,
    selectedLabel: selectedSummary?.label ?? formatDayLabel(day, day === todayKey),
    selectedMeals,
    targets,
  };
}
