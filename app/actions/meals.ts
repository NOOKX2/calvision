"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { mealLogs } from "@/lib/db/schema";
import { analyzeFoodImage } from "@/lib/dify/client";
import { getProfileBySession } from "@/lib/data/profile";
import { getOrCreateSessionId } from "@/lib/session";

export type MealActionState = {
  ok: boolean;
  message?: string;
  nutrition?: {
    foodName: string;
    proteinG: number;
    carbsG: number;
    fatG: number;
    kcal: number;
  };
};

export async function analyzeAndLogMeal(
  _prev: MealActionState,
  formData: FormData,
): Promise<MealActionState> {
  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "กรุณาเลือกรูปภาพอาหาร" };
  }

  const sessionId = await getOrCreateSessionId();
  const profile = await getProfileBySession(sessionId);

  if (!profile) {
    return {
      ok: false,
      message: "กรุณาตั้งค่า TDEE และเป้าหมายก่อนวิเคราะห์อาหาร",
    };
  }

  try {
    const nutrition = await analyzeFoodImage(file, sessionId);

    await db.insert(mealLogs).values({
      profileId: profile.id,
      foodName: nutrition.foodName,
      proteinG: nutrition.proteinG,
      carbsG: nutrition.carbsG,
      fatG: nutrition.fatG,
      kcal: nutrition.kcal,
    });

    revalidatePath("/");
    return {
      ok: true,
      message: "บันทึกมื้ออาหารแล้ว",
      nutrition,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถวิเคราะห์รูปภาพได้";
    return { ok: false, message };
  }
}
