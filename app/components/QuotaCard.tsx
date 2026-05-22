import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatGoalLabel } from "@/lib/nutrition/tdee";
import type { DailyQuota, Goal } from "@/lib/nutrition/types";
import { cn } from "@/lib/utils";

import { MacroQuotaRow } from "./MacroQuotaRow";
import { ResetCaloriesButton } from "./ResetCaloriesButton";

type QuotaCardProps = {
  quota: DailyQuota;
  goal: Goal;
  tdee: number;
  compact?: boolean;
  canReset?: boolean;
};

export function QuotaCard({
  quota,
  goal,
  tdee,
  compact,
  canReset,
}: QuotaCardProps) {
  const { consumed, targets, remaining } = quota;

  return (
    <Card className={cn(compact && "py-5")}>
      <CardHeader className={cn("gap-2", compact && "px-5 pb-0")}>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className={cn(compact && "text-base")}>
            โควต้าวันนี้
          </CardTitle>
          <Badge variant="secondary" className="rounded-full px-2.5 text-[10px]">
            {formatGoalLabel(goal)}
          </Badge>
        </div>
        {!compact ? (
          <CardDescription>
            TDEE ประมาณ {tdee.toLocaleString()} kcal · เป้าหมาย{" "}
            {targets.targetKcal.toLocaleString()} kcal
          </CardDescription>
        ) : (
          <CardDescription>
            {consumed.kcal}/{targets.targetKcal} kcal · รีเซ็ต 06:00
          </CardDescription>
        )}
      </CardHeader>
      <CardContent
        className={cn("space-y-4", compact && "space-y-3.5 px-5 pt-4")}
      >
        <MacroQuotaRow
          label="แคลอรี่"
          unit=" kcal"
          consumed={consumed.kcal}
          target={targets.targetKcal}
          remaining={remaining.kcal}
        />
        <MacroQuotaRow
          label="โปรตีน"
          unit="g"
          consumed={consumed.proteinG}
          target={targets.targetProteinG}
          remaining={remaining.proteinG}
        />
        <MacroQuotaRow
          label="คาร์บ"
          unit="g"
          consumed={consumed.carbsG}
          target={targets.targetCarbsG}
          remaining={remaining.carbsG}
        />
        <MacroQuotaRow
          label="ไขมัน"
          unit="g"
          consumed={consumed.fatG}
          target={targets.targetFatG}
          remaining={remaining.fatG}
        />
        {canReset ? (
          <ResetCaloriesButton className="pt-1" />
        ) : null}
      </CardContent>
    </Card>
  );
}
