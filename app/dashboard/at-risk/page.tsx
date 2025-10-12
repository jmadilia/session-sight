import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AtRiskClientsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch at-risk clients
  const atRiskResponse = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
      "/rest/v1",
      ""
    )}/api/at-risk-clients`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const atRiskData = atRiskResponse.ok
    ? await atRiskResponse.json()
    : { atRiskClients: [], totalAtRisk: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h1 className="text-3xl font-bold tracking-tight text-red-700 dark:text-red-400">
            At-Risk Clients
          </h1>
        </div>
        <p className="text-muted-foreground">
          Clients showing patterns that may indicate disengagement or risk of
          dropping out
        </p>
      </div>

      {atRiskData.totalAtRisk === 0 ? (
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  No At-Risk Clients
                </h3>
                <p className="text-muted-foreground">
                  All your active clients are showing healthy engagement
                  patterns
                </p>
              </div>
              <Button
                asChild
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {atRiskData.atRiskClients.map((client: any) => (
            <Card
              key={client.id}
              className={`${
                client.riskLevel === "high"
                  ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10"
                  : "border-orange-300 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/10"
              }`}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        client.riskLevel === "high"
                          ? "bg-red-100 dark:bg-red-900/30"
                          : "bg-orange-100 dark:bg-orange-900/30"
                      }`}>
                      <AlertTriangle
                        className={`h-5 w-5 ${
                          client.riskLevel === "high"
                            ? "text-red-600"
                            : "text-orange-600"
                        }`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{client.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            client.riskLevel === "high"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                          }`}>
                          {client.riskLevel.toUpperCase()} RISK
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Risk Score: {client.riskScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 w-full sm:w-auto">
                    <Link href={`/dashboard/clients/${client.id}`}>
                      View Client Details
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">
                      Risk Factors:
                    </h4>
                    <ul className="space-y-2">
                      {client.riskFactors.map((factor: string, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm">
                          <span
                            className={`mt-0.5 ${
                              client.riskLevel === "high"
                                ? "text-red-500"
                                : "text-orange-500"
                            }`}>
                            •
                          </span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Last Session
                      </p>
                      <p className="font-medium text-sm">
                        {client.lastSessionDate
                          ? new Date(
                              client.lastSessionDate
                            ).toLocaleDateString()
                          : "No sessions"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Recent Sessions
                      </p>
                      <p className="font-medium text-sm">
                        {client.recentSessionCount} (30 days)
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Cancellation Rate
                      </p>
                      <p className="font-medium text-sm">
                        {client.cancellationRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

