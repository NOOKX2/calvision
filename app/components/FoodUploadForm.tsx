"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImageIcon, ImagePlus } from "lucide-react";

import { FoodCameraCapture } from "@/app/components/FoodCameraCapture";

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
  /** หน้าหลัก: การ์ด hero กึ่งกลาง เน้นอัปโหลด */
  centered?: boolean;
  /** หัวข้อ hero อยู่นอกการ์ด */
  hideCardHeading?: boolean;
  /** หน้าหลัก 3 คอลัมน์: หัวข้อในการ์ด ขอบบนเรียงกับโควต้า/มื้อ */
  homeColumn?: boolean;
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
  centered,
  hideCardHeading,
  homeColumn,
  trackingDay,
  dayLabel,
  onSuccess,
  submitLabel,
}: FoodUploadFormProps) {
  const isCenteredHero = Boolean(hero && centered && !trackingDay);
  const isHomeColumn = Boolean(isCenteredHero && homeColumn);
  const inputId = trackingDay ? `image-${trackingDay}` : "image";
  const dayText = dayLabel ? dayLabel : "วันที่เลือก";
  const [state, formAction, pending] = useActionState(
    analyzeAndLogMeal,
    initialState,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileHint, setFileHint] = useState<string | null>(null);
  const [promptText, setPromptText] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);

  const clearSelection = useCallback(() => {
    if (inputRef.current) inputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    setHasFile(false);
    setFileHint(null);
    setPromptText("");
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
      const schedule =
        typeof queueMicrotask === "function"
          ? queueMicrotask
          : (fn: () => void) => setTimeout(fn, 0);
      schedule(() => clearSelection());
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

  function handleTakePhoto() {
    if (disabled || pending) return;

    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      setCameraOpen(true);
      return;
    }

    cameraInputRef.current?.click();
  }

  function handlePickGallery() {
    if (disabled || pending) return;
    galleryInputRef.current?.click();
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
  const hasPrompt = promptText.trim().length > 0;

  const dropZoneClassName = cn(
    "relative rounded-2xl border-2 border-dashed transition-all",
    hasPreview
      ? "p-3"
      : isCenteredHero
        ? "flex min-h-[220px] flex-col items-center justify-center p-6 sm:min-h-[240px] sm:p-8"
        : hero
          ? "p-6 sm:p-8"
          : "p-5",
    isDragging
      ? "border-zinc-900 bg-white"
      : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-white/80",
    (disabled || pending) && "pointer-events-none opacity-60",
  );

  return (
    <Card
      className={cn(
        hero && "gap-0 py-0",
        isCenteredHero
          ? "shadow-[0_12px_40px_rgb(0,0,0,0.06)] ring-1 ring-zinc-900/5"
          : hero && "ring-1 ring-zinc-900/5",
        disabled && "opacity-60",
      )}
    >
      {isHomeColumn ? (
        <CardHeader className="gap-2 px-5 pb-2 pt-5 text-center sm:px-6">
          <div className="flex flex-col items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-zinc-900 text-white">
              <Camera className="size-4" />
            </span>
            <div className="space-y-1">
              <CardTitle className="text-base font-bold leading-snug">
                ถ่ายรูป วิเคราะห์ทันที
              </CardTitle>
              <CardDescription className="text-[11px] leading-relaxed">
                อัปโหลดรูปอาหาร ระบบจะประเมินโปรตีน คาร์บ ไขมัน และแคลอรี่ให้อัตโนมัติ
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      ) : hideCardHeading && isCenteredHero ? (
        <div className="flex justify-center px-6 pt-6 sm:px-8 sm:pt-7">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-zinc-900 text-white sm:size-14 sm:rounded-3xl">
            <Camera className="size-5 sm:size-6" />
          </span>
        </div>
      ) : (
        <CardHeader
          className={cn(
            hero && "gap-2 px-5 pb-2 pt-5 sm:px-6",
            isCenteredHero && "px-6 pb-3 pt-7 text-center sm:px-8 sm:pt-8",
          )}
        >
          <div
            className={cn(
              "flex items-start gap-3",
              isCenteredHero && "flex-col items-center gap-4",
            )}
          >
            {hero ? (
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-white",
                  isCenteredHero && "size-14 rounded-3xl",
                )}
              >
                <Camera className={cn("size-5", isCenteredHero && "size-6")} />
              </span>
            ) : null}
            <div className={cn(isCenteredHero && "max-w-md")}>
              <CardTitle
                className={cn(
                  hero && "text-xl sm:text-2xl",
                  isCenteredHero && "text-2xl sm:text-3xl",
                )}
              >
                วิเคราะห์อาหาร
              </CardTitle>
              <CardDescription
                className={cn(
                  hero && "mt-1 text-sm",
                  isCenteredHero && "mt-2 text-sm leading-relaxed",
                )}
              >
                {trackingDay
                  ? `อัปโหลดรูปอาหาร บันทึกลง${dayText} · ระบบจะส่งไป Dify แล้วประเมินสารอาหารอัตโนมัติ`
                  : "อัปโหลดรูปอาหาร ระบบจะส่งไป Dify แล้วบันทึกสารอาหารอัตโนมัติ"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent
        className={cn(
          hero && "px-5 pb-5 sm:px-6 sm:pb-6",
          isHomeColumn && "px-5 pb-5 pt-3 sm:px-6",
          isCenteredHero &&
            !isHomeColumn &&
            "px-6 pb-7 sm:px-8 sm:pb-8",
          hideCardHeading && isCenteredHero && !isHomeColumn && "pt-4",
        )}
      >
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
              {hero ? "รูปอาหาร (ไม่บังคับ)" : "รูปภาพอาหาร (ไม่บังคับ)"}
            </Label>

            <input
              ref={inputRef}
              id={inputId}
              name="image"
              type="file"
              accept="image/*"
              disabled={disabled || pending}
              required={!hasFile && !hasPrompt}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              disabled={disabled || pending}
              onChange={handleFileChange}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              disabled={disabled || pending}
              onChange={handleFileChange}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
            />

            {cameraOpen ? (
              <FoodCameraCapture
                open={cameraOpen}
                disabled={disabled || pending}
                onClose={() => setCameraOpen(false)}
                onCapture={applyFile}
                onUnavailable={() => cameraInputRef.current?.click()}
              />
            ) : null}

            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="ตัวอย่างอาหาร"
                className={cn(
                  "w-full rounded-2xl object-cover ring-1 ring-zinc-200/80",
                  hero ? "aspect-4/3 max-h-72" : "aspect-video max-h-56",
                )}
              />
            ) : null}

            {!cameraOpen ? (
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
                if (!disabled && !pending) handlePickGallery();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handlePickGallery();
                }
              }}
            >
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
                      ลากรูปมาวาง หรือเลือกจากอัลบั้ม
                    </p>
                    <p className="text-xs text-zinc-400">
                      กดถ่ายรูปด้านล่าง · หรือ{" "}
                      <kbd className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600">
                        ⌘V
                      </kbd>{" "}
                      /{" "}
                      <kbd className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600">
                        Ctrl+V
                      </kbd>{" "}
                      วางจากคลิปบอร์ด
                    </p>
                  </div>
                </div>
              )}
            </div>
            ) : null}

            {!cameraOpen ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled || pending}
                  className="h-10 gap-1.5 text-sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleTakePhoto();
                  }}
                >
                  <Camera className="size-4" />
                  ถ่ายรูป
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled || pending}
                  className="h-10 gap-1.5 text-sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    handlePickGallery();
                  }}
                >
                  <ImageIcon className="size-4" />
                  เลือกรูป
                </Button>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="prompt"
              className={cn(hero && "text-sm text-zinc-600")}
            >
              Prompt (พิมพ์แทนรูปได้)
            </Label>
            <textarea
              id="prompt"
              name="prompt"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="เช่น ข้าวผัดไก่ 1 จาน / ก๋วยเตี๋ยวน้ำตก 1 ชาม (ประมาณตามที่เห็นจริง)"
              disabled={disabled || pending}
              rows={3}
              className={cn(
                "w-full resize-none rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400",
                "focus:outline-none focus:ring-2 focus:ring-zinc-900/10",
                (disabled || pending) && "opacity-60",
              )}
            />
            <p className="text-[11px] leading-relaxed text-zinc-400">
              ถ้ามีทั้งรูปและ prompt ระบบจะใช้ prompt เป็นคำอธิบายเพิ่มเติมให้ด้วย
            </p>
          </div>

          {state.nutrition ? (
            <div className="rounded-2xl bg-zinc-100/70 p-4 text-sm">
              <p className="font-semibold text-zinc-900">
                {state.nutrition.foodName}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-xs text-zinc-500 sm:grid-cols-5">
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
                  <dt>โซเดียม</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-zinc-900">
                    {state.nutrition.sodiumMg} mg
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
            disabled={disabled || pending || (!hasFile && !hasPrompt)}
            className={cn(
              "w-full",
              hero && "h-11 text-base",
              isCenteredHero && "h-12 text-base sm:text-lg",
            )}
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
