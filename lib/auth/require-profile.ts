import { getCurrentProfile } from "./get-current-profile";

export async function requireCurrentProfile() {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error("กรุณาตั้งค่าโปรไฟล์ก่อน");
  }
  return profile;
}
