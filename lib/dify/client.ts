import { z } from "zod";

import type { FoodNutrition } from "@/lib/nutrition/types";

const nutritionSchema = z
  .object({
    food_name: z.coerce.string().optional(),
    foodName: z.coerce.string().optional(),
    name: z.coerce.string().optional(),
    dish: z.coerce.string().optional(),
    title: z.coerce.string().optional(),
    protein_g: z.coerce.number().optional(),
    proteinG: z.coerce.number().optional(),
    protein: z.coerce.number().optional(),
    carbs_g: z.coerce.number().optional(),
    carbsG: z.coerce.number().optional(),
    carbohydrate: z.coerce.number().optional(),
    carbohydrates: z.coerce.number().optional(),
    carbs: z.coerce.number().optional(),
    fat_g: z.coerce.number().optional(),
    fatG: z.coerce.number().optional(),
    fat: z.coerce.number().optional(),
    sodium_mg: z.coerce.number().optional(),
    sodiumMg: z.coerce.number().optional(),
    sodium: z.coerce.number().optional(),
    kcal: z.coerce.number().optional(),
    calories: z.coerce.number().optional(),
    calorie: z.coerce.number().optional(),
    energy: z.coerce.number().optional(),
    result: z.unknown().optional(),
    output: z.unknown().optional(),
    text: z.unknown().optional(),
    answer: z.unknown().optional(),
  })
  .passthrough();

const THAI_KEY_MAP: Record<string, string> = {
  ชื่ออาหาร: "food_name",
  อาหาร: "food_name",
  โปรตีน: "protein_g",
  คาร์บ: "carbs_g",
  คาร์โบไฮเดรต: "carbs_g",
  ไขมัน: "fat_g",
  โซเดียม: "sodium_mg",
  แคลอรี่: "kcal",
  พลังงาน: "kcal",
};

const WORKFLOW_TIMEOUT_MS = 120_000;

function formatDifyError(detail: string, status?: number) {
  const trimmed = detail.trim();

  if (/<!DOCTYPE html/i.test(trimmed) || /<html/i.test(trimmed)) {
    if (/504|gateway time-out/i.test(trimmed)) {
      return "Dify ใช้เวลานานเกินไป (504 Gateway Timeout) — ลองใหม่อีกครั้ง หรือใช้รูปที่เล็กลง / เปลี่ยนโมเดลให้เร็วขึ้นใน workflow";
    }
    if (/502|503/i.test(trimmed)) {
      return "เซิร์ฟเวอร์ Dify ไม่พร้อมชั่วคราว — ลองใหม่อีกครั้งในอีกสักครู่";
    }
    return "Dify ตอบกลับผิดปกติ — ลองใหม่อีกครั้ง";
  }

  if (status === 504) {
    return "Dify ใช้เวลานานเกินไป (504) — ลองใหม่อีกครั้ง";
  }

  try {
    const parsed = JSON.parse(trimmed) as {
      code?: string;
      message?: string;
    };
    if (parsed.code === "not_chat_app") {
      return "Dify app เป็น Workflow แต่ระบบเรียก Chat API — ตั้ง DIFY_APP_MODE=workflow ใน .env (หรือใช้ Chat App + DIFY_APP_MODE=chat)";
    }
    if (parsed.code === "not_workflow_app") {
      return "Dify app เป็น Chat แต่ระบบเรียก Workflow API — ตั้ง DIFY_APP_MODE=chat ใน .env";
    }
    if (parsed.message) {
      return parsed.message;
    }
  } catch {
    // not JSON
  }

  const oneLine = trimmed.replace(/\s+/g, " ").slice(0, 280);
  return oneLine || "Dify วิเคราะห์ไม่สำเร็จ";
}

function getDifyConfig() {
  const apiKey = process.env.DIFY_API_KEY;
  const baseUrl = (process.env.DIFY_API_URL ?? "https://api.dify.ai").replace(
    /\/$/,
    "",
  );
  const mode = process.env.DIFY_APP_MODE ?? "workflow";

  if (!apiKey) {
    throw new Error("DIFY_API_KEY is not set");
  }

  return { apiKey, baseUrl, mode };
}

function normalizeKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeKeys);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;
  const normalized: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(record)) {
    const mapped = THAI_KEY_MAP[key] ?? key;
    normalized[mapped] = normalizeKeys(val);
  }

  return normalized;
}

