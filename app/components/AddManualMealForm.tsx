"use client";

import { useActionState, useEffect, useState } from "react";
import { PenLine, Plus, X } from "lucide-react";

import {
  addManualMeal,
  type AddManualMealState,
} from "@/app/actions/meals";
import { FoodUploadForm } from "@/app/components/FoodUploadForm";
import { MealHistory } from "@/app/components/MealHistory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MealLog } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const manualInitial: AddManualMealState = { ok: false };

type AddMode = "ai" | "manual";

type UseAddMealFormOptions = {
  trackingDay: string;
  dayLabel?: string;
};

function useAddMealForm({ trackingDay, dayLabel }: UseAddMealFormOptions) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AddMode>("ai");
  const [manualKey, setManualKey] = useState(0);
  const [uploadKey, setUploadKey] = useState(0);

  const [manualState, manualAction, manualPending] = useActionState(
    addManualMeal,
    manualInitial,
  );

  const dayText = dayLabel ? ` ${dayLabel}` : " วันที่เลือก";

  useEffect(() => {
    const schedule =
      typeof queueMicrotask === "function"
        ? queueMicrotask
        : (fn: () => void) => setTimeout(fn, 0);

    schedule(() => {
      setOpen(false);
      setManualKey((k) => k + 1);
      setUploadKey((k) => k + 1);
    });
  }, [trackingDay]);

  useEffect(() => {
    if (manualState.ok) {
      const schedule =
        typeof queueMicrotask === "function"
          ? queueMicrotask
          : (fn: () => void) => setTimeout(fn, 0);

      schedule(() => {
        setOpen(false);
        setManualKey((k) => k + 1);
      });
    }
  }, [manualState.ok]);

  function handleUploadSuccess() {
    setOpen(false);
    setUploadKey((k) => k + 1);
  }

  return {
    open,
    setOpen,
    mode,
    setMode,
    manualKey,
    uploadKey,
    manualState,
    manualAction,
    manualPending,
    dayText,
    trackingDay,
    dayLabel,
    handleUploadSuccess,
  };
}

