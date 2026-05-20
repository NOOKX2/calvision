"use client";

import { useActionState, useState } from "react";
import { Camera } from "lucide-react";

import {
  analyzeAndLogMeal,
  type MealActionState,
} from "@/app/actions/meals";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: MealActionState = { ok: false };

type FoodUploadFormProps = {
  disabled?: boolean;
  hero?: boolean;
};

export function FoodUploadForm({ disabled, hero }: FoodUploadFormProps) {
  const [state, formAction, pending] = useActionState(
    analyzeAndLogMeal,
    initialState,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <Card
      className={cn(
        hero && "ring-1 ring-zinc-900/5 lg:py-8",
        disabled && "opacity-60",
      )}
    >
      <CardHeader className={cn(hero && "gap-2 pb-2")}>
        <div className="flex items-start gap-3">
          {hero ? (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-white">
              <Camera className="size-5" />
            </span>
          ) : null}
          <div>
            <CardTitle className={cn(hero && "text-xl sm:text-2xl")}>
              วิเคราะห์อาหาร
            </CardTitle>
            <CardDescription className={cn(hero && "mt-1 text-sm")}>
              อัปโหลดรูปอาหาร ระบบจะส่งไป Dify แล้วบันทึกสารอาหารอัตโนมัติ
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <div
            className={cn(
              "space-y-2",
              hero &&
                "rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-5 transition-colors focus-within:border-zinc-400 focus-within:bg-white",
            )}
          >
            <Label htmlFor="image" className={cn(hero && "text-sm text-zinc-600")}>
              {hero ? "เลือกรูปอาหารของคุณ" : "รูปภาพอาหาร"}
            </Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              disabled={disabled || pending}
              onChange={handleFileChange}
              required
              className={cn(
                "file:rounded-lg file:bg-zinc-200/80 file:px-3 file:py-1 file:text-xs file:font-medium file:text-zinc-700",
                hero && "h-12 border-0 bg-white/80",
              )}
            />
          </div>

          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="ตัวอย่างอาหาร"
              className={cn(
                "w-full rounded-2xl object-cover ring-1 ring-zinc-200/80",
                hero ? "aspect-[4/3] max-h-80" : "aspect-video",
              )}
            />
          ) : null}

          {state.nutrition ? (
            <div className="rounded-2xl bg-zinc-100/70 p-4 text-sm">
              <p className="font-semibold text-zinc-900">
                {state.nutrition.foodName}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-xs text-zinc-500 sm:grid-cols-4">
                <div>
                  <dt>โปรตีน</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-zinc-900">
                    {state.nutrition.proteinG} g
                  </dd>
                </div>
                <div>
                  <dt>คาร์บ</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-zinc-900">
                    {state.nutrition.carbsG} g
                  </dd>
                </div>
                <div>
                  <dt>ไขมัน</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-zinc-900">
                    {state.nutrition.fatG} g
                  </dd>
                </div>
                <div>
                  <dt>แคลอรี่</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-zinc-900">
                    {state.nutrition.kcal} kcal
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          {state.message ? (
            <p
              className={
                state.ok ? "text-xs text-emerald-600" : "text-xs text-red-500"
              }
            >
              {state.message}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={disabled || pending}
            className={cn("w-full", hero && "h-11 text-base")}
          >
            {pending ? "กำลังวิเคราะห์..." : "วิเคราะห์อาหาร"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
