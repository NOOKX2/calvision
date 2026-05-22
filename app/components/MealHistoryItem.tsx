import { Separator } from "@/components/ui/separator";
import type { MealLog } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

import { MealDeleteButton } from "./MealDeleteButton";

type MealHistoryItemProps = {
  meal: MealLog;
  showSeparator?: boolean;
};

export function MealHistoryItem({ meal, showSeparator }: MealHistoryItemProps) {
  const hasImage = Boolean(meal.imagePath);

  return (
    <article>
      {showSeparator ? <Separator className="mb-3 bg-zinc-100" /> : null}
      <div className="flex gap-3">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/meals/${meal.id}/image`}
            alt={meal.foodName ?? "มื้ออาหาร"}
            className="size-16 shrink-0 rounded-xl object-cover ring-1 ring-zinc-200/80"
          />
        ) : (
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-[10px] text-zinc-400"
            aria-hidden
          >
            ไม่มีรูป
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
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
            <div className="flex shrink-0 items-center gap-0.5">
              <p className="text-sm font-semibold tabular-nums text-zinc-900">
                {meal.kcal}
              </p>
              <MealDeleteButton
                mealId={meal.id}
                foodName={meal.foodName ?? "มื้ออาหาร"}
              />
            </div>
          </div>

          <dl
            className={cn(
              "mt-2 grid grid-cols-3 gap-2 text-[10px] text-zinc-500",
            )}
          >
            <div>
              <dt>โปรตีน</dt>
              <dd className="mt-0.5 text-xs font-semibold tabular-nums text-zinc-800">
                {meal.proteinG}g
              </dd>
            </div>
            <div>
              <dt>คาร์บ</dt>
              <dd className="mt-0.5 text-xs font-semibold tabular-nums text-zinc-800">
                {meal.carbsG}g
              </dd>
            </div>
            <div>
              <dt>ไขมัน</dt>
              <dd className="mt-0.5 text-xs font-semibold tabular-nums text-zinc-800">
                {meal.fatG}g
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  );
}
