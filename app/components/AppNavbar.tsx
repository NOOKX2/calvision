import Link from "next/link";
import { CalendarDays, Settings, UserRound } from "lucide-react";

import { AuthNav } from "@/app/components/AuthNav";
import { auth } from "@/auth";
import { formatGoalLabel } from "@/lib/nutrition/tdee";
import type { Profile } from "@/lib/db/schema";
import type { Goal } from "@/lib/nutrition/types";

type AppNavbarProps = {
  profile: Profile | null;
};

function ProfileSettingsLink({ profile }: { profile: Profile | null }) {
  return (
    <Link
      href="/settings"
      className="flex items-center gap-2.5 rounded-full bg-white py-1.5 pr-3 pl-1.5 shadow-[0_2px_12px_rgb(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_16px_rgb(0,0,0,0.08)]"
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
        <UserRound className="size-4" />
      </span>
      <span className="hidden min-w-0 flex-col sm:flex">
        {profile ? (
          <>
            <span className="truncate text-xs font-semibold text-zinc-900">
              {profile.targetKcal.toLocaleString()} kcal / วัน
            </span>
            <span className="truncate text-[10px] text-zinc-400">
              {formatGoalLabel(profile.goal as Goal)}
            </span>
          </>
        ) : (
          <span className="text-xs font-medium text-zinc-600">
            ตั้งค่าโปรไฟล์
          </span>
        )}
      </span>
      <Settings className="size-4 shrink-0 text-zinc-400 sm:hidden" />
      <Settings className="hidden size-3.5 shrink-0 text-zinc-400 sm:block" />
    </Link>
  );
}

export async function AppNavbar({ profile }: AppNavbarProps) {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const showHistory = isLoggedIn || Boolean(profile);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/50 bg-[#f5f5f7]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-bold tracking-tight text-zinc-900 transition-opacity hover:opacity-70"
        >
          Cal Vision
        </Link>

        <div className="flex items-center gap-2">
          {showHistory ? (
            <Link
              href="/history"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-medium text-zinc-600 shadow-[0_2px_12px_rgb(0,0,0,0.06)] transition-shadow hover:text-zinc-900 hover:shadow-[0_4px_16px_rgb(0,0,0,0.08)]"
            >
              <CalendarDays className="size-3.5" />
              ประวัติ
            </Link>
          ) : null}

          <ProfileSettingsLink profile={profile} />
          <AuthNav />
        </div>
      </nav>
    </header>
  );
}
