import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { mealLogs, profiles } from "@/lib/db/schema";

import { getProfileByUserId } from "../data/profile";

/** Attach anonymous browser profile (session cookie) to a Google account on first sign-in. */
export async function linkAnonymousProfileToUser(
  sessionId: string,
  userId: string,
) {
  const [anonProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.sessionId, sessionId))
    .limit(1);

  if (!anonProfile) return;

  const existing = await getProfileByUserId(userId);

  if (existing) {
    if (existing.id === anonProfile.id) return;

    await db
      .update(mealLogs)
      .set({ profileId: existing.id })
      .where(eq(mealLogs.profileId, anonProfile.id));

    await db.delete(profiles).where(eq(profiles.id, anonProfile.id));

    revalidatePath("/");
    revalidatePath("/settings");
    revalidatePath("/history");
    return;
  }

  await db
    .update(profiles)
    .set({ userId, updatedAt: new Date() })
    .where(eq(profiles.id, anonProfile.id));

  revalidatePath("/");
  revalidatePath("/settings");
  revalidatePath("/history");
}
