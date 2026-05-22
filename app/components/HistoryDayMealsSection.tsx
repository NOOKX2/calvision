"use client";

import { useEffect, useRef } from "react";

import { HistoryMealsCard } from "@/app/components/AddManualMealForm";
import type { MealLog } from "@/lib/db/schema";

type HistoryDayMealsSectionProps = {
  selectedDay: string;
  title: string;
  description: string;
  emptyMessage: string;
  meals: MealLog[];
};

export function HistoryDayMealsSection({
  selectedDay,
  title,
  description,
  emptyMessage,
  meals,
}: HistoryDayMealsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.location.hash.includes("day-meals")) return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;

    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedDay]);

  const dayLabel = title.replace(/^มื้อ — /, "");

  const editHint =
    meals.length > 0
      ? `${description} · เพิ่มมื้อ (รูป AI หรือกรอกมือ)`
      : `${description} · เพิ่มมื้อด้วยรูป AI หรือกรอกมือ`;

  return (
    <section
      ref={sectionRef}
      id="day-meals"
      className="scroll-mt-20 lg:scroll-mt-0"
      aria-label="รายการมื้อของวันที่เลือก"
    >
      <HistoryMealsCard
        trackingDay={selectedDay}
        dayLabel={dayLabel}
        meals={meals}
        title={title}
        description={editHint}
        emptyMessage={emptyMessage}
      />
    </section>
  );
}
