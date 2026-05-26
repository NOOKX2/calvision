import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DailyCaloriesTable } from "@/app/components/DailyCaloriesTable";
import { HistoryDayMealsSection } from "@/app/components/HistoryDayMealsSection";
import { SidebarQuotaPanel } from "@/app/components/SidebarQuotaPanel";
import { SetupBanner } from "@/app/components/SetupBanner";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getHistoryPageData } from "@/lib/data/history";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { buildDailyQuota } from "@/lib/nutrition/quota";
import type { Goal } from "@/lib/nutrition/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type HistoryPageProps = {
  searchParams: Promise<{ day?: string }>;
};

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const profile = await getCurrentProfile();
  const params = await searchParams;
  const data = profile ? await getHistoryPageData(params.day) : null;

  if (!profile) {
    return (
      <div className="min-h-full bg-[#f5f5f7]">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
          <HistoryPageHeader />
          <SetupBanner />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const selected = data.summaries.find((s) => s.dayKey === data.selectedDay);
  const consumed = selected?.consumed ?? {
    kcal: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    sodiumMg: 0,
  };
  const quota = buildDailyQuota(data.targets, consumed);
  const diff = consumed.kcal - data.targets.targetKcal;
  const diffLabel =
    diff > 0
      ? `เกินเป้า ${diff.toLocaleString()} kcal`
      : diff < 0
        ? `ต่ำกว่าเป้า ${Math.abs(diff).toLocaleString()} kcal`
        : "ตรงเป้า";

  const dayDetailDescription =
    data.selectedMeals.length > 0
      ? `${data.selectedMeals.length} มื้อ · ${diffLabel} · ดินสอแก้ไข`
      : "ยังไม่มีมื้อในวันนี้";

  return (
    <div className="min-h-full bg-[#f5f5f7]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <HistoryPageHeader />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <div className="order-3 lg:sticky lg:top-6 lg:col-span-3 lg:order-1 lg:self-start">
            <DailyCaloriesTable
              summaries={data.summaries}
              selectedDay={data.selectedDay}
              sidebar
            />
          </div>

          <div className="order-2 lg:sticky lg:top-6 lg:col-span-3 lg:order-2 lg:self-start">
            <Card className="gap-0 py-0">
              <SidebarQuotaPanel
                quota={quota}
                goal={data.profile.goal as Goal}
                title={`โควต้า — ${data.selectedLabel}`}
                description={diffLabel}
              />
            </Card>
          </div>

          <div className="order-1 min-w-0 lg:col-span-6 lg:order-3 lg:self-start">
            <HistoryDayMealsSection
              selectedDay={data.selectedDay}
              meals={data.selectedMeals}
              title={`มื้อ — ${data.selectedLabel}`}
              description={dayDetailDescription}
              emptyMessage="ยังไม่มีมื้อ — กดเพิ่มมื้อด้านบน หรือไปอัปโหลดรูปที่หน้าหลัก"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryPageHeader() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          ประวัติแคลอรี่
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          ปฏิทินซ้าย · โควต้ากลาง · เพิ่ม/แก้มื้อขวา
        </p>
      </div>
      <Link
        href="/"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
      >
        <ArrowLeft className="size-3.5" />
        กลับหน้าหลัก
      </Link>
    </div>
  );
}
