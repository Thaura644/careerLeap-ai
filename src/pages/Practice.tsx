import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Code2,
  Crown,
  GraduationCap,
  Hourglass,
  Loader2,
  Lock,
  MapPin,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";

type PracticeProblem = {
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: string;
  signature: string;
  solved: boolean;
  lastVerdict: string | null;
  recommended?: boolean;
  reason?: string | null;
};

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

const difficultyColor: Record<string, string> = {
  EASY: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  HARD: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

type PracticeScenario = {
  slug: string;
  title: string;
  type: "CASE_STUDY" | "PROJECT" | "INTERVIEW_PREP" | "EXAM_PREP";
  difficulty: string;
  category: string;
  estMinutes: string;
  summary: string;
  trial: boolean;
  access: "open" | "locked";
  stepCount?: number;
  completedSteps?: number[];
};

const SCENARIO_TYPE_META: Record<
  PracticeScenario["type"],
  { label: string; icon: React.ComponentType<{ className?: string }>; blurb: string }
> = {
  CASE_STUDY: {
    label: "Case study",
    icon: Briefcase,
    blurb: "Real-world cases: diagnose incidents, design systems, and make product calls.",
  },
  PROJECT: {
    label: "Build project",
    icon: Target,
    blurb: "Ship real things — from a CLI tool to a production-shaped API — step by step.",
  },
  INTERVIEW_PREP: {
    label: "Interview prep",
    icon: ClipboardList,
    blurb: "Get ready for the interview: behavioral stories, system-design mocks, negotiation.",
  },
  EXAM_PREP: {
    label: "Exam & test prep",
    icon: GraduationCap,
    blurb: "Get ready here for exams, certifications, and assessments — with practice questions.",
  },
};

const ScenarioCard: React.FC<{ scenario: PracticeScenario; isPro: boolean }> = ({ scenario, isPro }) => {
  const meta = SCENARIO_TYPE_META[scenario.type];
  const Icon = meta.icon;
  const locked = scenario.access === "locked" && !isPro;
  const done = (scenario.completedSteps || []).length;
  const complete = scenario.stepCount && done >= scenario.stepCount;

  const body = (
    <Card
      className={cn(
        "flex h-full flex-col transition-colors",
        locked ? "opacity-70" : "hover:border-leap-purple",
        scenario.trial && !locked && "border-leap-teal/40"
      )}
    >
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-leap-purple/10 px-2.5 py-1 text-xs font-medium text-leap-purple">
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
          </span>
          {locked ? (
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {scenario.difficulty}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-semibold leading-snug">{scenario.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{scenario.category}</p>
        </div>
        <p className="flex-1 text-sm text-muted-foreground">{scenario.summary}</p>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Hourglass className="h-3.5 w-3.5" />
            {scenario.estMinutes}
          </span>
          {!locked && scenario.stepCount ? (
            complete ? (
              <span className="inline-flex items-center gap-1 font-medium text-green-500">
                <CheckCircle2 className="h-3.5 w-3.5" /> Complete
              </span>
            ) : done > 0 ? (
              <span className="font-medium text-leap-purple">
                {done}/{scenario.stepCount} steps
              </span>
            ) : (
              <span>{scenario.stepCount} steps</span>
            )
          ) : (
            <span className="inline-flex items-center gap-1">
              <Crown className="h-3.5 w-3.5" /> Pro
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (locked) return body;
  return <Link to={`/practice/scenario/${scenario.slug}`}>{body}</Link>;
};

const ProblemRow: React.FC<{ problem: PracticeProblem; locked?: boolean }> = ({ problem, locked }) => {
  const row = (
    <Card
      className={cn(
        "transition-colors",
        locked ? "opacity-60" : "hover:border-leap-purple",
        problem.recommended && "border-leap-purple/40 bg-leap-purple/[0.03]"
      )}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {problem.solved ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
        ) : (
          <span className="h-5 w-5 shrink-0 rounded-full border-2 border-muted" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn("font-medium truncate", locked && "text-muted-foreground")}>{problem.title}</p>
            {locked && <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
            {problem.recommended && problem.reason && (
              <span className="inline-flex items-center gap-1 rounded-full bg-leap-purple/10 px-2 py-0.5 text-[10px] font-medium text-leap-purple">
                <Sparkles className="h-3 w-3" />
                {problem.reason}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate font-mono">{problem.signature}</p>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", difficultyColor[problem.difficulty])}>
          {problem.difficulty}
        </span>
        <span className="hidden sm:block shrink-0 text-xs text-muted-foreground">{problem.category}</span>
      </CardContent>
    </Card>
  );

  if (locked) return row;
  return <Link to={`/practice/${problem.slug}`}>{row}</Link>;
};

const Practice = () => {
  const [problems, setProblems] = useState<PracticeProblem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [proChecked, setProChecked] = useState(false);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<string>("ALL");
  const [category, setCategory] = useState<string>("ALL");

  useEffect(() => {
    apiGet<{ problems: PracticeProblem[] }>("/practice/problems")
      .then((d) => setProblems(d.problems))
      .catch(() => setError("Could not load practice problems. Try again in a moment."));
    apiGet<{ pro: boolean }>("/payments/me")
      .then((d) => setIsPro(Boolean(d.pro)))
      .catch(() => setIsPro(false))
      .finally(() => setProChecked(true));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    problems?.forEach((p) => set.add(p.category));
    return Array.from(set).sort();
  }, [problems]);

  const filter = (list: PracticeProblem[]) =>
    list.filter((p) => {
      if (difficulty !== "ALL" && p.difficulty !== difficulty) return false;
      if (category !== "ALL" && p.category !== category) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [p.title, p.category, p.signature, p.reason || ""].join(" ").toLowerCase().includes(q);
    });

  const recommended = useMemo(() => (problems || []).filter((p) => p.recommended), [problems]);
  const explore = useMemo(() => (problems || []).filter((p) => !p.recommended), [problems]);
  const solvedCount = problems?.filter((p) => p.solved).length ?? 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Practice</h1>
          <p className="text-muted-foreground">
            Real coding problems with hidden test cases — the judge runs your Java against
            them, so "solved" means the code actually passes.
          </p>
        </div>

        {problems && (
          <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Code2 className="h-4 w-4" />
              {solvedCount} / {problems.length} solved
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-leap-purple" />
              {recommended.length} recommended for your roadmap
            </span>
          </div>
        )}

        {/* LeetCode-style filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search problems…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {["ALL", ...DIFFICULTIES].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  difficulty === d
                    ? "border-leap-purple bg-leap-purple text-white"
                    : "border-border text-muted-foreground hover:border-leap-purple hover:text-leap-purple"
                )}
              >
                {d === "ALL" ? "All" : d.charAt(0) + d.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          {categories.length > 1 && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">All topics</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {!problems && !error && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading problems…
          </div>
        )}

        <ScenarioSections />

        {problems && (
          <div className="space-y-8">
            {/* Recommended — the practices your roadmap needs */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-leap-purple" />
                <h2 className="text-lg font-semibold">Recommended for your roadmap</h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                These problems map to the skills in your generated roadmap — the practice
                that matters most right now.
              </p>
              {recommended.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">
                    Generate your roadmap first — problems tied to its skills will appear
                    here.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {filter(recommended).map((p) => (
                    <ProblemRow key={p.slug} problem={p} />
                  ))}
                  {filter(recommended).length === 0 && (
                    <p className="text-sm text-muted-foreground">No recommended problems match your filters.</p>
                  )}
                </div>
              )}
            </section>

            {/* Explore — the rest, Pro-gated */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Code2 className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Explore more areas</h2>
                {!isPro && (
                  <span className="rounded-full bg-leap-purple px-2 py-0.5 text-[10px] font-medium text-white">
                    PRO
                  </span>
                )}
              </div>

              {!proChecked ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking your plan…
                </div>
              ) : !isPro ? (
                <Card className="relative overflow-hidden">
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/85 p-8 text-center backdrop-blur-[2px]">
                    <Crown className="h-8 w-8 text-leap-purple" />
                    <h3 className="text-lg font-semibold">Unlock every problem</h3>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      Explore problems beyond your roadmap — harder topics, new areas, and
                      the full library. Upgrade to Pro to open them.
                    </p>
                    <Link to="/upgrade">
                      <Button className="bg-leap-purple hover:bg-leap-purple/90">
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                      </Button>
                    </Link>
                  </div>
                  <div className="grid gap-3 opacity-40" aria-hidden="true">
                    {explore.slice(0, 4).map((p) => (
                      <ProblemRow key={p.slug} problem={p} locked />
                    ))}
                  </div>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {filter(explore).map((p) => (
                    <ProblemRow key={p.slug} problem={p} />
                  ))}
                  {filter(explore).length === 0 && (
                    <p className="text-sm text-muted-foreground">No explore problems match your filters.</p>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const ScenarioSections: React.FC = () => {
  const [scenarios, setScenarios] = useState<PracticeScenario[] | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [proChecked, setProChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ scenarios: PracticeScenario[] }>("/practice/scenarios")
      .then((d) => setScenarios(d.scenarios))
      .catch(() => setError("Could not load real-world scenarios. Try again in a moment."));
    apiGet<{ pro: boolean }>("/payments/me")
      .then((d) => setIsPro(Boolean(d.pro)))
      .catch(() => setIsPro(false))
      .finally(() => setProChecked(true));
  }, []);

  const byType = (type: PracticeScenario["type"]) =>
    (scenarios || []).filter((s) => s.type === type);

  const typeSection = (
    type: PracticeScenario["type"],
    heading: string,
    blurb: string
  ) => {
    const list = byType(type);
    if (!scenarios) return null;
    return (
      <section className="space-y-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            {React.createElement(SCENARIO_TYPE_META[type].icon, { className: "h-4 w-4 text-leap-purple" })}
            {heading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
        </div>
        {list.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No {heading.toLowerCase()} available yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((s) => (
              <ScenarioCard key={s.slug} scenario={s} isPro={isPro} />
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="mb-10 space-y-8">
      {/* Real-world practice — case studies + build projects */}
      <section className="space-y-3">
        <div className="mb-3 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-leap-purple" />
          <h2 className="text-xl font-semibold">Practice in the real world</h2>
          {!isPro && proChecked && (
            <span className="rounded-full bg-leap-purple px-2 py-0.5 text-[10px] font-medium text-white">
              SOME FREE
            </span>
          )}
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Not just snippets — guided real-world scenarios. Work through a case study like a
          consultant, or build a project you can actually ship. Try one free; the full set is
          a Pro perk.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {typeSection(
            "CASE_STUDY",
            "Case studies",
            "Diagnose real incidents, design systems, and make product calls — with a guided brief."
          )}
          {typeSection(
            "PROJECT",
            "Build projects",
            "From a CLI tool to a production-shaped API: real deliverables, step by step."
          )}
        </div>
      </section>

      {/* Interview & exam prep */}
      <section className="space-y-6">
        <div className="mb-3 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-leap-purple" />
          <h2 className="text-xl font-semibold">Preparing for an interview? Or an exam or test?</h2>
          {!isPro && proChecked && (
            <span className="rounded-full bg-leap-purple px-2 py-0.5 text-[10px] font-medium text-white">
              SOME FREE
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Get ready here — structured prep tracks for interviews, certifications, and
          assessments. Each one is a guided plan you work through, with progress that
          actually saves.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {typeSection(
            "INTERVIEW_PREP",
            "Interview prep",
            "Behavioral stories, system-design mocks, coding days, and negotiation rehearsal."
          )}
          {typeSection(
            "EXAM_PREP",
            "Exam & test prep",
            "SQL exams, certifications, whiteboard tests, and assessment-center questions."
          )}
        </div>
      </section>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {!scenarios && !error && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading real-world scenarios…
        </div>
      )}
    </div>
  );
};

export default Practice;
