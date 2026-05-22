"use client";

import { useActionState, useEffect } from "react";

import { updateMeal, type UpdateMealState } from "@/app/actions/meals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MealLog } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const initialState: UpdateMealState = { ok: false };

type MealEditFormProps = {
  meal: MealLog;
  onDone: () => void;
};

export function MealEditForm({ meal, onDone }: MealEditFormProps) {
  const [state, formAction, pending] = useActionState(updateMeal, initialState);

  useEffect(() => {
    if (state.ok) {
      onDone();
    }
  }, [state.ok, onDone]);

  return (
    <form
      action={formAction}
      className="mt-3 space-y-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200/80"
    >
      <input type="hidden" name="mealId" value={meal.id} />

      <div className="space-y-1.5">
        <Label htmlFor={`foodName-${meal.id}`} className="text-[11px]">
          ชื่ออาหาร
        </Label>
        <Input
          id={`foodName-${meal.id}`}
          name="foodName"
          defaultValue={meal.foodName ?? ""}
          required
          className="h-9 rounded-lg border-0 bg-white text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor={`protein-${meal.id}`} className="text-[11px]">
            โปรตีน (g)
          </Label>
          <Input
            id={`protein-${meal.id}`}
            name="proteinG"
            type="number"
            min={0}
            step={0.1}
            defaultValue={meal.proteinG}
            required
            className="h-9 rounded-lg border-0 bg-white text-sm tabular-nums"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`carbs-${meal.id}`} className="text-[11px]">
            คาร์บ (g)
          </Label>
          <Input
            id={`carbs-${meal.id}`}
            name="carbsG"
            type="number"
            min={0}
            step={0.1}
            defaultValue={meal.carbsG}
            required
            className="h-9 rounded-lg border-0 bg-white text-sm tabular-nums"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`fat-${meal.id}`} className="text-[11px]">
            ไขมัน (g)
          </Label>
          <Input
            id={`fat-${meal.id}`}
            name="fatG"
            type="number"
            min={0}
            step={0.1}
            defaultValue={meal.fatG}
            required
            className="h-9 rounded-lg border-0 bg-white text-sm tabular-nums"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`kcal-${meal.id}`} className="text-[11px]">
            แคลอรี่
          </Label>
          <Input
            id={`kcal-${meal.id}`}
            name="kcal"
            type="number"
            min={0}
            step={1}
            defaultValue={meal.kcal}
            required
            className="h-9 rounded-lg border-0 bg-white text-sm tabular-nums"
          />
        </div>
      </div>

      {state.message ? (
        <p
          className={cn(
            "text-[11px]",
            state.ok ? "text-emerald-600" : "text-red-500",
          )}
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={pending}
          className="flex-1"
        >
          {pending ? "กำลังบันทึก…" : "บันทึก"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={onDone}
        >
          ยกเลิก
        </Button>
      </div>
    </form>
  );
}
