import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { getDb } from "@/lib/db";
import {
  authAccounts,
  authSessions,
  authUsers,
  authVerificationTokens,
} from "@/lib/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(getDb(), {
    usersTable: authUsers,
    accountsTable: authAccounts,
    sessionsTable: authSessions,
    verificationTokensTable: authVerificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.id) return;

      try {
        const { linkAnonymousProfileToUser } = await import(
          "@/lib/auth/link-profile"
        );
        const { getSessionId } = await import("@/lib/session");
        const sessionId = await getSessionId();

        if (sessionId) {
          await linkAnonymousProfileToUser(sessionId, user.id);
        }
      } catch (error) {
        console.error("[auth] linkAnonymousProfileToUser failed:", error);
      }
    },
  },
});
