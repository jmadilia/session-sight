import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { PracticeSettingsForm } from "@/components/settings/practice-settings-form";
import { NotificationSettingsForm } from "@/components/settings/notification-settings-form";
import { AccountSettingsForm } from "@/components/settings/account-settings-form";
import { BillingForm } from "@/components/settings/billing-form";

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

  // Fetch billing data
  const { data: billing } = await supabase
    .from("billing")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and practice settings
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and professional credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettingsForm
                profile={profile}
                therapist={therapist}
                userId={user.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Practice Settings</CardTitle>
              <CardDescription>
                Configure your practice details and default session settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PracticeSettingsForm therapist={therapist} userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettingsForm
                therapist={therapist}
                userId={user.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account security and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountSettingsForm userEmail={user.email || ""} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your subscription plan and view usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Current Plan</p>
                  <p className="text-2xl font-bold">Practice Plan</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                For detailed billing information, we're building out the full
                billing management page.
              </p>
              <BillingForm billing={billing} userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
