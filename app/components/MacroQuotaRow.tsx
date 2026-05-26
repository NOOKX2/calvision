import { Progress } from "@/components/ui/progress";
import { quotaPercent } from "@/lib/nutrition/quota";

type MacroQuotaRowProps = {
  label: string;
  unit: string;
  consumed: number;
  target: number;
  remaining: number;
  dense?: boolean;
};

function formatMacroValue(value: number, dense?: boolean) {
  return dense ? Math.round(value).toLocaleString() : value.toFixed(1);
}

export function MacroQuotaRow({
  label,
  unit,
  consumed,
  target,
  remaining,
  dense,
}: MacroQuotaRowProps) {
  const percent = quotaPercent(consumed, target);
  const unitLabel = unit.trim();

  if (dense) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2 text-[11px] leading-none">
          <span className="shrink-0 font-medium text-zinc-700">{label}</span>
          <span className="min-w-0 truncate text-right tabular-nums text-zinc-500">
            {formatMacroValue(consumed, true)}
            {unitLabel ? ` ${unitLabel}` : unit}
            <span className="text-zinc-300"> / </span>
            {formatMacroValue(target, true)}
            {unitLabel ? ` ${unitLabel}` : unit}
            <span className="text-zinc-400"> · {percent}%</span>
          </span>
        </div>
        <Progress
          value={percent}
          className="w-full gap-0 [&_[data-slot=progress-track]]:h-2"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-semibold text-zinc-900">{label}</span>
        <span className="text-xs tabular-nums text-zinc-500">
          {consumed.toFixed(1)} {unitLabel} / {target.toFixed(1)} {unitLabel}
        </span>
      </div>
      <Progress value={percent} />
      <p className="text-[11px] text-zinc-400">
        เหลือ {remaining.toFixed(1)} {unitLabel} · {percent}%
      </p>
    </div>
  );
}
