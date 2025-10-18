import { createServerClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Plus,
  Edit,
  Target,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { GoalCard } from "@/components/goal-card";

interface PageProps {
  params: Promise<{ id: string; planId: string }>;
}

export default async function TreatmentPlanDetailsPage({ params }: PageProps) {
  const { id, planId } = await params;
  console.log(
    "[v0] Treatment Plan Details Page - Client ID:",
    id,
    "Plan ID:",
    planId
  );

  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch treatment plan with goals, interventions, and progress updates
  const { data: plan, error } = await supabase
    .from("treatment_plans")
    .select(
      `
      *,
      goals (
        *,
        interventions (*),
        progress_updates (
          *
        )
      )
    `
    )
    .eq("id", planId)
    .eq("therapist_id", user.id)
    .single();

  console.log(
    "[v0] Treatment Plan Data:",
    plan ? "Found" : "Not found",
    "Error:",
    error
  );

  if (!plan) {
    console.log("[v0] No plan found, redirecting to treatment plans list");
    redirect(`/dashboard/clients/${id}/treatment-plans`);
  }

  // Fetch client
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "completed":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "discontinued":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
      case "on_hold":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const totalGoals = plan.goals?.length || 0;
  const completedGoals =
    plan.goals?.filter((g: any) => g.status === "completed").length || 0;
  const avgProgress =
    totalGoals > 0
      ? Math.round(
          plan.goals.reduce(
            (sum: number, g: any) => sum + (g.progress_percentage || 0),
            0
          ) / totalGoals
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/clients/${id}/treatment-plans`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{plan.title}</h1>
            <p className="text-muted-foreground">
              {client?.first_name} {client?.last_name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link
              href={`/dashboard/clients/${id}/treatment-plans/${planId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Plan
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link
              href={`/dashboard/clients/${id}/treatment-plans/${planId}/goals/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle>Treatment Plan Overview</CardTitle>
                <Badge className={getStatusColor(plan.status)}>
                  {plan.status.replace("_", " ")}
                </Badge>
              </div>
              {plan.description && (
                <CardDescription>{plan.description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Started:</span>
              <span className="font-medium">
                {new Date(plan.start_date).toLocaleDateString()}
              </span>
            </div>
            {plan.target_end_date && (
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Target:</span>
                <span className="font-medium">
                  {new Date(plan.target_end_date).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Goals:</span>
              <span className="font-medium">
                {completedGoals}/{totalGoals} completed
              </span>
            </div>
          </div>

          {totalGoals > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{avgProgress}%</span>
              </div>
              <Progress value={avgProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Goals</h2>
        </div>

        {!plan.goals || plan.goals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add goals to this treatment plan to start tracking progress.
              </p>
              <Button asChild>
                <Link
                  href={`/dashboard/clients/${id}/treatment-plans/${planId}/goals/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Goal
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {plan.goals.map((goal: any) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                clientId={id}
                planId={planId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

