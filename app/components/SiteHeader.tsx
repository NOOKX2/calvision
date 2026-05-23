import { cn } from "@/lib/utils";

type FoodUploadHeroHeadingProps = {
  compact?: boolean;
};

/** หัวข้อ hero ด้านบนการ์ดวิเคราะห์อาหาร (หน้าหลัก) */
export function FoodUploadHeroHeading({ compact }: FoodUploadHeroHeadingProps) {
  return (
    <header
      className={cn(
        "space-y-1.5 text-center",
        compact ? "mb-4 sm:mb-5" : "mb-6 space-y-2 sm:mb-8",
      )}
    >
      <h1
        className={cn(
          "font-extrabold tracking-tight text-zinc-900",
          compact ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl",
        )}
      >
        ถ่ายรูป วิเคราะห์ทันที
      </h1>
      <p
        className={cn(
          "mx-auto leading-relaxed text-zinc-500",
          compact ? "max-w-sm text-xs sm:text-sm" : "max-w-lg text-sm",
        )}
      >
        อัปโหลดรูปอาหาร ระบบจะประเมินโปรตีน คาร์บ ไขมัน และแคลอรี่ให้อัตโนมัติ
      </p>
    </header>
  );
}
