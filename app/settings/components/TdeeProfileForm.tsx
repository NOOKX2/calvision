"use client";

import { useActionState, useEffect, useState } from "react";

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

type FormFields = {
  sex: string;
  age: string;
  weightKg: string;
  heightCm: string;
  activityLevel: string;
  goal: string;
};

function profileToFields(profile: Profile | null): FormFields {
  return {
    sex: profile?.sex ?? "male",
    age: String(profile?.age ?? 25),
    weightKg: String(profile?.weightKg ?? 70),
    heightCm: String(profile?.heightCm ?? 170),
    activityLevel: profile?.activityLevel ?? "moderate",
    goal: profile?.goal ?? "maintain",
  };
}

function profileFieldsKey(profile: Profile | null) {
  if (!profile) return "new-profile";
  return `${profile.id}-${String(profile.updatedAt)}`;
}

export function TdeeProfileForm({ profile }: TdeeProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    saveProfile,
    initialState,
  );
  const [fields, setFields] = useState(() => profileToFields(profile));
  const fieldsKey = profileFieldsKey(profile);

  useEffect(() => {
    setFields(profileToFields(profile));
  }, [fieldsKey, profile]);

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
                value={fields.sex}
                onChange={(e) =>
                  setFields((prev) => ({ ...prev, sex: e.target.value }))
                }
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
                value={fields.age}
                onChange={(e) =>
                  setFields((prev) => ({ ...prev, age: e.target.value }))
                }
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
                value={fields.weightKg}
                onChange={(e) =>
                  setFields((prev) => ({ ...prev, weightKg: e.target.value }))
                }
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
                value={fields.heightCm}
                onChange={(e) =>
                  setFields((prev) => ({ ...prev, heightCm: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityLevel">ระดับกิจกรรม</Label>
            <select
              id="activityLevel"
              name="activityLevel"
              value={fields.activityLevel}
              onChange={(e) =>
                setFields((prev) => ({
                  ...prev,
                  activityLevel: e.target.value,
                }))
              }
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
              value={fields.goal}
              onChange={(e) =>
                setFields((prev) => ({ ...prev, goal: e.target.value }))
              }
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
