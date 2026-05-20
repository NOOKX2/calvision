import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { MealLog } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type MealHistoryProps = {
  meals: MealLog[];
  compact?: boolean;
};

export function MealHistory({ meals, compact }: MealHistoryProps) {
  return (
    <Card className={cn(compact && "py-5")}>
      <CardHeader className={cn(compact && "px-5 pb-0")}>
        <CardTitle className={cn(compact && "text-base")}>มื้อวันนี้</CardTitle>
        <CardDescription>
          {meals.length > 0
            ? `${meals.length} รายการ`
            : "ยังไม่มีมื้ออาหารวันนี้"}
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-4", compact && "px-5 pt-4")}>
        {meals.length === 0 ? (
          <p className="text-xs leading-relaxed text-zinc-400">
            อัปโหลดรูปอาหารเพื่อเริ่มติดตาม
          </p>
        ) : (
          meals.map((meal, index) => (
            <article key={meal.id}>
              {index > 0 ? (
                <Separator className="mb-3 bg-zinc-100" />
              ) : null}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {meal.foodName ?? "มื้ออาหาร"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    {new Date(meal.loggedAt).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900">
                  {meal.kcal}
                </p>
              </div>
              {!compact ? (
                <p className="mt-1.5 text-[11px] tabular-nums text-zinc-400">
                  P {meal.proteinG}g · C {meal.carbsG}g · F {meal.fatG}g
                </p>
              ) : null}
            </article>
          ))
        )}
      </CardContent>
    </Card>
  );
}
