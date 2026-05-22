import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DailySummary } from "@/lib/data/history";
import { cn } from "@/lib/utils";

type DailyCaloriesTableProps = {
  summaries: DailySummary[];
  selectedDay: string;
  sidebar?: boolean;
};

function dayHref(dayKey: string, sidebar?: boolean) {
  return sidebar ? `/history?day=${dayKey}` : `/history?day=${dayKey}#day-meals`;
}

function SidebarDayRow({
  row,
  selectedDay,
}: {
  row: DailySummary;
  selectedDay: string;
}) {
  const isSelected = row.dayKey === selectedDay;
  const over = row.consumed.kcal > row.targetKcal;

  return (
    <li>
      <Link
        href={dayHref(row.dayKey, true)}
        className={cn(
          "block rounded-xl px-3.5 py-3.5 transition-all duration-200",
          isSelected
            ? "bg-linear-to-b from-white to-zinc-100/90 shadow-[0_2px_12px_rgb(0,0,0,0.06)] ring-1 ring-zinc-200/70"
            : "hover:bg-white/90 hover:shadow-[0_1px_6px_rgb(0,0,0,0.04)] hover:ring-1 hover:ring-zinc-100",
          row.mealCount > 0 && !isSelected && "hover:bg-zinc-50/80",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-sm font-semibold leading-snug",
                isSelected ? "text-zinc-900" : "text-zinc-700",
              )}
            >
              {row.label}
            </p>
            {row.mealCount > 0 ? (
              <p className="mt-0.5 text-[11px] text-zinc-400">
                {row.mealCount} มื้อ
              </p>
            ) : (
              <p className="mt-0.5 text-[11px] text-zinc-300">—</p>
            )}
          </div>
          <p
            className={cn(
              "shrink-0 text-sm font-semibold tabular-nums",
              row.mealCount === 0
                ? "text-zinc-300"
                : over
                  ? "text-amber-700"
                  : "text-zinc-900",
            )}
          >
            {row.consumed.kcal.toLocaleString()}
          </p>
        </div>
        {row.mealCount > 0 ? (
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className="text-[10px] text-zinc-400">
              เป้า {row.targetKcal.toLocaleString()}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums",
                over
                  ? "bg-amber-100/90 text-amber-800"
                  : row.percent >= 80
                    ? "bg-emerald-100/90 text-emerald-800"
                    : "bg-zinc-100 text-zinc-600",
              )}
            >
              {row.percent}%
            </span>
          </div>
        ) : null}
      </Link>
    </li>
  );
}

export function DailyCaloriesTable({
  summaries,
  selectedDay,
  sidebar,
}: DailyCaloriesTableProps) {
  if (sidebar) {
    return (
      <Card className="flex max-h-[calc(100vh-8rem)] flex-col gap-0 py-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <CardHeader className="shrink-0 gap-1 px-5 pb-2 pt-5">
          <CardTitle className="text-base font-bold">สรุปรายวัน</CardTitle>
          <CardDescription className="text-[11px] leading-relaxed text-zinc-400">
            30 วัน · เริ่มนับ 06:00
          </CardDescription>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
          <ul className="space-y-1.5" role="list">
            {summaries.map((row) => (
              <SidebarDayRow
                key={row.dayKey}
                row={row}
                selectedDay={selectedDay}
              />
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>สรุปแคลอรี่รายวัน</CardTitle>
        <CardDescription>
          30 วันล่าสุด · นับตั้งแต่ 06:00 · คลิกแถวเพื่อดูและแก้ไขมื้อ
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-[11px] text-zinc-400">
                <th className="px-5 py-2.5 font-medium">วัน</th>
                <th className="px-3 py-2.5 font-medium text-right">แคล</th>
                <th className="hidden px-3 py-2.5 font-medium text-right sm:table-cell">
                  เป้า
                </th>
                <th className="px-5 py-2.5 font-medium text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((row) => {
                const isSelected = row.dayKey === selectedDay;
                const over = row.consumed.kcal > row.targetKcal;

                return (
                  <tr
                    key={row.dayKey}
                    className={cn(
                      "border-b border-zinc-50 transition-colors last:border-0",
                      isSelected && "bg-zinc-100/80",
                      row.mealCount > 0 && "cursor-pointer hover:bg-zinc-50/80",
                    )}
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={dayHref(row.dayKey)}
                        className={cn(
                          "block font-medium",
                          isSelected
                            ? "text-zinc-900"
                            : "text-zinc-700 hover:text-zinc-900",
                        )}
                      >
                        {row.label}
                        {row.mealCount > 0 ? (
                          <span className="ml-1.5 text-[10px] font-normal text-zinc-400">
                            ({row.mealCount})
                          </span>
                        ) : null}
                      </Link>
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums">
                      <Link
                        href={dayHref(row.dayKey)}
                        className={cn(
                          "font-semibold",
                          row.mealCount === 0
                            ? "text-zinc-300"
                            : over
                              ? "text-amber-700"
                              : "text-zinc-900",
                        )}
                      >
                        {row.consumed.kcal.toLocaleString()}
                      </Link>
                    </td>
                    <td className="hidden px-3 py-3.5 text-right tabular-nums text-zinc-400 sm:table-cell">
                      {row.targetKcal.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={dayHref(row.dayKey)}
                        className={cn(
                          "inline-flex min-w-10 justify-end rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                          row.mealCount === 0
                            ? "text-zinc-300"
                            : over
                              ? "bg-amber-100 text-amber-800"
                              : row.percent >= 80
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-zinc-100 text-zinc-600",
                        )}
                      >
                        {row.mealCount === 0 ? "—" : `${row.percent}%`}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
