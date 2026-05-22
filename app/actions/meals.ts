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
  updateMealForProfile,
} from "@/lib/data/profile";
import { deleteMealImage, saveMealImage } from "@/lib/meals/images";
import { loggedAtForTrackingDay } from "@/lib/nutrition/day-boundary";
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

export type UpdateMealState = {
  ok: boolean;
  message?: string;
};

export type AddManualMealState = {
  ok: boolean;
  message?: string;
};

function parseMacroField(value: FormDataEntryValue | null, label: string) {
  const n = Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${label} ต้องเป็นตัวเลข ≥ 0`);
  }
  return n;
}

function parseKcalField(value: FormDataEntryValue | null) {
  const n = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("แคลอรี่ ต้องเป็นจำนวนเต็ม ≥ 0");
  }
  return n;
}

function parseTrackingDay(formData: FormData) {
  const value = formData.get("trackingDay");
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  return null;
}

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

    const trackingDay = parseTrackingDay(formData);
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
      loggedAt: trackingDay
        ? loggedAtForTrackingDay(trackingDay)
        : undefined,
    });

    revalidatePath("/");
    revalidatePath("/history");
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

export async function addManualMeal(
  _prev: AddManualMealState,
  formData: FormData,
): Promise<AddManualMealState> {
  const trackingDay = formData.get("trackingDay");
  if (typeof trackingDay !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(trackingDay)) {
    return { ok: false, message: "วันที่ไม่ถูกต้อง" };
  }

  const sessionId = await getSessionId();
  if (!sessionId) {
    return { ok: false, message: "ไม่พบ session" };
  }

  const profile = await getProfileBySession(sessionId);
  if (!profile) {
    return { ok: false, message: "กรุณาตั้งค่าโปรไฟล์ก่อน" };
  }

  const foodName = String(formData.get("foodName") ?? "").trim();
  if (!foodName) {
    return { ok: false, message: "กรุณาระบุชื่ออาหาร" };
  }

  try {
    const proteinG = parseMacroField(formData.get("proteinG"), "โปรตีน");
    const carbsG = parseMacroField(formData.get("carbsG"), "คาร์บ");
    const fatG = parseMacroField(formData.get("fatG"), "ไขมัน");
    const kcal = parseKcalField(formData.get("kcal"));

    if (kcal === 0 && proteinG === 0 && carbsG === 0 && fatG === 0) {
      return { ok: false, message: "กรุณาระบุแคลอรี่หรือโมครองค์อย่างน้อยหนึ่งค่า" };
    }

    await db.insert(mealLogs).values({
      profileId: profile.id,
      foodName,
      proteinG,
      carbsG,
      fatG,
      kcal,
      loggedAt: loggedAtForTrackingDay(trackingDay),
    });

    revalidatePath("/");
    revalidatePath("/history");
    return { ok: true, message: "เพิ่มมื้ออาหารแล้ว" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถเพิ่มมื้อได้";
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
  revalidatePath("/history");
}

export async function updateMeal(
  _prev: UpdateMealState,
  formData: FormData,
): Promise<UpdateMealState> {
  const mealId = formData.get("mealId");
  if (typeof mealId !== "string" || !mealId) {
    return { ok: false, message: "ไม่พบรายการอาหาร" };
  }

  const sessionId = await getSessionId();
  if (!sessionId) {
    return { ok: false, message: "ไม่พบ session" };
  }

  const profile = await getProfileBySession(sessionId);
  if (!profile) {
    return { ok: false, message: "กรุณาตั้งค่าโปรไฟล์ก่อน" };
  }

  const foodName = String(formData.get("foodName") ?? "").trim();
  if (!foodName) {
    return { ok: false, message: "กรุณาระบุชื่ออาหาร" };
  }

  try {
    const proteinG = parseMacroField(formData.get("proteinG"), "โปรตีน");
    const carbsG = parseMacroField(formData.get("carbsG"), "คาร์บ");
    const fatG = parseMacroField(formData.get("fatG"), "ไขมัน");
    const kcal = parseKcalField(formData.get("kcal"));

    const updated = await updateMealForProfile(profile.id, mealId, {
      foodName,
      proteinG,
      carbsG,
      fatG,
      kcal,
    });

    if (!updated) {
      return { ok: false, message: "ไม่พบรายการอาหารนี้" };
    }

    revalidatePath("/");
    revalidatePath("/history");
    return { ok: true, message: "บันทึกการแก้ไขแล้ว" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถบันทึกได้";
    return { ok: false, message };
  }
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
    revalidatePath("/history");
    return { ok: true, message: "รีเซ็ตแคลอรี่และมื้ออาหารวันนี้แล้ว" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถรีเซ็ตได้";
    return { ok: false, message };
  }
}
