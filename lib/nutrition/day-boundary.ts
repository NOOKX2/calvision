/** โควต้าและมื้ออาหาร "วันนี้" เริ่มนับใหม่เวลานี้ (เวลาเครื่องเซิร์ฟเวอร์) */
export const TRACKING_DAY_START_HOUR = 6;

/**
 * จุดเริ่มต้นของวันติดตามปัจจุบัน — reset อัตโนมัติเวลา 06:00
 * ก่อน 06:00 ยังถือว่าเป็นวันก่อนหน้า (เช่น 05:30 = ยังอยู่ในวันเมื่อวาน)
 */
export function getTrackingDayStart(now = new Date()): Date {
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    TRACKING_DAY_START_HOUR,
    0,
    0,
    0,
  );

  if (now < start) {
    start.setDate(start.getDate() - 1);
  }

  return start;
}

export function formatTrackingDayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getTrackingDayKey(loggedAt: Date) {
  return formatTrackingDayKey(getTrackingDayStart(loggedAt));
}

export function parseTrackingDayKey(dayKey: string) {
  const [y, m, d] = dayKey.split("-").map(Number);
  return new Date(y, m - 1, d, TRACKING_DAY_START_HOUR, 0, 0, 0);
}

export function getTrackingDayBounds(dayKey: string) {
  const start = parseTrackingDayKey(dayKey);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

/** เวลาบันทึกมื้อ — วันนี้ใช้เวลาปัจจุบัน วันอื่นใช้เที่ยงของวันนั้น (อยู่ในช่วง 06:00) */
export function loggedAtForTrackingDay(dayKey: string, now = new Date()) {
  if (dayKey === getTrackingDayKey(now)) {
    return now;
  }

  const loggedAt = new Date(parseTrackingDayKey(dayKey));
  loggedAt.setHours(12, 0, 0, 0);
  return loggedAt;
}

/** รายการ dayKey ย้อนหลัง (วันล่าสุดก่อน) */
export function getRecentTrackingDayKeys(count: number, now = new Date()) {
  const keys: string[] = [];
  let cursor = getTrackingDayStart(now);

  for (let i = 0; i < count; i++) {
    keys.push(formatTrackingDayKey(cursor));
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 1);
  }

  return keys;
}
