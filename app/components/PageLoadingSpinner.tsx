import { Loader2 } from "lucide-react";

export function PageLoadingSpinner() {
  return (
    <div
      className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-3 bg-[#f5f5f7]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="กำลังโหลด"
    >
      <Loader2 className="size-8 animate-spin text-zinc-400" aria-hidden />
      <p className="text-xs font-medium text-zinc-400">กำลังโหลด...</p>
    </div>
  );
}
