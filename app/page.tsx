import { FoodUploadForm } from "@/app/components/FoodUploadForm";
import { MealHistory } from "@/app/components/MealHistory";
import { QuotaCard } from "@/app/components/QuotaCard";
import { SetupBanner } from "@/app/components/SetupBanner";
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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        {!hasProfile ? <SetupBanner /> : null}

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900">
              ภาพรวมวันนี้
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              โควต้า · วิเคราะห์อาหาร · มื้อที่บันทึกแล้ว · นับตั้งแต่ 06:00
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            <div className="order-2 lg:order-1 lg:col-span-3 lg:self-start">
              {dashboard ? (
                <QuotaCard
                  quota={dashboard.quota}
                  goal={dashboard.profile.goal as Goal}
                  tdee={dashboard.profile.tdee}
                  compact
                  canReset={dashboard.meals.length > 0}
                />
              ) : (
                <section className="rounded-3xl bg-white px-5 py-5 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <p className="text-xs leading-relaxed text-zinc-400">
                    ตั้งค่าโปรไฟล์เพื่อดูโควต้ารายวัน
                  </p>
                </section>
              )}
            </div>

            <div className="order-1 min-w-0 lg:order-2 lg:col-span-5 lg:self-start">
              <FoodUploadForm
                disabled={!hasProfile}
                hero
                centered
                homeColumn
              />
            </div>

            <div className="order-3 lg:col-span-4 lg:self-start">
              {dashboard ? (
                <MealHistory meals={dashboard.meals} compact />
              ) : (
                <section className="rounded-3xl bg-white px-5 py-5 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <p className="text-xs leading-relaxed text-zinc-400">
                    มื้อวันนี้จะแสดงหลังตั้งค่าโปรไฟล์
                  </p>
                </section>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
