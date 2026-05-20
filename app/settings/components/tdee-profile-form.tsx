"use client";

import { useActionState } from "react";

import {
  saveProfile,
  type ProfileActionState,
} from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/lib/db/schema";
import { appleSelect } from "@/lib/ui-classes";

const initialState: ProfileActionState = { ok: false };

type TdeeProfileFormProps = {
  profile: Profile | null;
};

export function TdeeProfileForm({ profile }: TdeeProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    saveProfile,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>คำนวณ TDEE</CardTitle>
        <CardDescription>
          เลือก Bulk หรือ Cut เพื่อกำหนดแคลอรี่เป้าหมายและโมครองค์ประจำวัน
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sex">เพศ</Label>
              <select
                id="sex"
                name="sex"
                defaultValue={profile?.sex ?? "male"}
                className={appleSelect}
              >
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">อายุ (ปี)</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min={10}
                max={100}
                defaultValue={profile?.age ?? 25}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weightKg">น้ำหนัก (kg)</Label>
              <Input
                id="weightKg"
                name="weightKg"
                type="number"
                step="0.1"
                min={1}
                defaultValue={profile?.weightKg ?? 70}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heightCm">ส่วนสูง (cm)</Label>
              <Input
                id="heightCm"
                name="heightCm"
                type="number"
                step="0.1"
                min={1}
                defaultValue={profile?.heightCm ?? 170}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityLevel">ระดับกิจกรรม</Label>
            <select
              id="activityLevel"
              name="activityLevel"
              defaultValue={profile?.activityLevel ?? "moderate"}
              className={appleSelect}
            >
              <option value="sedentary">นั่งทำงาน แทบไม่ออกกำลัง</option>
              <option value="light">ออกกำลังเบา 1–3 วัน/สัปดาห์</option>
              <option value="moderate">ปานกลาง 3–5 วัน/สัปดาห์</option>
              <option value="active">หนัก 6–7 วัน/สัปดาห์</option>
              <option value="very_active">หนักมาก / งานใช้แรง</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">เป้าหมาย</Label>
            <select
              id="goal"
              name="goal"
              defaultValue={profile?.goal ?? "maintain"}
              className={appleSelect}
            >
              <option value="bulk">Bulk — เพิ่ม +400 kcal จาก TDEE</option>
              <option value="cut">Cut — ลด −400 kcal จาก TDEE</option>
              <option value="maintain">Maintain — คงที่ตาม TDEE</option>
            </select>
          </div>

          {state.message ? (
            <p
              className={
                state.ok ? "text-xs text-emerald-600" : "text-xs text-red-500"
              }
            >
              {state.message}
            </p>
          ) : null}

          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? "กำลังคำนวณ..." : "บันทึกและคำนวณ TDEE"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
