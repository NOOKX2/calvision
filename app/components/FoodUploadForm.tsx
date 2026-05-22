"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImagePlus } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: MealActionState = { ok: false };

type FoodUploadFormProps = {
  disabled?: boolean;
  hero?: boolean;
  /** บันทึกลงวันติดตาม (หน้าประวัติ) แทนวันนี้ตามเวลาจริง */
  trackingDay?: string;
  dayLabel?: string;
  onSuccess?: () => void;
  submitLabel?: string;
};

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

export function FoodUploadForm({
  disabled,
  hero,
  trackingDay,
  dayLabel,
  onSuccess,
  submitLabel,
}: FoodUploadFormProps) {
  const inputId = trackingDay ? `image-${trackingDay}` : "image";
  const dayText = dayLabel ? dayLabel : "วันที่เลือก";
  const [state, formAction, pending] = useActionState(
    analyzeAndLogMeal,
    initialState,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileHint, setFileHint] = useState<string | null>(null);

  const clearSelection = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setHasFile(false);
    setFileHint(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const applyFile = useCallback((file: File) => {
    if (!isImageFile(file)) {
      setFileHint("กรุณาใช้ไฟล์รูปภาพเท่านั้น");
      return;
    }

    const dt = new DataTransfer();
    dt.items.add(file);
    if (inputRef.current) {
      inputRef.current.files = dt.files;
    }

    setHasFile(true);
    setFileHint(file.name);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  // หลัง submit สำเร็จ (pending กลับเป็น false + state.ok) → ล้าง preview
  useEffect(() => {
    if (!pending && state.ok) {
      clearSelection();
      onSuccess?.();
    }
  }, [pending, state.ok, clearSelection, onSuccess]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (disabled) return;

    function handlePaste(event: ClipboardEvent) {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (!item.type.startsWith("image/")) continue;
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          applyFile(file);
          break;
        }
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [applyFile, disabled]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      clearSelection();
      return;
    }

    applyFile(file);
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled && !pending) setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (disabled || pending) return;

    const file = event.dataTransfer.files?.[0];
    if (file) applyFile(file);
  }

  const hasPreview = Boolean(previewUrl);

  const dropZoneClassName = cn(
    "relative rounded-2xl border-2 border-dashed transition-all",
    hasPreview ? "p-3" : hero ? "p-6 sm:p-8" : "p-5",
    isDragging
      ? "border-zinc-900 bg-white"
      : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-white/80",
    (disabled || pending) && "pointer-events-none opacity-60",
  );

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
              {trackingDay
                ? `อัปโหลดรูปอาหาร บันทึกลง${dayText} · ระบบจะส่งไป Dify แล้วประเมินสารอาหารอัตโนมัติ`
                : "อัปโหลดรูปอาหาร ระบบจะส่งไป Dify แล้วบันทึกสารอาหารอัตโนมัติ"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          action={formAction}
          className={cn("space-y-4", hasPreview && "space-y-3")}
        >
          {trackingDay ? (
            <input type="hidden" name="trackingDay" value={trackingDay} />
          ) : null}
          <div className={cn("space-y-2", hasPreview && "space-y-2.5")}>
            <Label
              htmlFor={inputId}
              className={cn(hero && "text-sm text-zinc-600")}
            >
              {hero ? "รูปอาหาร" : "รูปภาพอาหาร"}
            </Label>

            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="ตัวอย่างอาหาร"
                className={cn(
                  "w-full rounded-2xl object-cover ring-1 ring-zinc-200/80",
                  hero ? "aspect-[4/3] max-h-72" : "aspect-video max-h-56",
                )}
              />
            ) : null}

            <div
              role="button"
              tabIndex={disabled || pending ? -1 : 0}
              aria-label={
                hasPreview
                  ? "เปลี่ยนรูปอาหาร"
                  : "วางรูปอาหาร ลากไฟล์ หรือวางจากคลิปบอร์ด"
              }
              className={dropZoneClassName}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (!disabled && !pending) inputRef.current?.click();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  inputRef.current?.click();
                }
              }}
            >
              <input
                ref={inputRef}
                id={inputId}
                name="image"
                type="file"
                accept="image/*"
                disabled={disabled || pending}
                onChange={handleFileChange}
                required={!hasFile}
                className="sr-only"
              />

              {hasPreview ? (
                <div className="flex items-center gap-2.5 text-left">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                    <ImagePlus className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-zinc-900">
                      {fileHint ?? "รูปที่เลือก"}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      คลิกหรือลากเพื่อเปลี่ยนรูป · ⌘V / Ctrl+V
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                    <ImagePlus className="size-6" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-900">
                      ลากรูปมาวาง หรือคลิกเพื่อเลือกไฟล์
                    </p>
                    <p className="text-xs text-zinc-400">
                      หรือกด{" "}
                      <kbd className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600">
                        ⌘V
                      </kbd>{" "}
                      /{" "}
                      <kbd className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600">
                        Ctrl+V
                      </kbd>{" "}
                      เพื่อวางรูปจากคลิปบอร์ด
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

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
            disabled={disabled || pending || !hasFile}
            className={cn("w-full", hero && "h-11 text-base")}
          >
            {pending
              ? "กำลังวิเคราะห์..."
              : (submitLabel ??
                (trackingDay ? "วิเคราะห์และบันทึก" : "วิเคราะห์อาหาร"))}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
