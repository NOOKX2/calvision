import { Progress } from "@/components/ui/progress";
import { quotaPercent } from "@/lib/nutrition/quota";

type MacroQuotaRowProps = {
  label: string;
  unit: string;
  consumed: number;
  target: number;
  remaining: number;
};

export function MacroQuotaRow({
  label,
  unit,
  consumed,
  target,
  remaining,
}: MacroQuotaRowProps) {
  const percent = quotaPercent(consumed, target);

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-semibold text-zinc-900">{label}</span>
        <span className="text-xs tabular-nums text-zinc-500">
          {consumed.toFixed(1)}
          {unit} / {target.toFixed(1)}
          {unit}
        </span>
      </div>
      <Progress value={percent} />
      <p className="text-[11px] text-zinc-400">
        เหลือ {remaining.toFixed(1)}
        {unit} · {percent}%
      </p>
    </div>
  );
}
