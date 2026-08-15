import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  Lightbulb,
  Crown,
  FileText,
  TrendingUp,
  ListChecks,
  MessageSquare,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { AIProFeatures } from "@/components/ai/AIProFeatures";
import { AIEnterpriseFeatures } from "@/components/ai/AIEnterpriseFeatures";
import { apiGet, apiPost } from "@/lib/api";
import { useAI } from "@/context/AIContext";
import { useToast } from "@/hooks/use-toast";

interface InsightsResponse {
  topSkillGap: string;
  marketTrend: string;
  recommendedPath: string[];
  hasRoadmap: boolean;
}

const AIInsights = () => {
  const { toast } = useToast();
  const { profile } = useAI();
  const [prompt, setPrompt] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [generating, setGenerating] = useState(false);

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
        if (!cancelled) setInsightsLoading(false);
      });
    apiGet<{ pro: boolean }>("/payments/me")
      .then((me) => {
        if (!cancelled) setIsPro(Boolean(me.pro));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAskAI = async () => {
    if (!prompt.trim() || asking) return;
    setAsking(true);
    setAnswer(null);
    try {
      const res = await apiPost<{ response: string; source: string }>("/ai/chat", { prompt });
      setAnswer(res.response);
    } catch {
      toast({
        title: "Could not reach the AI",
        description: "The server may be waking up. Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setAsking(false);
    }
  };

  const handleGenerateReport = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const res = await apiPost<{ roadmap?: { phases?: unknown[] } }>("/insights/roadmap", {
        currentRole: profile?.currentRole || undefined,
        targetRole: profile?.targetRole || undefined,
        timeframe: profile?.timeframe || undefined,
        industry: profile?.industry || undefined,
        yearsExperience: profile?.yearsExperience || undefined,
      });
      toast({
        title: "Roadmap generated",
        description: `Your personalized roadmap is ready (${res.roadmap?.phases?.length || 0} phases).`,
      });
    } catch {
      toast({
        title: "Could not generate the roadmap",
        description: "The server may be waking up. Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">AI Insights</h1>
            <p className="text-muted-foreground">Personalized career guidance from your real data</p>
          </div>
          <Button
            className="bg-leap-purple hover:bg-leap-purple/90"
            onClick={handleGenerateReport}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                Regenerate Roadmap <ArrowUpRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Quick Career Question</CardTitle>
            <CardDescription>Ask the AI about your career journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Ask a question about your career path, skills, or industry trends..."
                className="min-h-24"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              {answer && (
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm whitespace-pre-wrap">{answer}</p>
                </div>
              )}
              <div className="flex flex-col xs:flex-row gap-3 justify-between">
                <p className="text-sm text-muted-foreground">
                  Answers are grounded in your roadmap, goals, and the library.
                </p>
                <Button disabled={!prompt.trim() || asking} onClick={handleAskAI}>
                  {asking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking…
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" /> Ask AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="insights" className="space-y-4">
          <TabsList>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="career">Career Analysis</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Personalized Insights</CardTitle>
                <CardDescription>Derived from your profile, roadmap, and goals</CardDescription>
              </CardHeader>
              <CardContent>
                {insightsLoading ? (
                  <div className="flex items-center justify-center py-10 text-muted-foreground">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing your career data…
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
                  </div>
                )}
              </CardContent>
            </Card>

            <AIProFeatures isPro={isPro} />
          </TabsContent>

          <TabsContent value="career" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Career Skills Analysis</CardTitle>
                <CardDescription>Honest status — assessments aren't built yet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium mb-1">No skill scores to show</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    We don't run skill assessments yet, so we won't invent percentages. Your roadmap
                    focus areas and completed resources are the real signals we track today.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex flex-col items-start">
                <p className="text-sm text-muted-foreground mb-3">
                  Pro unlocks the full insight depth as it ships.
                </p>
                <Link to="/upgrade">
                  <Button className="bg-leap-purple hover:bg-leap-purple/90">
                    <Crown className="mr-2 h-4 w-4" />
                    See Pro pricing
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>AI Reports</CardTitle>
                <CardDescription>Your personalized career roadmap</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
                  <h3 className="font-medium mt-2">
                    {insights?.hasRoadmap ? "Your roadmap exists" : "No report generated yet"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    {insights?.hasRoadmap
                      ? "Open the My Roadmap tab on your dashboard to see your personalized roadmap."
                      : "Generate a comprehensive roadmap from your profile, skills, and goals."}
                  </p>
                  <Button onClick={handleGenerateReport} disabled={generating}>
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" /> Generate Roadmap
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AIEnterpriseFeatures />
      </div>
    </DashboardLayout>
  );
};

export default AIInsights;
