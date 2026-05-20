import { TdeeProfileForm } from "@/app/settings/components/tdee-profile-form";
import { ProfileSummary } from "@/app/settings/components/profile-summary";
import { SettingsHeader } from "@/app/settings/components/settings-header";
import { getProfileBySession } from "@/lib/data/profile";
import { getSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const sessionId = await getSessionId();
  const profile = sessionId ? await getProfileBySession(sessionId) : null;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <SettingsHeader />
      {profile ? <ProfileSummary profile={profile} /> : null}
      <TdeeProfileForm profile={profile} />
    </div>
  );
}
