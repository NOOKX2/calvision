"use client";

import { useCallback, useEffect, useRef } from "react";
import { Camera, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FoodCameraCaptureProps = {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  onUnavailable?: () => void;
  disabled?: boolean;
};

export function FoodCameraCapture({
  open,
  onClose,
  onCapture,
  onUnavailable,
  disabled,
}: FoodCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!open || disabled) return;

    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
      } catch {
        onUnavailable?.();
        onClose();
      }
    }

    void start();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [open, disabled, onClose, stopStream]);

  function handleClose() {
    stopStream();
    onClose();
  }

  function handleCapture() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `meal-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        stopStream();
        onCapture(file);
        onClose();
      },
      "image/jpeg",
      0.92,
    );
  }

  if (!open) return null;

  return (
    <div
      className="space-y-3 rounded-2xl bg-zinc-900 p-3 ring-1 ring-zinc-800"
      role="region"
      aria-label="ถ่ายรูปอาหาร"
    >
      <div className="relative overflow-hidden rounded-xl bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="aspect-4/3 w-full object-cover"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 hover:text-white"
          onClick={handleClose}
          aria-label="ปิดกล้อง"
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          className="h-11 flex-1 gap-2"
          onClick={handleCapture}
        >
          <Camera className="size-4" />
          ถ่ายภาพ
        </Button>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-11 border-zinc-600 bg-transparent text-white hover:bg-zinc-800 hover:text-white",
          )}
          onClick={handleClose}
        >
          ยกเลิก
        </Button>
      </div>
    </div>
  );
}
