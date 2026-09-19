import { useEffect, useState } from "react";
import { Sparkles, Loader2, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

type Submission = {
  responseText: string;
  score: number | null;
  overallFeedback: string | null;
  strengths: string[];
  gaps: string[];
  createdAt: string;
};

type PracticeItem = {
  id: number;
  type: string;
  title: string;
  prompt: string;
  context: string;
  expectedFormat: string;
  evaluationCriteria: string[];
  createdAt: string;
  submission?: Submission;
  gradingError?: string;
};

const humanizeType = (t: string) => t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * The real practice-generation engine: every exercise is built by the LLM
 * from the signed-in user's own profile — no fixed catalog, no assumption
 * that "practice" means a coding problem. See backend CustomPracticeService.
 */
export const CustomPracticeEngine = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<PracticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    apiGet<{ items: PracticeItem[] }>("/practice/custom")
      .then((res) => {
        setItems(res.items || []);
        if (!activeId && res.items?.length) setActiveId(res.items[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const active = items.find((i) => i.id === activeId) || null;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const item = await apiPost<PracticeItem>("/practice/custom/generate", {});
      setItems((prev) => [item, ...prev]);
      setActiveId(item.id);
      setResponse("");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not generate a practice exercise.";
      toast({ title: "Couldn't generate", description: message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!active || !response.trim()) return;
    setSubmitting(true);
    try {
      const updated = await apiPost<PracticeItem>(`/practice/custom/${active.id}/submit`, {
        response: response.trim(),
      });
      setItems((prev) => prev.map((i) => (i.id === active.id ? { ...i, ...updated } : i)));
      setResponse("");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not submit your response.";
      toast({ title: "Couldn't submit", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-8 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-edu-lavender text-edu-lavender-fg">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-marketing text-lg font-extrabold">Practice built for you</h2>
              <p className="text-sm text-muted-foreground">
                Generated from your actual profile and goal — not always coding. Real AI feedback on your response.
              </p>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="shrink-0 rounded-full bg-edu-indigo hover:bg-edu-indigo/90">
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate a new exercise
          </Button>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No exercises yet — generate one built around your target role and goal.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-[220px_1fr]">
            {/* Past exercises */}
            <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {items.map((i) => (
                <button
                  key={i.id}
                  onClick={() => { setActiveId(i.id); setResponse(""); }}
                  className={`shrink-0 rounded-2xl border p-3 text-left text-xs transition-colors lg:shrink ${
                    i.id === activeId ? "border-edu-indigo bg-edu-lavender/40" : "hover:bg-muted"
                  }`}
                >
                  <Badge variant="outline" className="mb-1 rounded-full text-[10px]">{humanizeType(i.type)}</Badge>
                  <p className="line-clamp-2 font-medium">{i.title}</p>
                  {i.submission && (
                    <p className="mt-1 flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" /> {i.submission.score ?? "—"}/100
                    </p>
                  )}
                </button>
              ))}
            </div>

            {/* Active exercise */}
            {active && (
              <div className="rounded-2xl border p-5">
                <div className="flex items-center justify-between gap-2">
                  <Badge className="rounded-full bg-edu-indigo/10 text-edu-indigo">{humanizeType(active.type)}</Badge>
                </div>
                <h3 className="mt-2 font-marketing text-xl font-extrabold">{active.title}</h3>
                {active.context && <p className="mt-1 text-sm text-muted-foreground">{active.context}</p>}
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{active.prompt}</p>
                {active.expectedFormat && (
                  <p className="mt-3 text-xs italic text-muted-foreground">{active.expectedFormat}</p>
                )}
                {active.evaluationCriteria?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      What a strong response includes
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {active.evaluationCriteria.map((c) => (
                        <li key={c} className="text-xs text-muted-foreground">• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {active.submission ? (
                  <div className="mt-5 rounded-2xl bg-muted/50 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Your response</p>
                      {active.submission.score !== null && (
                        <span className="rounded-full bg-edu-indigo px-3 py-1 text-xs font-semibold text-white">
                          {active.submission.score}/100
                        </span>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{active.submission.responseText}</p>
                    {active.submission.overallFeedback && (
                      <>
                        <p className="mt-4 text-sm">{active.submission.overallFeedback}</p>
                        {active.submission.strengths?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-emerald-600">Strengths</p>
                            <ul className="mt-1 space-y-1">
                              {active.submission.strengths.map((s) => (
                                <li key={s} className="text-xs text-muted-foreground">• {s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {active.submission.gaps?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-amber-600">To improve</p>
                            <ul className="mt-1 space-y-1">
                              {active.submission.gaps.map((g) => (
                                <li key={g} className="text-xs text-muted-foreground">• {g}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                    {active.gradingError && (
                      <p className="mt-3 flex items-center gap-2 text-xs text-destructive">
                        {active.gradingError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-5">
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder={active.expectedFormat || "Write your response…"}
                      rows={6}
                    />
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || !response.trim()}
                      className="mt-3 rounded-full bg-edu-coral hover:bg-edu-coral-dark"
                    >
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      Submit for feedback
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
