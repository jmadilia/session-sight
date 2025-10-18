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
import { Plus, ArrowLeft, Target, Calendar, TrendingUp } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TreatmentPlansPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch client
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("therapist_id", user.id)
    .single();

  if (!client) {
    redirect("/dashboard/clients");
  }

  // Fetch treatment plans with goals
  const { data: treatmentPlans } = await supabase
    .from("treatment_plans")
    .select(
      `
      *,
      goals (
        id,
        title,
        status,
        progress_percentage,
        priority
      )
    `
    )
    .eq("client_id", id)
    .order("created_at", { ascending: false });

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-600 text-white dark:bg-red-600 dark:text-white";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "low":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/clients/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Treatment Plans</h1>
            <p className="text-muted-foreground">
              {client.first_name} {client.last_name}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/clients/${id}/treatment-plans/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Treatment Plan
          </Link>
        </Button>
      </div>

      {!treatmentPlans || treatmentPlans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No treatment plans yet
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Create a treatment plan to start tracking goals and progress for
              this client.
            </p>
            <Button asChild>
              <Link href={`/dashboard/clients/${id}/treatment-plans/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Treatment Plan
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {treatmentPlans.map((plan: any) => {
            const totalGoals = plan.goals?.length || 0;
            const completedGoals =
              plan.goals?.filter((g: any) => g.status === "completed").length ||
              0;
            const avgProgress =
              totalGoals > 0
                ? Math.round(
                    plan.goals.reduce(
                      (sum: number, g: any) =>
                        sum + (g.progress_percentage || 0),
                      0
                    ) / totalGoals
                  )
                : 0;

            return (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{plan.title}</CardTitle>
                        <Badge className={getStatusColor(plan.status)}>
                          {plan.status.replace("_", " ")}
                        </Badge>
                      </div>
                      {plan.description && (
                        <CardDescription>{plan.description}</CardDescription>
                      )}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/dashboard/clients/${id}/treatment-plans/${plan.id}`}>
                        View Details
                      </Link>
                    </Button>
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
                        <span className="text-muted-foreground">
                          Overall Progress
                        </span>
                        <span className="font-medium">{avgProgress}%</span>
                      </div>
                      <Progress value={avgProgress} className="h-2" />
                    </div>
                  )}

                  {plan.goals && plan.goals.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Active Goals:</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.goals.slice(0, 3).map((goal: any) => (
                          <Badge
                            key={goal.id}
                            variant="outline"
                            className={getPriorityColor(goal.priority)}>
                            {goal.title}
                          </Badge>
                        ))}
                        {plan.goals.length > 3 && (
                          <Badge variant="outline" className="bg-muted">
                            +{plan.goals.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

