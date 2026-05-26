import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatGoalLabel } from "@/lib/nutrition/tdee";
import { quotaPercent } from "@/lib/nutrition/quota";
import type { DailyQuota, Goal } from "@/lib/nutrition/types";
import { cn } from "@/lib/utils";

type SidebarQuotaPanelProps = {
  quota: DailyQuota;
  goal: Goal;
  title: string;
  description?: string;
};

function QuotaProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <Progress
      value={value}
      className={cn(
        "w-full gap-0 [&_[data-slot=progress-track]]:h-3 [&_[data-slot=progress-track]]:rounded-full",
        className,
      )}
    />
  );
}

type MacroRowProps = {
  label: string;
  unit: string;
  consumed: number;
  target: number;
};

function MacroRow({ label, unit, consumed, target }: MacroRowProps) {
  const percent = quotaPercent(consumed, target);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-zinc-600">{label}</span>
        <span className="shrink-0 text-xs tabular-nums text-zinc-500">
          <span className="font-semibold text-zinc-800">{Math.round(consumed)}{unit}</span>
          <span className="text-zinc-300"> / </span>
          {Math.round(target)}{unit}
          <span className="text-zinc-400"> ({percent}%)</span>
        </span>
      </div>
      <QuotaProgressBar value={percent} />
    </div>
  );
}

export function SidebarQuotaPanel({
  quota,
  goal,
  title,
  description,
}: SidebarQuotaPanelProps) {
  const { consumed, targets } = quota;
  const kcalPercent = quotaPercent(consumed.kcal, targets.targetKcal);

  return (
    <div className="space-y-3.5 px-5 pb-5 pt-5">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-base font-bold tracking-tight text-zinc-900">
            {title}
          </p>
          <Badge
            variant="secondary"
            className="rounded-full px-2 py-0 text-[9px] font-medium"
          >
            {formatGoalLabel(goal)}
          </Badge>
        </div>
        {description ? (
          <p className="text-[10px] leading-snug text-zinc-400">{description}</p>
        ) : null}
      </div>

      <div className="space-y-2.5">
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="text-3xl font-bold tracking-tight text-zinc-900 tabular-nums">
            {Math.round(consumed.kcal).toLocaleString()}
          </span>
          <span className="text-sm font-medium text-zinc-400 tabular-nums">
            / {targets.targetKcal.toLocaleString()}{" "}
            <span className="text-zinc-500">kcal</span>
          </span>
        </div>
        <QuotaProgressBar value={kcalPercent} />
      </div>

      <div className="space-y-2.5">
        <MacroRow
          label="โปรตีน"
          unit="g"
          consumed={consumed.proteinG}
          target={targets.targetProteinG}
        />
        <MacroRow
          label="คาร์บ"
          unit="g"
          consumed={consumed.carbsG}
          target={targets.targetCarbsG}
        />
        <MacroRow
          label="ไขมัน"
          unit="g"
          consumed={consumed.fatG}
          target={targets.targetFatG}
        />
        <MacroRow
          label="โซเดียม"
          unit="mg"
          consumed={consumed.sodiumMg}
          target={targets.targetSodiumMg}
        />
      </div>
    </div>
  );
}
