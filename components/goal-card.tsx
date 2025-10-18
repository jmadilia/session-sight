"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Plus, Calendar, Edit } from "lucide-react";
import Link from "next/link";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  priority: string;
  status: string;
  progress_percentage: number;
  interventions?: any[];
  progress_updates?: any[];
}

interface GoalCardProps {
  goal: Goal;
  clientId: string;
  planId: string;
}

export function GoalCard({ goal, clientId, planId }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "low":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "in_progress":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "not_started":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
      case "discontinued":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">{goal.title}</CardTitle>
              <Badge className={getPriorityColor(goal.priority)}>
                {goal.priority}
              </Badge>
              <Badge className={getStatusColor(goal.status)}>
                {goal.status.replace("_", " ")}
              </Badge>
            </div>
            {goal.description && (
              <CardDescription>{goal.description}</CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link
                href={`/dashboard/clients/${clientId}/treatment-plans/${planId}/goals/${goal.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}>
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{goal.progress_percentage}%</span>
          </div>
          <Progress value={goal.progress_percentage} className="h-2" />
        </div>

        {goal.target_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Target Date:</span>
            <span className="font-medium">
              {new Date(goal.target_date).toLocaleDateString()}
            </span>
          </div>
        )}

        {expanded && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Interventions</h4>
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/dashboard/clients/${clientId}/treatment-plans/${planId}/goals/${goal.id}/interventions/new`}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Link>
                </Button>
              </div>
              {!goal.interventions || goal.interventions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No interventions added yet
                </p>
              ) : (
                <ul className="space-y-2">
                  {goal.interventions.map((intervention: any) => (
                    <li
                      key={intervention.id}
                      className="text-sm border-l-2 border-primary/20 pl-3">
                      <p className="font-medium">{intervention.title}</p>
                      {intervention.description && (
                        <p className="text-muted-foreground text-xs">
                          {intervention.description}
                        </p>
                      )}
                      {intervention.frequency && (
                        <p className="text-muted-foreground text-xs">
                          Frequency: {intervention.frequency}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Progress Updates</h4>
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/dashboard/clients/${clientId}/treatment-plans/${planId}/goals/${goal.id}/progress/new`}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Link>
                </Button>
              </div>
              {!goal.progress_updates || goal.progress_updates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No progress updates yet
                </p>
              ) : (
                <ul className="space-y-2">
                  {goal.progress_updates
                    .sort(
                      (a: any, b: any) =>
                        new Date(b.update_date).getTime() -
                        new Date(a.update_date).getTime()
                    )
                    .slice(0, 3)
                    .map((update: any) => (
                      <li
                        key={update.id}
                        className="text-sm border-l-2 border-primary/20 pl-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {new Date(update.update_date).toLocaleDateString()}
                          </p>
                          {update.progress_rating && (
                            <Badge variant="outline" className="text-xs">
                              {update.progress_rating}/5
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs mt-1">{update.progress_note}</p>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

