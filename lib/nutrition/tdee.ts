import type { ActivityLevel, Goal, MacroTargets, ProfileInput, Sex } from "./types";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_KCAL_ADJUSTMENT: Record<Goal, number> = {
  bulk: 400,
  cut: -400,
  maintain: 0,
};

function calculateBmr(sex: Sex, weightKg: number, heightCm: number, age: number) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function calculateMacroTargets(input: ProfileInput): MacroTargets {
  const bmr = calculateBmr(input.sex, input.weightKg, input.heightCm, input.age);
  const tdee = Math.round(
    bmr * ACTIVITY_MULTIPLIERS[input.activityLevel],
  );
  const targetKcal = Math.max(1200, tdee + GOAL_KCAL_ADJUSTMENT[input.goal]);

  const targetProteinG = Math.round(input.weightKg * 2 * 10) / 10;
  const targetFatG =
    Math.round(((targetKcal * 0.28) / 9) * 10) / 10;
  const targetCarbsG = Math.max(
    0,
    Math.round(
      ((targetKcal - targetProteinG * 4 - targetFatG * 9) / 4) * 10,
    ) / 10,
  );

  return {
    tdee,
    targetKcal,
    targetProteinG,
    targetCarbsG,
    targetFatG,
  };
}

export function formatGoalLabel(goal: Goal) {
  const labels: Record<Goal, string> = {
    bulk: "Bulk (+400 kcal)",
    cut: "Cut (−400 kcal)",
    maintain: "Maintain",
  };
  return labels[goal];
}
