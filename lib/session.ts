import { cookies } from "next/headers";
import { randomUUID } from "crypto";

import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session/constants";

export { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session/constants";

/** Read session id only — safe in Server Components */
export async function getSessionId() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

/** Create session if missing — use only in Server Actions or Route Handlers */
export async function getOrCreateSessionId() {
  const existing = await getSessionId();
  if (existing) {
    return existing;
  }

  const sessionId = randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, sessionCookieOptions);

  return sessionId;
}
