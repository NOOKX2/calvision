"use client";

import { useActionState, type FormEvent } from "react";

import {
  resetTodayCalories,
  type ResetCaloriesState,
} from "@/app/actions/meals";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initialState: ResetCaloriesState = { ok: false };

type ResetCaloriesButtonProps = {
  disabled?: boolean;
  className?: string;
};

export function ResetCaloriesButton({
  disabled,
  className,
}: ResetCaloriesButtonProps) {
  const [state, formAction, pending] = useActionState(
    resetTodayCalories,
    initialState,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (
      !confirm(
        "ลบมื้ออาหารวันนี้ทั้งหมด? แคลอรี่และโมครองค์ที่กินไปจะกลับเป็น 0",
      )
    ) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className={cn("space-y-2", className)}
    >
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="w-full"
        disabled={disabled || pending}
      >
        {pending ? "กำลังรีเซ็ต…" : "รีเซ็ตโควต้าวันนี้"}
      </Button>
      {state.message ? (
        <p
          className={cn(
            "text-center text-[11px]",
            state.ok ? "text-emerald-600" : "text-red-600",
          )}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
