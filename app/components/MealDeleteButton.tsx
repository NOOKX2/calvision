"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { deleteMeal } from "@/app/actions/meals";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MealDeleteButtonProps = {
  mealId: string;
  foodName: string;
  className?: string;
};

export function MealDeleteButton({
  mealId,
  foodName,
  className,
}: MealDeleteButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`ลบ "${foodName}" ออกจากมื้อวันนี้?`)) return;

    startTransition(async () => {
      try {
        await deleteMeal(mealId);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "ไม่สามารถลบรายการได้";
        alert(message);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn(
        "text-zinc-400 hover:bg-red-50 hover:text-red-600",
        className,
      )}
      disabled={pending}
      aria-label={`ลบ ${foodName}`}
      onClick={handleClick}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
