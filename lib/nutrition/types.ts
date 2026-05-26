export type Sex = "male" | "female";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type Goal = "bulk" | "cut" | "maintain";

export type ProfileInput = {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: Goal;
};

export type MacroTargets = {
  tdee: number;
  targetKcal: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetSodiumMg: number;
};

export type FoodNutrition = {
  foodName: string;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sodiumMg: number;
  kcal: number;
};

export type DailyQuota = {
  consumed: {
    proteinG: number;
    carbsG: number;
    fatG: number;
    sodiumMg: number;
    kcal: number;
  };
  targets: MacroTargets;
  remaining: {
    proteinG: number;
    carbsG: number;
    fatG: number;
    sodiumMg: number;
    kcal: number;
  };
};
