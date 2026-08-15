import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { useAI } from "@/context/AIContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/lib/api";

interface DashboardHeaderProps {
  onRoadmapGenerated?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onRoadmapGenerated }) => {
  const { userName, loading } = useDashboard();
  const { profile } = useAI();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      // Real call: regenerate the personalized roadmap from the user's profile.
      const res = await apiPost<{ roadmap?: { phases?: unknown[] }; source?: string }>(
        "/insights/roadmap",
        {
          currentRole: profile?.currentRole || undefined,
          targetRole: profile?.targetRole || undefined,
          timeframe: profile?.timeframe || undefined,
          industry: profile?.industry || undefined,
          yearsExperience: profile?.yearsExperience || undefined,
        }
      );
      const phases = res.roadmap?.phases?.length || 0;
      toast({
        title: "Roadmap generated",
        description:
          phases > 0
            ? `Your personalized roadmap is ready (${phases} phases).`
            : "Roadmap generated — open the My Roadmap tab to see it.",
      });
      onRoadmapGenerated?.();
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        {loading ? (
          <>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Welcome back, {userName}.
            </h1>
            <p className="text-muted-foreground">
              {profile?.targetRole
                ? `Working toward ${profile.targetRole}${profile.timeframe ? ` · ${profile.timeframe}` : ""}`
                : "Set your target role in onboarding to personalize your roadmap."}
            </p>
          </>
        )}
      </div>
      <Button
        className="bg-leap-purple hover:bg-leap-purple/90 shrink-0"
        onClick={handleGenerateReport}
        disabled={loading || generating}
      >
        {generating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            Regenerate Roadmap <ArrowUpRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};
