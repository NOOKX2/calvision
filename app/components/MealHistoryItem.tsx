"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { MealLog } from "@/lib/db/schema";
import { mealImageSrc } from "@/lib/meals/image-url";
import { cn } from "@/lib/utils";

import { MealDeleteButton } from "./MealDeleteButton";
import { MealEditForm } from "./MealEditForm";

type MealHistoryItemProps = {
  meal: MealLog;
  showSeparator?: boolean;
};

export function MealHistoryItem({ meal, showSeparator }: MealHistoryItemProps) {
  const [editing, setEditing] = useState(false);
  const imageSrc = mealImageSrc(meal.id, meal.imagePath);

  return (
    <article>
      {showSeparator ? <Separator className="mb-3 bg-zinc-100" /> : null}
      <div className="flex gap-3">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
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
            <div className="min-w-0 flex-1 pr-1">
              <p className="text-sm font-semibold leading-snug break-words text-zinc-900">
                {meal.foodName ?? "มื้ออาหาร"}
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-400">
                {new Date(meal.loggedAt).toLocaleTimeString("th-TH", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Bangkok",
                })}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <p className="text-sm font-semibold tabular-nums text-zinc-900">
                {meal.kcal.toLocaleString()}{" "}
                <span className="text-xs font-medium text-zinc-500">kcal</span>
              </p>
              <div className="flex gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
                  aria-label={`แก้ไข ${meal.foodName ?? "มื้ออาหาร"}`}
                  onClick={() => setEditing((v) => !v)}
                >
                  <Pencil className="size-4" />
                </Button>
                <MealDeleteButton
                  mealId={meal.id}
                  foodName={meal.foodName ?? "มื้ออาหาร"}
                />
              </div>
            </div>
          </div>

          {!editing ? (
            <dl
              className={cn(
                "mt-2.5 grid grid-cols-4 gap-3 text-[10px] text-zinc-500",
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
              <div>
                <dt>โซเดียม</dt>
                <dd className="mt-0.5 text-xs font-semibold tabular-nums text-zinc-800">
                  {meal.sodiumMg} mg
                </dd>
              </div>
            </dl>
          ) : null}

          {editing ? (
            <MealEditForm meal={meal} onDone={() => setEditing(false)} />
          ) : null}
        </div>
      </div>
    </article>
  );
}
