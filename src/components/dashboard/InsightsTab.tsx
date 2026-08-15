import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2, Route, TrendingUp, ListChecks } from "lucide-react";
import { apiGet } from "@/lib/api";
import { Link } from "react-router-dom";

interface InsightsResponse {
  topSkillGap: string;
  marketTrend: string;
  recommendedPath: string[];
  hasRoadmap: boolean;
}

export const InsightsTab: React.FC = () => {
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiGet<InsightsResponse>("/insights")
      .then((data) => {
        if (!cancelled) setInsights(data);
      })
      .catch(() => {
        if (!cancelled) setInsights(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Career Insights</CardTitle>
        <CardDescription>Derived from your profile, roadmap, and goals</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing your career data…
          </div>
        ) : !insights ? (
          <div className="py-10 text-center text-muted-foreground">
            <p className="text-sm">Could not load insights right now. Please try again.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start p-4 bg-leap-purple/5 dark:bg-leap-purple/10 rounded-lg">
              <div className="bg-leap-purple/10 dark:bg-leap-purple/20 p-2 rounded-full text-leap-purple mr-3">
                <Lightbulb size={20} />
              </div>
              <div>
                <h3 className="font-medium mb-1">Top skill gap</h3>
                <p className="text-sm text-muted-foreground">
                  {insights.topSkillGap || "Complete your profile to get a skill-gap analysis."}
                </p>
              </div>
            </div>

            <div className="flex items-start p-4 bg-leap-teal/5 dark:bg-leap-teal/10 rounded-lg">
              <div className="bg-leap-teal/10 dark:bg-leap-teal/20 p-2 rounded-full text-leap-teal mr-3">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="font-medium mb-1">From the library right now</h3>
                <p className="text-sm text-muted-foreground">{insights.marketTrend}</p>
              </div>
            </div>

            <div className="flex items-start p-4 bg-amber-500/5 dark:bg-amber-500/10 rounded-lg">
              <div className="bg-amber-500/10 dark:bg-amber-500/20 p-2 rounded-full text-amber-500 mr-3">
                <ListChecks size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Recommended next steps</h3>
                {insights.recommendedPath?.length ? (
                  <ul className="space-y-1.5">
                    {insights.recommendedPath.map((step) => (
                      <li key={step} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Generate a roadmap to get concrete next steps.
                  </p>
                )}
              </div>
            </div>

            {!insights.hasRoadmap && (
              <div className="flex items-start p-4 border rounded-lg bg-muted/40">
                <div className="bg-muted p-2 rounded-full text-muted-foreground mr-3">
                  <Route size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">No roadmap yet</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Insights get sharper once your personalized roadmap exists.
                  </p>
                  <Link to="/onboarding">
                    <Button size="sm" variant="outline">
                      Set up my profile
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 border rounded-lg bg-muted/50">
          <h3 className="font-medium mb-2">Deeper analysis with Pro</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Pro unlocks unlimited AI conversations and the full insight depth.
          </p>
          <Link to="/upgrade">
            <Button variant="default" size="sm" className="bg-leap-purple hover:bg-leap-purple/90">
              See Pro pricing
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
