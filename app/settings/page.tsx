import { TdeeProfileForm } from "@/app/settings/components/TdeeProfileForm";
import { ProfileSummary } from "@/app/settings/components/ProfileSummary";
import { SettingsHeader } from "@/app/settings/components/SettingsHeader";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <SettingsHeader />
      {profile ? <ProfileSummary profile={profile} /> : null}
      <TdeeProfileForm profile={profile} />
    </div>
  );
}
