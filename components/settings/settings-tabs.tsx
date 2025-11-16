"use client";

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
import { useSearchParams } from "next/navigation";

interface SettingsTabsProps {
  profile: any;
  therapist: any;
  userId: string;
  userEmail: string;
}

export function SettingsTabs({
  profile,
  therapist,
  userId,
  userEmail,
}: SettingsTabsProps) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";

  return (
    <Tabs defaultValue={defaultTab} className="space-y-4">
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
              userId={userId}
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
            <PracticeSettingsForm therapist={therapist} userId={userId} />
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
            <NotificationSettingsForm therapist={therapist} userId={userId} />
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
            <AccountSettingsForm userEmail={userEmail} />
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
            <BillingForm />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
