import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { mealLogs } from "@/lib/db/schema";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isPublicImageUrl } from "@/lib/meals/r2-config";
import {
  contentTypeForPath,
  readMealImage,
} from "@/lib/meals/images";

type RouteContext = {
  params: Promise<{ mealId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mealId } = await context.params;
  const [meal] = await db
    .select()
    .from(mealLogs)
    .where(eq(mealLogs.id, mealId))
    .limit(1);

  if (!meal || meal.profileId !== profile.id || !meal.imagePath) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (isPublicImageUrl(meal.imagePath)) {
    return NextResponse.redirect(meal.imagePath);
  }

  try {
    const buffer = await readMealImage(meal.imagePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentTypeForPath(meal.imagePath),
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
