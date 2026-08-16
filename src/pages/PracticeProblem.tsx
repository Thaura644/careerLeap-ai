import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import { oneDark } from "@codemirror/theme-one-dark";
import { ArrowLeft, CheckCircle2, Crown, Loader2, Play, Send, Sparkles, XCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/api";

type SampleCase = { call: string; expected: string };
type PracticeDetail = {
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: string;
  signature: string;
  description: string;
  starterCode: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  solved: boolean;
  recommended?: boolean;
  reason?: string | null;
  samples: SampleCase[];
};

type JudgeResult = {
  verdict: "ACCEPTED" | "WRONG_ANSWER" | "COMPILE_ERROR" | "RUNTIME_ERROR" | "TIME_LIMIT_EXCEEDED";
  passed: number;
  total: number;
  runtimeMs: number;
  detail: string | null;
  cases?: { case: string; ok: boolean; runtimeMs: number; actual?: string; expected?: string; error?: string }[];
  solved?: boolean;
};

const verdictStyle: Record<string, string> = {
  ACCEPTED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  WRONG_ANSWER: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  COMPILE_ERROR: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  RUNTIME_ERROR: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  TIME_LIMIT_EXCEEDED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const PracticeProblem = () => {
  const { slug = "" } = useParams();
  const [problem, setProblem] = useState<PracticeDetail | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [running, setRunning] = useState<"run" | "submit" | null>(null);
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiGet<PracticeDetail>(`/practice/problems/${slug}`)
      .then((d) => {
        if (cancelled) return;
        setProblem(d);
        setCode(d.starterCode);
      })
      .catch((err) => {
        if (cancelled) return;
        // The backend 403s explore-pool problems for free accounts — treat
        // that as the locked state rather than a generic failure.
        if (String(err instanceof Error ? err.message : err).toLowerCase().includes("explore")) {
          setLocked(true);
        } else {
          setError("Could not load this problem. Try again in a moment.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    apiGet<{ pro: boolean }>("/payments/me")
      .then((d) => {
        if (!cancelled) setIsPro(Boolean(d.pro));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const judge = async (kind: "run" | "submit") => {
    if (!code.trim()) return;
    setRunning(kind);
    setResult(null);
    setError(null);
    try {
      const res = await apiPost<JudgeResult>(`/practice/problems/${slug}/${kind}`, { code });
      setResult(res);
      if (res.solved && problem) setProblem({ ...problem, solved: true });
    } catch (err) {
      if (String(err instanceof Error ? err.message : err).toLowerCase().includes("explore")) {
        setLocked(true);
      } else {
        setError("The judge did not respond. Try again in a moment.");
      }
    }
    setRunning(null);
  };

  // A problem in the explore pool is Pro-only — show the upgrade gate instead
  // of the editor (mirrors the lock on the Practice list page).
  const isLocked = locked || (!isPro && problem?.recommended === false);
  if (isLocked) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Link to="/practice" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> All problems
          </Link>
          <Card className="mx-auto max-w-md p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-leap-purple/10">
              <Crown className="h-6 w-6 text-leap-purple" />
            </div>
            <h1 className="text-xl font-bold">This problem is for Pro members</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {problem ? problem.title : "This problem"} is part of the explore pool — beyond
              your roadmap's recommendations. Upgrade to Pro to open it.
            </p>
            <Link to="/upgrade" className="mt-6 block">
              <Button className="w-full bg-leap-purple hover:bg-leap-purple/90">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </Link>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <Link to="/practice" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> All problems
        </Link>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {problem && (
          <>
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold">{problem.title}</h1>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                  {problem.difficulty}
                </span>
                <span className="text-xs text-muted-foreground">{problem.category}</span>
                {problem.recommended && problem.reason && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-leap-purple/10 px-2 py-0.5 text-[11px] font-medium text-leap-purple">
                    <Sparkles className="h-3 w-3" />
                    {problem.reason}
                  </span>
                )}
                {problem.solved && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" /> Solved
                  </span>
                )}
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{problem.signature}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Problem statement */}
              <div className="rounded-lg border bg-card p-5 text-sm leading-relaxed whitespace-pre-wrap">
                {problem.description}
                {problem.samples.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold mb-2">Examples</p>
                    {problem.samples.map((s, i) => (
                      <pre key={i} className="rounded-md bg-muted p-3 text-xs overflow-x-auto mb-2">
                        <span className="text-muted-foreground">Input:</span>{" "}
                        <code className="font-mono">{s.call.replace(/^Solution\.\w+\(/, "").replace(/\)$/, "")}</code>
                        {"\n"}
                        <span className="text-muted-foreground">Output:</span>{" "}
                        <code className="font-mono">{s.expected}</code>
                      </pre>
                    ))}
                  </div>
                )}
              </div>

              {/* Editor + results */}
              <div className="flex flex-col gap-3">
                <div className="rounded-lg border overflow-hidden">
                  <CodeMirror
                    value={code}
                    height="380px"
                    theme={oneDark}
                    extensions={[java()]}
                    onChange={(v) => setCode(v)}
                    basicSetup={{ lineNumbers: true, highlightActiveLine: true, indentOnInput: true }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => judge("run")} disabled={!!running}>
                    {running === "run" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                    Run
                  </Button>
                  <Button onClick={() => judge("submit")} disabled={!!running}>
                    {running === "submit" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Submit
                  </Button>
                  <span className="ml-auto text-xs text-muted-foreground self-center">
                    {problem.timeLimitMs}ms · {problem.memoryLimitMb}MB
                  </span>
                </div>

                {result && (
                  <div className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${verdictStyle[result.verdict] || ""}`}>
                        {result.verdict.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {result.passed} / {result.total} passed
                      </span>
                      {result.runtimeMs > 0 && (
                        <span className="text-xs text-muted-foreground">{result.runtimeMs}ms</span>
                      )}
                    </div>
                    {result.detail && (
                      <pre className="mt-3 whitespace-pre-wrap text-xs text-muted-foreground bg-muted rounded-md p-3 overflow-x-auto">
                        {result.detail}
                      </pre>
                    )}
                    {result.cases && result.cases.length > 0 && result.verdict !== "ACCEPTED" && (
                      <div className="mt-3 grid gap-1.5">
                        {result.cases.map((c) => (
                          <div key={c.case} className="flex items-start gap-2 text-xs">
                            {c.ok ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                            )}
                            <span className="text-muted-foreground">Case {Number(c.case) + 1}:</span>
                            {c.error ? (
                              <span className="text-red-500 break-all">{c.error}</span>
                            ) : (
                              <span className="text-muted-foreground break-all">
                                got <code className="font-mono">{c.actual}</code>, expected{" "}
                                <code className="font-mono">{c.expected}</code>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {result.verdict === "ACCEPTED" && (
                      <p className="mt-3 text-sm font-medium text-green-600 dark:text-green-400">
                        All test cases passed — this solution is correct.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PracticeProblem;
