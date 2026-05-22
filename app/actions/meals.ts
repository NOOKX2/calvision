"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { mealLogs } from "@/lib/db/schema";
import { analyzeFoodImage } from "@/lib/dify/client";
import {
  deleteMealForProfile,
  deleteTodayMeals,
  getProfileBySession,
} from "@/lib/data/profile";
import { deleteMealImage, saveMealImage } from "@/lib/meals/images";
import { getOrCreateSessionId, getSessionId } from "@/lib/session";

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

export type ResetCaloriesState = {
  ok: boolean;
  message?: string;
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

    const mealId = randomUUID();
    const imagePath = await saveMealImage(mealId, file);

    await db.insert(mealLogs).values({
      id: mealId,
      profileId: profile.id,
      foodName: nutrition.foodName,
      proteinG: nutrition.proteinG,
      carbsG: nutrition.carbsG,
      fatG: nutrition.fatG,
      kcal: nutrition.kcal,
      imagePath,
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

export async function deleteMeal(mealId: string) {
  const sessionId = await getSessionId();
  if (!sessionId) {
    throw new Error("ไม่พบ session");
  }

  const profile = await getProfileBySession(sessionId);
  if (!profile) {
    throw new Error("กรุณาตั้งค่าโปรไฟล์ก่อน");
  }

  const deleted = await deleteMealForProfile(profile.id, mealId);
  if (!deleted) {
    throw new Error("ไม่พบรายการอาหารนี้");
  }

  await deleteMealImage(deleted.imagePath);
  revalidatePath("/");
}

export async function resetTodayCalories(
  _prev: ResetCaloriesState,
): Promise<ResetCaloriesState> {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return { ok: false, message: "ไม่พบ session" };
  }

  const profile = await getProfileBySession(sessionId);
  if (!profile) {
    return {
      ok: false,
      message: "กรุณาตั้งค่าโปรไฟล์ก่อน",
    };
  }

  try {
    const imagePaths = await deleteTodayMeals(profile.id);
    await Promise.all(imagePaths.map((p) => deleteMealImage(p)));
    revalidatePath("/");
    return { ok: true, message: "รีเซ็ตแคลอรี่และมื้ออาหารวันนี้แล้ว" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถรีเซ็ตได้";
    return { ok: false, message };
  }
}
