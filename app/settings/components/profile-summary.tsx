import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatGoalLabel } from "@/lib/nutrition/tdee";
import type { Profile } from "@/lib/db/schema";
import type { Goal } from "@/lib/nutrition/types";

type ProfileSummaryProps = {
  profile: Profile;
};

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  return (
    <Card className="bg-zinc-50/50">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">สรุปเป้าหมายปัจจุบัน</CardTitle>
        <Badge variant="secondary" className="rounded-full">
          {formatGoalLabel(profile.goal as Goal)}
        </Badge>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          <div>
            <dt className="text-[11px] text-zinc-400">TDEE</dt>
            <dd className="mt-1 text-lg font-bold tabular-nums text-zinc-900">
              {profile.tdee}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-zinc-400">เป้า kcal</dt>
            <dd className="mt-1 text-lg font-bold tabular-nums text-zinc-900">
              {profile.targetKcal}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-zinc-400">โปรตีน</dt>
            <dd className="mt-1 text-lg font-bold tabular-nums text-zinc-900">
              {profile.targetProteinG}g
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-zinc-400">คาร์บ / ไขมัน</dt>
            <dd className="mt-1 text-sm font-bold tabular-nums text-zinc-900">
              {profile.targetCarbsG}g / {profile.targetFatG}g
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
