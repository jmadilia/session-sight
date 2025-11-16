import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch therapist data
  const { data: therapist } = await supabase
    .from("therapists")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and practice settings
        </p>
      </div>

      <SettingsTabs
        profile={profile}
        therapist={therapist}
        userId={user.id}
        userEmail={user.email || ""}
      />
    </div>
  );
}
