"use client";

import { cn } from "@/lib/utils";

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
        return "bg-red-600 text-white dark:bg-red-600 dark:text-white";
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
        return "bg-red-600 text-white dark:bg-red-600 dark:text-white";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-lg focus-within:ring-2 focus-within:ring-ring">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">{goal.title}</CardTitle>
              <Badge
                className={cn(
                  getPriorityColor(goal.priority),
                  "transition-colors duration-200"
                )}>
                {goal.priority}
              </Badge>
              <Badge
                className={cn(
                  getStatusColor(goal.status),
                  "transition-colors duration-200"
                )}>
                {goal.status.replace("_", " ")}
              </Badge>
            </div>
            {goal.description && (
              <CardDescription>{goal.description}</CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              aria-label={`Edit ${goal.title}`}
              className="hover:scale-110 transition-transform duration-200">
              <Link
                href={`/dashboard/clients/${clientId}/treatment-plans/${planId}/goals/${goal.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              aria-label={
                expanded ? "Collapse goal details" : "Expand goal details"
              }
              aria-expanded={expanded}
              className="hover:scale-110 transition-transform duration-200">
              {expanded ? (
                <ChevronUp className="h-4 w-4 transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
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
          <Progress
            value={goal.progress_percentage}
            className="h-2"
            aria-label={`Goal progress: ${goal.progress_percentage}%`}
          />
        </div>

        {goal.target_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-muted-foreground">Target Date:</span>
            <span className="font-medium">
              {new Date(goal.target_date).toLocaleDateString()}
            </span>
          </div>
        )}

        {expanded && (
          <div className="space-y-4 pt-4 border-t animate-fade-in">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Interventions</h4>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  aria-label="Add new intervention">
                  <Link
                    href={`/dashboard/clients/${clientId}/treatment-plans/${planId}/goals/${goal.id}/interventions/new`}>
                    <Plus className="mr-1 h-3 w-3" aria-hidden="true" />
                    Add
                  </Link>
                </Button>
              </div>
              {!goal.interventions || goal.interventions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No interventions added yet
                </p>
              ) : (
                <ul className="space-y-2" role="list">
                  {goal.interventions.map((intervention: any) => (
                    <li
                      key={intervention.id}
                      className="text-sm border-l-2 border-primary/20 pl-3 transition-colors duration-200 hover:border-primary/40">
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
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  aria-label="Add new progress update">
                  <Link
                    href={`/dashboard/clients/${clientId}/treatment-plans/${planId}/goals/${goal.id}/progress/new`}>
                    <Plus className="mr-1 h-3 w-3" aria-hidden="true" />
                    Add
                  </Link>
                </Button>
              </div>
              {!goal.progress_updates || goal.progress_updates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No progress updates yet
                </p>
              ) : (
                <ul className="space-y-2" role="list">
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
                        className="text-sm border-l-2 border-primary/20 pl-3 transition-colors duration-200 hover:border-primary/40">
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