function extractJsonBlock(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const objectMatch = text.match(/\{[\s\S]*\}/);
  return objectMatch?.[0] ?? text;
}

function tryParseJson(text: string): unknown | null {
  try {
    return JSON.parse(extractJsonBlock(text)) as unknown;
  } catch {
    return null;
  }
}

function hasNutritionSignals(value: Record<string, unknown>) {
  const keys = Object.keys(value).join(" ").toLowerCase();
  return /protein|carb|fat|kcal|calorie|sodium|โซเดียม|โปรตีน|คาร์บ|ไขมัน|แคลอรี่/.test(
    keys,
  );
}

function deepFindNutritionPayload(
  value: unknown,
  depth = 0,
): Record<string, unknown> | null {
  if (depth > 10 || value == null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parsed = tryParseJson(trimmed);
    if (parsed) {
      return deepFindNutritionPayload(parsed, depth + 1);
    }

    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = deepFindNutritionPayload(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  if (typeof value === "object") {
    const record = normalizeKeys(value) as Record<string, unknown>;

    if (hasNutritionSignals(record)) {
      return record;
    }

    for (const nested of Object.values(record)) {
      const found = deepFindNutritionPayload(nested, depth + 1);
      if (found) return found;
    }
  }

  return null;
}

function parseMacro(value: unknown): number {
  if (value == null || value === "") return 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number.parseFloat(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function parseNutritionPayload(raw: unknown): FoodNutrition {
  const normalized = normalizeKeys(raw);
  const candidate =
    typeof normalized === "object" && normalized !== null
      ? deepFindNutritionPayload(normalized) ??
        (hasNutritionSignals(normalized as Record<string, unknown>)
          ? (normalized as Record<string, unknown>)
          : null)
      : null;

  if (!candidate) {
    throw new Error("ไม่พบข้อมูลโภชนาการใน response จาก Dify");
  }

  const parsed = nutritionSchema.parse(candidate);
  const c = candidate as Record<string, unknown>;

  const proteinG =
    parseMacro(c.protein_g) ||
    parseMacro(parsed.protein_g) ||
    parseMacro(parsed.proteinG) ||
    parseMacro(parsed.protein);
  const carbsG =
    parseMacro(c.carbs_g) ||
    parseMacro(parsed.carbs_g) ||
    parseMacro(parsed.carbsG) ||
    parseMacro(parsed.carbs) ||
    parseMacro(parsed.carbohydrate) ||
    parseMacro(parsed.carbohydrates);
  const fatG =
    parseMacro(c.fat_g) ||
    parseMacro(parsed.fat_g) ||
    parseMacro(parsed.fatG) ||
    parseMacro(parsed.fat);
  const sodiumMg =
    parseMacro(c["sodium_mg"]) ||
    parseMacro(c["sodiumMg"]) ||
    parseMacro(c["sodium"]) ||
    parseMacro(parsed["sodium_mg"]) ||
    parseMacro(parsed["sodiumMg"]) ||
    parseMacro(parsed["sodium"]);
  const kcal = Math.round(
    parseMacro(c.kcal) ||
      parseMacro(parsed.kcal) ||
      parseMacro(parsed.calories) ||
      parseMacro(parsed.calorie) ||
      parseMacro(parsed.energy),
  );
  const foodName =
    String(
      c.food_name ??
        parsed.food_name ??
        parsed.foodName ??
        parsed.name ??
        parsed.dish ??
        "",
    ).trim() || "อาหารที่วิเคราะห์แล้ว";

  if (proteinG === 0 && carbsG === 0 && fatG === 0 && sodiumMg === 0 && kcal === 0) {
    const rawPreview = JSON.stringify(candidate).slice(0, 280);
    throw new Error(
      `Dify ส่ง JSON ถูกรูปแบบแล้ว แต่ตัวเลขเป็น 0 ทั้งหมด (มักเพราะ LLM มองรูปไม่เห็น หรือ copy ตัวอย่างใน prompt) | ค่าที่ได้: ${rawPreview}`,
    );
  }

  return {
    foodName,
    proteinG,
    carbsG,
    fatG,
    sodiumMg,
    kcal,
  };
}

async function uploadImage(file: File, user: string) {
  const { apiKey, baseUrl } = getDifyConfig();
  const body = new FormData();
  body.append("file", file);
  body.append("user", user);

  const response = await fetch(`${baseUrl}/v1/files/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `อัปโหลดรูปไป Dify ไม่สำเร็จ: ${formatDifyError(detail, response.status)}`,
    );
  }

  const json = (await response.json()) as { id: string };
  return json.id;
}

function logDifyResponse(json: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.log("[dify] raw response:", JSON.stringify(json, null, 2));
  }
}

export async function analyzeFoodImage(
  file: File,
  user: string,
  prompt?: string,
): Promise<FoodNutrition> {
  const { apiKey, baseUrl, mode } = getDifyConfig();
  const uploadFileId = await uploadImage(file, user);

  const filePayload = {
    type: "image",
    transfer_method: "local_file",
    upload_file_id: uploadFileId,
  };

  const cleanPrompt = prompt?.trim();
  const queryBase =
    "Analyze this food image. Respond with JSON only, realistic estimated numbers from the photo (not zeros). Keys: food_name, protein_g, carbs_g, fat_g, sodium_mg, kcal.";

  const shouldUseChat = mode === "chat";
  const endpoint = shouldUseChat
    ? `${baseUrl}/v1/chat-messages`
    : `${baseUrl}/v1/workflows/run`;

  const body = shouldUseChat
    ? {
        inputs: {},
        query: cleanPrompt
          ? `${queryBase}\nAdditional instruction: ${cleanPrompt}`
          : queryBase,
        response_mode: "blocking",
        user,
        files: [filePayload],
      }
    : {
        inputs: {
          // Dify workflow "File list" / multi-file inputs expect an array of file refs
          image: [filePayload],
          food_image: [filePayload],
        },
        response_mode: "blocking",
        user,
      };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WORKFLOW_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "Dify ใช้เวลานานเกิน 2 นาที — ลองใหม่ หรือลดขนาดรูป / ใช้โมเดลที่เร็วกว่าใน workflow",
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(formatDifyError(detail, response.status));
  }

  const json = (await response.json()) as Record<string, unknown>;
  logDifyResponse(json);

  const found = deepFindNutritionPayload(json);
  if (!found) {
    throw new Error(
      `อ่านผลจาก Dify ไม่ได้ — ตรวจสอบว่า workflow ส่ง JSON โภชนาการใน outputs (keys ที่ได้: ${listTopLevelKeys(json)})`,
    );
  }

  return parseNutritionPayload(found);
}

export async function analyzeFoodPrompt(
  prompt: string,
  user: string,
): Promise<FoodNutrition> {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) {
    throw new Error("prompt is empty");
  }

  const { apiKey, baseUrl, mode } = getDifyConfig();
  const shouldUseChat = mode === "chat";
  const endpoint = shouldUseChat
    ? `${baseUrl}/v1/chat-messages`
    : `${baseUrl}/v1/workflows/run`;

  const instruction =
    "Using the following food description, estimate realistic estimated numbers for macros, sodium, and kcal. Respond with JSON only (not zeros). Keys: food_name, protein_g, carbs_g, fat_g, sodium_mg, kcal.\n" +
    `Description: ${cleanPrompt}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WORKFLOW_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        shouldUseChat
          ? {
              inputs: {},
              query: instruction,
              response_mode: "blocking",
              user,
            }
          : {
              inputs: {
                query: instruction,
                prompt: cleanPrompt,
              },
              response_mode: "blocking",
              user,
            },
      ),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "Dify ใช้เวลานานเกินไป (timeout) — ลองใหม่ หรือทำ prompt ให้สั้นลง",
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(formatDifyError(detail, response.status));
  }

  const json = (await response.json()) as Record<string, unknown>;
  logDifyResponse(json);

  const found = deepFindNutritionPayload(json);
  if (!found) {
    throw new Error(
      `อ่านผลจาก Dify ไม่ได้ — ตรวจสอบว่า response ส่ง JSON โภชนาการใน outputs (keys ที่ได้: ${listTopLevelKeys(json)})`,
    );
  }

  return parseNutritionPayload(found);
}

function listTopLevelKeys(json: Record<string, unknown>) {
  const data = json.data;
  const outputKeys =
    data &&
    typeof data === "object" &&
    data !== null &&
    "outputs" in data &&
    typeof (data as { outputs?: unknown }).outputs === "object" &&
    (data as { outputs: object }).outputs !== null
      ? Object.keys((data as { outputs: Record<string, unknown> }).outputs)
      : [];

  return [
    ...Object.keys(json),
    ...(outputKeys.length ? [`outputs: ${outputKeys.join(", ")}`] : []),
  ].join(" | ");
}
