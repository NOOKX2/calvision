import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SetupBanner() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-zinc-300/80 bg-white/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-xs leading-relaxed text-zinc-500">
        ตั้งค่า TDEE และเป้าหมาย Bulk/Cut ก่อน เพื่อเปิดใช้งานการวิเคราะห์อาหารและโควต้ารายวัน
      </p>
      <Link
        href="/settings"
        className={cn(
          buttonVariants({ size: "sm" }),
          "inline-flex shrink-0 gap-1.5",
        )}
      >
        ไปตั้งค่า
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
