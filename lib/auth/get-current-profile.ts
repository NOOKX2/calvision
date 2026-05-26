import { auth } from "@/auth";
import { getProfileBySession, getProfileByUserId } from "@/lib/data/profile";
import { getSessionId } from "@/lib/session";

/** Resolve TDEE profile: logged-in Google user first, else anonymous session cookie. */
export async function getCurrentProfile() {
  const authSession = await auth();
  const userId = authSession?.user?.id;

  if (userId) {
    const profile = await getProfileByUserId(userId);
    if (profile) return profile;
  }

  const sessionId = await getSessionId();
  if (sessionId) {
    return getProfileBySession(sessionId);
  }

  return null;
}

export async function getCurrentUserId() {
  const authSession = await auth();
  return authSession?.user?.id ?? null;
}
