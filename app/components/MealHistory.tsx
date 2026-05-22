import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MealLog } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

import { MealHistoryItem } from "./MealHistoryItem";

type MealHistoryProps = {
  meals: MealLog[];
  compact?: boolean;
};

export function MealHistory({ meals, compact }: MealHistoryProps) {
  return (
    <Card className={cn(compact && "py-5")}>
      <CardHeader className={cn(compact && "px-5 pb-0")}>
        <CardTitle className={cn(compact && "text-base")}>มื้อวันนี้</CardTitle>
        <CardDescription>
          {meals.length > 0
            ? `${meals.length} รายการ · นับตั้งแต่ 06:00`
            : "ยังไม่มีมื้ออาหาร · วันใหม่เริ่ม 06:00"}
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-4", compact && "px-5 pt-4")}>
        {meals.length === 0 ? (
          <p className="text-xs leading-relaxed text-zinc-400">
            อัปโหลดรูปอาหารเพื่อเริ่มติดตาม
          </p>
        ) : (
          meals.map((meal, index) => (
            <MealHistoryItem
              key={meal.id}
              meal={meal}
              showSeparator={index > 0}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
