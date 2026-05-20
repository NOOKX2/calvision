import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session/constants";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    response.cookies.set(
      SESSION_COOKIE,
      crypto.randomUUID(),
      sessionCookieOptions,
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