function AddMealExpandedPanel({
  form,
}: {
  form: ReturnType<typeof useAddMealForm>;
}) {
  const {
    mode,
    setMode,
    manualKey,
    uploadKey,
    manualState,
    manualAction,
    manualPending,
    dayText,
    trackingDay,
    dayLabel,
    handleUploadSuccess,
    setOpen,
  } = form;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-xl bg-zinc-100/90 p-1 ring-1 ring-zinc-200/60">
        <button
          type="button"
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            mode === "ai"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-800",
          )}
          onClick={() => setMode("ai")}
        >
          วิเคราะห์รูป
        </button>
        <button
          type="button"
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            mode === "manual"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-800",
          )}
          onClick={() => setMode("manual")}
        >
          <PenLine className="size-3.5" />
          กรอกมือ
        </button>
      </div>

      {mode === "ai" ? (
        <FoodUploadForm
          key={uploadKey}
          hero
          trackingDay={trackingDay}
          dayLabel={dayLabel}
          onSuccess={handleUploadSuccess}
        />
      ) : (
        <div className="rounded-3xl bg-zinc-50/80 p-5 ring-1 ring-zinc-200/60 sm:p-6">
          <form key={manualKey} action={manualAction} className="space-y-4">
            <input type="hidden" name="trackingDay" value={trackingDay} />
            <div>
              <p className="text-sm font-semibold text-zinc-900">กรอกมื้อเอง</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                บันทึกย้อนหลังสำหรับ{dayText} · ไม่ต้องมีรูปภาพ
              </p>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor={`add-food-${trackingDay}`}
                className="text-xs text-zinc-600"
              >
                ชื่ออาหาร
              </Label>
              <Input
                id={`add-food-${trackingDay}`}
                name="foodName"
                required
                placeholder="เช่น ข้าวผัดไข่"
                className="h-10 rounded-xl border-0 bg-white text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="space-y-1.5">
                <Label
                  htmlFor={`add-p-${trackingDay}`}
                  className="text-xs text-zinc-600"
                >
                  โปรตีน (g)
                </Label>
                <Input
                  id={`add-p-${trackingDay}`}
                  name="proteinG"
                  type="number"
                  min={0}
                  step={0.1}
                  defaultValue={0}
                  className="h-10 rounded-xl border-0 bg-white text-sm tabular-nums"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor={`add-c-${trackingDay}`}
                  className="text-xs text-zinc-600"
                >
                  คาร์บ (g)
                </Label>
                <Input
                  id={`add-c-${trackingDay}`}
                  name="carbsG"
                  type="number"
                  min={0}
                  step={0.1}
                  defaultValue={0}
                  className="h-10 rounded-xl border-0 bg-white text-sm tabular-nums"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor={`add-f-${trackingDay}`}
                  className="text-xs text-zinc-600"
                >
                  ไขมัน (g)
                </Label>
                <Input
                  id={`add-f-${trackingDay}`}
                  name="fatG"
                  type="number"
                  min={0}
                  step={0.1}
                  defaultValue={0}
                  className="h-10 rounded-xl border-0 bg-white text-sm tabular-nums"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor={`add-s-${trackingDay}`}
                  className="text-xs text-zinc-600"
                >
                  โซเดียม (mg)
                </Label>
                <Input
                  id={`add-s-${trackingDay}`}
                  name="sodiumMg"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={0}
                  className="h-10 rounded-xl border-0 bg-white text-sm tabular-nums"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor={`add-kcal-${trackingDay}`}
                  className="text-xs text-zinc-600"
                >
                  แคลอรี่
                </Label>
                <Input
                  id={`add-kcal-${trackingDay}`}
                  name="kcal"
                  type="number"
                  min={0}
                  step={1}
                  required
                  placeholder="0"
                  className="h-10 rounded-xl border-0 bg-white text-sm tabular-nums"
                />
              </div>
            </div>

            {manualState.message ? (
              <p
                className={cn(
                  "text-xs",
                  manualState.ok ? "text-emerald-600" : "text-red-500",
                )}
              >
                {manualState.message}
              </p>
            ) : null}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={manualPending}
                className="h-11 flex-1 text-base"
              >
                {manualPending ? "กำลังบันทึก…" : "บันทึกมื้อ"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={manualPending}
                onClick={() => setOpen(false)}
              >
                ยกเลิก
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

type AddManualMealFormProps = {
  trackingDay: string;
  dayLabel?: string;
};

export function AddManualMealForm({
  trackingDay,
  dayLabel,
}: AddManualMealFormProps) {
  const form = useAddMealForm({ trackingDay, dayLabel });

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-1.5 sm:w-auto"
        onClick={() => form.setOpen((v) => !v)}
      >
        {form.open ? (
          <X className="size-4" />
        ) : (
          <Plus className="size-4" />
        )}
        {form.open ? "ปิดฟอร์ม" : "เพิ่มมื้อ"}
      </Button>
      {form.open ? <AddMealExpandedPanel form={form} /> : null}
    </div>
  );
}

type HistoryMealsCardProps = {
  trackingDay: string;
  dayLabel?: string;
  meals: MealLog[];
  title: string;
  description: string;
  emptyMessage: string;
};

/** มื้อ + เพิ่มมื้อในการ์ดเดียว — ขอบบนเรียงกับคอลัมน์ซ้าย/กลาง */
export function HistoryMealsCard({
  trackingDay,
  dayLabel,
  meals,
  title,
  description,
  emptyMessage,
}: HistoryMealsCardProps) {
  const form = useAddMealForm({ trackingDay, dayLabel });

  return (
    <MealHistory
      meals={meals}
      compact
      title={title}
      description={description}
      emptyMessage={emptyMessage}
      headerSlot={
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-1.5 sm:w-auto"
          onClick={() => form.setOpen((v) => !v)}
        >
          {form.open ? (
            <X className="size-4" />
          ) : (
            <Plus className="size-4" />
          )}
          {form.open ? "ปิดฟอร์ม" : "เพิ่มมื้อ"}
        </Button>
      }
      belowHeaderSlot={form.open ? <AddMealExpandedPanel form={form} /> : null}
    />
  );
}
