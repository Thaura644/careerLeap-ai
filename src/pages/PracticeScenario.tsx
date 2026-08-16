import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Crown,
  Hourglass,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApiError, apiGet, apiPost } from "@/lib/api";
import { cn } from "@/lib/utils";

type ScenarioStep = { title: string; detail: string };

type ScenarioDetail = {
  slug: string;
  title: string;
  type: "CASE_STUDY" | "PROJECT" | "INTERVIEW_PREP" | "EXAM_PREP";
  difficulty: string;
  category: string;
  estMinutes: string;
  summary: string;
  description: string;
  trial: boolean;
  access: "open" | "locked";
  steps: ScenarioStep[];
  completedSteps: number[];
};

const TYPE_LABEL: Record<ScenarioDetail["type"], string> = {
  CASE_STUDY: "Case study",
  PROJECT: "Build project",
  INTERVIEW_PREP: "Interview prep",
  EXAM_PREP: "Exam & test prep",
};

const PracticeScenario = () => {
  const { slug = "" } = useParams();
  const [detail, setDetail] = useState<ScenarioDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    setDetail(null);
    setError(null);
    setForbidden(false);
    apiGet<ScenarioDetail>(`/practice/scenarios/${slug}`)
      .then(setDetail)
      .catch((e) => {
        // The backend 403s non-trial scenarios for free accounts — show the
        // upgrade gate instead of a generic failure.
        if (e instanceof ApiError && (e.status === 403 || e.code === "forbidden")) {
          setForbidden(true);
        } else {
          setError(e.message || "Could not load this scenario.");
        }
      });
    apiGet<{ pro: boolean }>("/payments/me")
      .then((d) => setIsPro(Boolean(d.pro)))
      .catch(() => setIsPro(false));
  }, [slug]);

  const locked = forbidden || (detail?.access === "locked" && !isPro);
  const done = (detail?.completedSteps || []).length;
  const total = detail?.steps.length ?? 0;
  const complete = total > 0 && done >= total;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <Link
          to="/practice"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to practice
        </Link>

        {!detail && !error && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading scenario…
          </div>
        )}

        {error && (
          <Card>
            <CardContent className="p-6 text-sm text-red-500">{error}</CardContent>
          </Card>
        )}

        {locked && !detail && (
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/85 p-8 text-center backdrop-blur-[2px]">
              <Lock className="h-8 w-8 text-leap-purple" />
              <h3 className="text-lg font-semibold">This scenario is a Pro perk</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Unlock the full real-world practice library — every case study,
                build project, and prep track. Free users get one trial scenario
                per category.
              </p>
              <Link to="/upgrade">
                <Button className="bg-leap-purple hover:bg-leap-purple/90">
                  <Crown className="mr-2 h-4 w-4" /> Upgrade to Pro
                </Button>
              </Link>
            </div>
            <div className="space-y-4 p-6 opacity-40" aria-hidden="true">
              <p className="text-sm text-muted-foreground">
                This scenario is part of the Pro library. Upgrade to read the
                full brief and work through its steps.
              </p>
            </div>
          </Card>
        )}

        {detail && (
          <>
            <div className="mb-6">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-leap-purple/10 px-2.5 py-1 text-xs font-medium text-leap-purple">
                  <Sparkles className="h-3.5 w-3.5" />
                  {TYPE_LABEL[detail.type]}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {detail.difficulty}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {detail.category}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  <Hourglass className="h-3.5 w-3.5" />
                  {detail.estMinutes}
                </span>
                {detail.trial && (
                  <span className="rounded-full bg-leap-teal/15 px-2 py-0.5 text-xs font-medium text-leap-teal dark:text-leap-teal">
                    Free trial
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold leading-tight">{detail.title}</h1>
            </div>

            {locked ? (
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/85 p-8 text-center backdrop-blur-[2px]">
                  <Lock className="h-8 w-8 text-leap-purple" />
                  <h3 className="text-lg font-semibold">This scenario is a Pro perk</h3>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Unlock the full real-world practice library — every case study,
                    build project, and prep track. Free users get one trial scenario
                    per category.
                  </p>
                  <Link to="/upgrade">
                    <Button className="bg-leap-purple hover:bg-leap-purple/90">
                      <Crown className="mr-2 h-4 w-4" /> Upgrade to Pro
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4 p-6 opacity-40" aria-hidden="true">
                  <p className="text-sm text-muted-foreground">{detail.summary}</p>
                  <div className="space-y-2">
                    {detail.steps.slice(0, 4).map((s) => (
                      <div key={s.title} className="flex items-center gap-2 text-sm">
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">{s.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <>
                <Card className="mb-6">
                  <CardContent className="p-5">
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                      {detail.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Progress */}
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {complete ? (
                        <span className="inline-flex items-center gap-1.5 text-green-500">
                          <CheckCircle2 className="h-4 w-4" /> Scenario complete — nice work!
                        </span>
                      ) : (
                        <>
                          {done} of {total} steps done
                        </>
                      )}
                    </span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        complete ? "bg-green-500" : "bg-leap-purple"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-2">
                  {detail.steps.map((step, i) => {
                    const isDone = (detail.completedSteps || []).includes(i);
                    return (
                      <Card
                        key={i}
                        className={cn(
                          "transition-colors",
                          isDone && "border-green-500/40 bg-green-500/[0.04]"
                        )}
                      >
                        <CardContent className="flex items-start gap-3 p-4">
                          <button
                            type="button"
                            aria-pressed={isDone}
                            aria-label={`Mark step ${i + 1} as ${isDone ? "not done" : "done"}`}
                            disabled={toggling === i}
                            onClick={async () => {
                              setToggling(i);
                              try {
                                const res = await apiPost<{ completedSteps: number[] }>(
                                  `/practice/scenarios/${slug}/steps/${i}`,
                                  {}
                                );
                                setDetail({ ...detail, completedSteps: res.completedSteps });
                              } catch (e) {
                                console.error(e);
                              } finally {
                                setToggling(null);
                              }
                            }}
                            className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-leap-purple disabled:opacity-50"
                          >
                            {toggling === i ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : isDone ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <p className={cn("font-medium", isDone && "text-muted-foreground line-through")}>
                              <span className="mr-1.5 text-xs text-muted-foreground">{i + 1}.</span>
                              {step.title}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {complete && (
                  <Card className="mt-6 border-leap-teal/40 bg-leap-teal/[0.05]">
                    <CardContent className="flex items-center gap-3 p-5">
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
                      <div>
                        <p className="font-medium">Scenario complete</p>
                        <p className="text-sm text-muted-foreground">
                          You worked the whole brief. Add it to your portfolio or notes —
                          and pick your next real-world challenge.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PracticeScenario;
