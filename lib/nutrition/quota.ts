import type { DailyQuota, MacroTargets } from "./types";

type Consumed = DailyQuota["consumed"];

export function buildDailyQuota(
  targets: MacroTargets,
  consumed: Consumed,
): DailyQuota {
  return {
    consumed,
    targets,
    remaining: {
      proteinG: Math.max(0, targets.targetProteinG - consumed.proteinG),
      carbsG: Math.max(0, targets.targetCarbsG - consumed.carbsG),
      fatG: Math.max(0, targets.targetFatG - consumed.fatG),
      sodiumMg: Math.max(0, targets.targetSodiumMg - consumed.sodiumMg),
      kcal: Math.max(0, targets.targetKcal - consumed.kcal),
    },
  };
}

export function quotaPercent(consumed: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((consumed / target) * 100));
}
