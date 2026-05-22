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
