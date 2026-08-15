import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, BookCheck, Code2, Brain } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PracticeProgress {
  total?: number;
  solved?: number;
}

interface FlashcardStats {
  stats?: { total: number; due: number; learned: number };
}

/** Four real dashboard numbers — goals, resources, practice, flashcards.
 *  Nothing here is invented: empty accounts show honest zeros. */
export const DashboardStats: React.FC = () => {
  const { overviewCards, loading } = useDashboard();
  const [practice, setPractice] = useState<PracticeProgress>({});
  const [flashcards, setFlashcards] = useState<FlashcardStats["stats"] | null>(null);
  const [extrasLoading, setExtrasLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiGet<PracticeProgress>("/practice/progress").catch(() => ({})),
      apiGet<FlashcardStats>("/flashcards").catch(() => ({})),
    ]).then(([p, f]) => {
      if (cancelled) return;
      setPractice(p || {});
      setFlashcards(f?.stats || null);
      setExtrasLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const goalCard = overviewCards.find((c) => c.title === "Goal Progress");
  const resourcesCard = overviewCards.find((c) => c.title === "Resources Completed");
  const practiceSolved = practice.solved ?? 0;
  const practiceTotal = practice.total ?? 0;
  const flashDue = flashcards?.due ?? 0;
  const flashTotal = flashcards?.total ?? 0;

  const allLoading = loading || extrasLoading;

  const tiles = [
    {
      icon: Target,
      iconClass: "bg-leap-purple/10 text-leap-purple",
      label: "Goal Progress",
      value: goalCard?.value ?? "0%",
      sub: goalCard?.secondaryText ?? "Add a goal to get started",
    },
    {
      icon: BookCheck,
      iconClass: "bg-leap-teal/10 text-leap-teal",
      label: "Resources Completed",
      value: resourcesCard?.value ?? "0",
      sub: resourcesCard?.secondaryText ?? "Complete one to start your streak",
    },
    {
      icon: Code2,
      iconClass: "bg-blue-500/10 text-blue-500",
      label: "Practice Solved",
      value: practiceTotal > 0 ? `${practiceSolved}/${practiceTotal}` : "0",
      sub: practiceTotal > 0 ? "Real problems, real judge" : "Start solving in Practice",
    },
    {
      icon: Brain,
      iconClass: "bg-amber-500/10 text-amber-500",
      label: "Flashcards Due",
      value: String(flashDue),
      sub: flashTotal > 0 ? `${flashTotal} in your deck` : "Generate a deck to study",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {tiles.map((tile) => (
        <Card key={tile.label}>
          <CardContent className="p-4">
            {allLoading ? (
              <>
                <Skeleton className="h-10 w-10 rounded-full mb-3" />
                <Skeleton className="h-6 w-16 mb-1" />
                <Skeleton className="h-4 w-28" />
              </>
            ) : (
              <div className="flex items-start gap-3">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", tile.iconClass)}>
                  <tile.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground truncate">{tile.label}</p>
                  <p className="text-2xl font-bold leading-tight">{tile.value}</p>
                  <p className="text-xs text-muted-foreground truncate">{tile.sub}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
