import { FoodUploadForm } from "@/app/components/food-upload-form";
import { MealHistory } from "@/app/components/meal-history";
import { QuotaCard } from "@/app/components/quota-card";
import { SetupBanner } from "@/app/components/setup-banner";
import { SiteHeader } from "@/app/components/site-header";
import {
  getDashboardData,
  getProfileBySession,
} from "@/lib/data/profile";
import { getSessionId } from "@/lib/session";
import type { Goal } from "@/lib/nutrition/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sessionId = await getSessionId();
  const profile = sessionId ? await getProfileBySession(sessionId) : null;
  const dashboard =
    sessionId && profile ? await getDashboardData(sessionId) : null;

  const hasProfile = Boolean(profile);

  return (
    <div className="min-h-full bg-[#f5f5f7]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:gap-7 sm:px-6 sm:py-10">
        <SiteHeader />

        {!hasProfile ? <SetupBanner /> : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
          <FoodUploadForm disabled={!hasProfile} hero />

          <aside className="flex flex-col gap-6">
            {dashboard ? (
              <QuotaCard
                quota={dashboard.quota}
                goal={dashboard.profile.goal as Goal}
                tdee={dashboard.profile.tdee}
                compact
              />
            ) : (
              <section className="rounded-3xl bg-white p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <p className="text-xs leading-relaxed text-zinc-400">
                  ตั้งค่าโปรไฟล์เพื่อดูโควต้าโปรตีน คาร์บ ไขมัน และแคลอรี่รายวัน
                </p>
              </section>
            )}

            {hasProfile ? (
              <MealHistory meals={dashboard?.meals ?? []} compact />
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
