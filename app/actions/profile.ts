"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth/get-current-profile";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { getProfileBySession, getProfileByUserId } from "@/lib/data/profile";
import { calculateMacroTargets } from "@/lib/nutrition/tdee";
import type { ActivityLevel, Goal, Sex } from "@/lib/nutrition/types";
import { getOrCreateSessionId } from "@/lib/session";

const profileSchema = z.object({
  sex: z.enum(["male", "female"]),
  age: z.coerce.number().int().min(10).max(100),
  weightKg: z.coerce.number().positive().max(300),
  heightCm: z.coerce.number().positive().max(250),
  activityLevel: z.enum([
    "sedentary",
    "light",
    "moderate",
    "active",
    "very_active",
  ]),
  goal: z.enum(["bulk", "cut", "maintain"]),
});

export type ProfileActionState = {
  ok: boolean;
  message?: string;
};

export async function saveProfile(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = profileSchema.safeParse({
    sex: formData.get("sex"),
    age: formData.get("age"),
    weightKg: formData.get("weightKg"),
    heightCm: formData.get("heightCm"),
    activityLevel: formData.get("activityLevel"),
    goal: formData.get("goal"),
  });

  if (!parsed.success) {
    return { ok: false, message: "กรุณากรอกข้อมูลให้ครบและถูกต้อง" };
  }

  const input = parsed.data as {
    sex: Sex;
    age: number;
    weightKg: number;
    heightCm: number;
    activityLevel: ActivityLevel;
    goal: Goal;
  };

  const targets = calculateMacroTargets(input);
  const sessionId = await getOrCreateSessionId();
  const userId = await getCurrentUserId();

  const existing = userId
    ? await getProfileByUserId(userId)
    : await getProfileBySession(sessionId);

  const values = {
    sessionId,
    userId: userId ?? null,
    sex: input.sex,
    age: input.age,
    weightKg: input.weightKg,
    heightCm: input.heightCm,
    activityLevel: input.activityLevel,
    goal: input.goal,
    tdee: targets.tdee,
    targetKcal: targets.targetKcal,
    targetProteinG: targets.targetProteinG,
    targetCarbsG: targets.targetCarbsG,
    targetFatG: targets.targetFatG,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(profiles).set(values).where(eq(profiles.id, existing.id));
  } else {
    await db.insert(profiles).values(values);
  }

  revalidatePath("/");
  revalidatePath("/settings");
  return {
    ok: true,
    message: `TDEE ${targets.tdee} kcal · เป้าหมาย ${targets.targetKcal} kcal`,
  };
}
