import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Code2, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet } from "@/lib/api";

type PracticeProblem = {
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: string;
  signature: string;
  solved: boolean;
  lastVerdict: string | null;
};

const difficultyColor: Record<string, string> = {
  EASY: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  HARD: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const Practice = () => {
  const [problems, setProblems] = useState<PracticeProblem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ problems: PracticeProblem[] }>("/practice/problems")
      .then((d) => setProblems(d.problems))
      .catch(() => setError("Could not load practice problems. Try again in a moment."));
  }, []);

  const solvedCount = problems?.filter((p) => p.solved).length ?? 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Practice</h1>
          <p className="text-muted-foreground">
            Real coding problems with hidden test cases — the judge runs your Java
            against them, so "solved" means the code actually passes.
          </p>
        </div>

        {problems && (
          <div className="mb-6 flex items-center gap-3 text-sm text-muted-foreground">
            <Code2 className="h-4 w-4" />
            <span>
              {solvedCount} / {problems.length} solved
            </span>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {!problems && !error && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading problems…
          </div>
        )}

        <div className="grid gap-3">
          {problems?.map((p) => (
            <Link key={p.slug} to={`/practice/${p.slug}`}>
              <Card className="hover:border-leap-purple transition-colors">
                <CardContent className="flex items-center gap-4 p-4">
                  {p.solved ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  ) : (
                    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground truncate font-mono">
                      {p.signature}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyColor[p.difficulty]}`}>
                    {p.difficulty}
                  </span>
                  <span className="hidden sm:block shrink-0 text-xs text-muted-foreground">
                    {p.category}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Practice;
