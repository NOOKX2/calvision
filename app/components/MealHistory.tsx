import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MealLog } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

import { MealHistoryItem } from "./MealHistoryItem";

type MealHistoryProps = {
  meals: MealLog[];
  compact?: boolean;
  title?: string;
  description?: string;
  emptyMessage?: string;
  headerSlot?: ReactNode;
  belowHeaderSlot?: ReactNode;
};

export function MealHistory({
  meals,
  compact,
  title = "มื้อวันนี้",
  description,
  emptyMessage = "อัปโหลดรูปอาหารเพื่อเริ่มติดตาม",
  headerSlot,
  belowHeaderSlot,
}: MealHistoryProps) {
  const defaultDescription =
    meals.length > 0
      ? `${meals.length} รายการ · นับตั้งแต่ 06:00`
      : "ยังไม่มีมื้ออาหาร · วันใหม่เริ่ม 06:00";

  return (
    <Card className={cn(compact && "gap-0 py-0")}>
      <CardHeader className={cn(compact && "gap-3 px-5 pb-0 pt-5")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className={cn(compact && "text-base")}>{title}</CardTitle>
            <CardDescription className="mt-1">
              {description ?? defaultDescription}
            </CardDescription>
          </div>
          {headerSlot ? (
            <div className="w-full shrink-0 sm:w-auto">{headerSlot}</div>
          ) : null}
        </div>
      </CardHeader>
      {belowHeaderSlot ? (
        <div className={cn("px-5 pb-4", compact && "pt-0")}>{belowHeaderSlot}</div>
      ) : null}
      <CardContent className={cn("space-y-4", compact && "px-5 pb-5 pt-4")}>
        {meals.length === 0 ? (
          <p className="text-xs leading-relaxed text-zinc-400">{emptyMessage}</p>
        ) : (
          meals.map((meal, index) => (
            <MealHistoryItem
              key={meal.id}
              meal={meal}
              showSeparator={index > 0}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
