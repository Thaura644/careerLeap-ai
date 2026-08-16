import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Check, CheckCircle2, ExternalLink, Loader2, RefreshCw, Wrench, ArrowRight } from "lucide-react";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { useAI } from "@/context/AIContext";
import { Link } from "react-router-dom";
import { fetchCatalogMatch, CatalogLink, CatalogMatch } from "@/data/topicResourceCatalog";
import { cn } from "@/lib/utils";

interface RoadmapPhase {
  title: string;
  duration?: string;
  focus?: string;
  skills?: string[];
  milestones?: string[];
  resources?: { title: string; type?: string }[];
  references?: { label: string; url: string }[];
}

interface RoadmapResponse {
  source?: string;
  roadmap?: {
    summary?: string;
    phases?: RoadmapPhase[];
  };
}

interface RoadmapTabProps {
  refreshKey?: number;
}

/** Kind badge coloring for catalog links. */
const KIND_BADGE: Record<CatalogLink["kind"], string> = {
  Course: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Guide: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Article: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Video: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  Book: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  Practice: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  Tool: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  Community: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
};

/** One row in the segment panel: an external link with a mark-complete toggle.
 *  Clicking the check marks the resource complete (persisted per user); the
 *  row itself still opens the resource. */
const LinkRow: React.FC<{
  link: { title: string; url: string; kind?: CatalogLink["kind"] };
  note?: string;
  completed: boolean;
  onToggle: (url: string) => void;
}> = ({ link, note, completed, onToggle }) => (
  <div
    className={cn(
      "group flex items-start justify-between gap-2 rounded-md border p-3 transition-colors",
      completed
        ? "border-emerald-500/40 bg-emerald-500/5"
        : "hover:border-leap-purple/50 hover:bg-accent/50"
    )}
  >
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-w-0 flex-1 items-start justify-between gap-3"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "text-sm font-medium group-hover:text-leap-purple",
              completed && "text-muted-foreground line-through decoration-muted-foreground/50"
            )}
          >
            {link.title}
          </span>
          {link.kind && (
            <Badge variant="outline" className={cn("px-1.5 py-0 text-[10px] font-medium", KIND_BADGE[link.kind])}>
              {link.kind}
            </Badge>
          )}
        </div>
        {note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}
      </div>
      <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-leap-purple" />
    </a>
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(link.url);
      }}
      aria-pressed={completed}
      aria-label={completed ? `Mark ${link.title} as not complete` : `Mark ${link.title} as complete`}
      title={completed ? "Mark as not complete" : "Mark as complete"}
      className={cn(
        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
        completed
          ? "border-emerald-500 bg-emerald-500 text-white"
          : "border-border text-transparent hover:border-emerald-500 hover:text-emerald-500"
      )}
    >
      <Check className="h-3.5 w-3.5" />
    </button>
  </div>
);

export const RoadmapTab: React.FC<RoadmapTabProps> = ({ refreshKey = 0 }) => {
  const { profile } = useAI();
  const [roadmap, setRoadmap] = useState<RoadmapResponse["roadmap"] | null>(null);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedUrls, setCompletedUrls] = useState<Set<string>>(new Set());
  const [progressError, setProgressError] = useState<string | null>(null);
  const [catalogMatch, setCatalogMatch] = useState<CatalogMatch | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  // Load the user's completed resource URLs once (URL-keyed progress for the
  // roadmap panel links — persisted per user, so it survives restarts).
  useEffect(() => {
    let cancelled = false;
    apiGet<{ completed?: string[] }>("/resources/progress")
      .then((res) => {
        if (!cancelled) setCompletedUrls(new Set(res.completed || []));
      })
      .catch(() => {
        if (!cancelled) setProgressError("Progress couldn't be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleComplete = useCallback((url: string) => {
    const wasCompleted = completedUrls.has(url);
    // Optimistic update — flip immediately, roll back if the server rejects.
    setCompletedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
    setProgressError(null);
    apiPut<{ completed?: boolean }>("/resources/progress", { url, completed: !wasCompleted })
      .catch(() => {
        setCompletedUrls((prev) => {
          const next = new Set(prev);
          if (next.has(url)) next.delete(url);
          else next.add(url);
          return next;
        });
        setProgressError("Couldn't save progress. Please try again.");
      });
  }, [completedUrls]);

  const loadRoadmap = () => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    // Load the saved roadmap first (instant, no LLM cost) — only generate a
    // fresh one when the user has none. This makes the dashboard fast instead
    // of burning an LLM call on every visit.
    const tryLoad = () => {
      apiGet<{ roadmap?: RoadmapResponse["roadmap"] }>("/insights/roadmap")
        .then((res) => {
          if (!cancelled) {
            if (res.roadmap?.phases?.length) {
              setRoadmap(res.roadmap);
              setLoading(false);
            } else {
              generate();
            }
          }
        })
        .catch(() => {
          if (!cancelled) generate();
        });
    };
    const generate = () => {
      if (cancelled) return;
      // Build the request from the user's real profile (saved during onboarding).
      // The backend merges whatever's missing with the user's saved profile, so
      // an empty profile still yields a real roadmap — just not one personalized
      // to role names the user never entered.
      const request = {
        currentRole: profile?.currentRole || undefined,
        targetRole: profile?.targetRole || undefined,
        timeframe: profile?.timeframe || undefined,
        industry: profile?.industry || undefined,
        yearsExperience: profile?.yearsExperience || undefined,
        focusAreas: profile?.interests?.length ? profile.interests.slice(0, 3) : undefined,
      };
      apiPost<RoadmapResponse>("/insights/roadmap", request)
        .then((res) => {
          if (!cancelled) {
            if (res.roadmap?.phases?.length) {
              setRoadmap(res.roadmap);
              setSelected(0);
            } else {
              setError("The roadmap came back empty. Please try again.");
            }
          }
        })
        .catch(() => {
          if (!cancelled) setError("Could not reach the server. It may be waking up — please retry.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };
    tryLoad();
    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    return loadRoadmap();
  }, [profile, refreshKey]);

  // Match the selected segment against the server-maintained topic catalog:
  // the backend owns both the catalog data and the matching logic, so the
  // roadmap.sh-style "click a segment, see its resources" works identically
  // for every client. Refetch when the phase or the roadmap changes.
  useEffect(() => {
    const phase = roadmap?.phases?.[Math.min(selected, (roadmap?.phases?.length || 1) - 1)];
    if (!phase) {
      setCatalogMatch(null);
      return;
    }
    let cancelled = false;
    setCatalogLoading(true);
    fetchCatalogMatch([phase.title, phase.focus, ...(phase.skills || [])].filter(Boolean).join(" "))
      .then((res) => {
        if (!cancelled) setCatalogMatch(res);
      })
      .catch(() => {
        if (!cancelled) setCatalogMatch(null);
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roadmap, selected]);

  // On small screens the detail panel sits below the spine, so bring it into
  // view when the user clicks a segment (roadmap.sh-style side-by-side on lg+).
  useEffect(() => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selected, roadmap]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating your personalized roadmap…
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={loadRoadmap}>
            <RefreshCw className="mr-2 h-3 w-3" />
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const phases = roadmap?.phases;
  if (phases?.length) {
    const activePhase = phases[Math.min(selected, phases.length - 1)];
    // The selected segment's catalog links come from the server (matched by
    // title/focus/skills in TopicCatalogService); null while loading or on error.
    const catalogResources = catalogMatch?.resources || [];
    const catalogTools = catalogMatch?.tools || [];
    // All trackable resource rows in this segment (catalog links + roadmap refs).
    const resourceRows = [
      ...catalogResources.map((l) => ({ url: l.url, title: l.title })),
      ...(activePhase.references || []).map((r) => ({ url: r.url, title: r.label })),
    ];

    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div>
              <CardTitle>{roadmap.summary ? "Your Personalized Roadmap" : "Career Roadmap"}</CardTitle>
              {roadmap.summary && <CardDescription>{roadmap.summary}</CardDescription>}
              {roadmap.source && (
                <CardDescription className="text-xs">
                  Generated by the {roadmap.source === "llm" ? "AI model" : "Leap.ai engine"}
                </CardDescription>
              )}
            </div>
            <Link to="/onboarding">
              <Button variant="outline" size="sm">
                Update my profile
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6">
            {/* Roadmap spine — click a segment to see its resources (roadmap.sh style) */}
            <nav aria-label="Roadmap phases" className="space-y-0">
              {phases.map((phase, i) => {
                const isActive = i === Math.min(selected, phases.length - 1);
                const isLast = i === phases.length - 1;
                return (
                  <div key={phase.title + i} className="relative flex gap-3 pb-5">
                    {!isLast && (
                      <span
                        className={cn(
                          "absolute left-[15px] top-9 h-[calc(100%-28px)] w-px",
                          i < Math.min(selected, phases.length - 1) ? "bg-leap-purple" : "bg-border"
                        )}
                        aria-hidden="true"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setSelected(i)}
                      aria-pressed={isActive}
                      className={cn(
                        "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-medium transition-colors",
                        isActive
                          ? "border-leap-purple bg-leap-purple text-white shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:border-leap-purple hover:text-leap-purple"
                      )}
                    >
                      {i + 1}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelected(i)}
                      className={cn(
                        "min-w-0 flex-1 rounded-md border p-3 text-left transition-colors",
                        isActive
                          ? "border-leap-purple bg-leap-purple/5"
                          : "border-transparent hover:border-border hover:bg-accent/40"
                      )}
                    >
                      <span className={cn("block text-sm font-medium", isActive ? "text-leap-purple" : "")}>
                        {phase.title}
                      </span>
                      {phase.duration && (
                        <span className="mt-0.5 block text-xs text-muted-foreground">{phase.duration}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </nav>

            {/* Detail panel for the selected segment */}
            <div ref={detailRef} className="rounded-lg border bg-card p-5" aria-live="polite">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h3 className="font-semibold leading-snug">{activePhase.title}</h3>
                {activePhase.duration && (
                  <span className="text-xs font-medium text-muted-foreground">{activePhase.duration}</span>
                )}
              </div>

              {activePhase.focus && (
                <p className="mt-1.5 text-sm text-muted-foreground">{activePhase.focus}</p>
              )}

              {activePhase.skills?.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {activePhase.skills.map((skill) => (
                    <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : null}

              {activePhase.milestones?.length ? (
                <ul className="mt-4 space-y-1.5">
                  {activePhase.milestones.map((milestone) => (
                    <li key={milestone} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-leap-purple shrink-0" />
                      {milestone}
                    </li>
                  ))}
                </ul>
              ) : null}

              {/* Resources & tools linked to this segment */}
              {catalogLoading && (
                <p className="mt-5 flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Finding resources for this phase…
                </p>
              )}
              {!catalogLoading && (catalogResources.length > 0 || activePhase.references?.length) && (
                <div className="mt-5 border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-4 w-4 text-leap-purple" />
                    <h4 className="text-sm font-semibold">Resources for this phase</h4>
                    {resourceRows.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {completedUrls.size > 0 && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {resourceRows.filter((r) => completedUrls.has(r.url)).length} of {resourceRows.length} complete
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  {progressError && <p className="mb-2 text-xs text-destructive">{progressError}</p>}
                  <div className="space-y-2">
                    {catalogResources.map((link) => (
                      <LinkRow
                        key={link.url}
                        link={link}
                        note={link.note}
                        completed={completedUrls.has(link.url)}
                        onToggle={toggleComplete}
                      />
                    ))}
                    {activePhase.references?.map((ref) => (
                      <LinkRow
                        key={ref.url}
                        link={{ title: ref.label, url: ref.url }}
                        note="Referenced by your roadmap"
                        completed={completedUrls.has(ref.url)}
                        onToggle={toggleComplete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!catalogLoading && catalogTools.length > 0 && (
                <div className="mt-5 border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="h-4 w-4 text-leap-purple" />
                    <h4 className="text-sm font-semibold">Tools to practice with</h4>
                  </div>
                  <div className="space-y-2">
                    {catalogTools.map((link) => (
                      <LinkRow
                        key={link.url}
                        link={link}
                        note={link.note}
                        completed={completedUrls.has(link.url)}
                        onToggle={toggleComplete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!catalogLoading && catalogResources.length === 0 && catalogTools.length === 0 && !activePhase.references?.length && (
                <div className="mt-5 border-t pt-4">
                  {activePhase.resources?.length ? (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="h-4 w-4 text-leap-purple" />
                        <h4 className="text-sm font-semibold">Resources for this phase</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {activePhase.resources.map((r) => r.title).join(" · ")}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No curated links for this phase yet — check the{" "}
                      <Link to="/resources" className="text-leap-purple hover:underline inline-flex items-center">
                        full library <ArrowRight className="ml-0.5 h-3 w-3" />
                      </Link>
                      .
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Honest empty state — the API succeeded but returned nothing usable.
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Career Roadmap</CardTitle>
        <CardDescription>Your personalized career path</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          We couldn't build a roadmap yet. Make sure your profile has a target role, then try again.
        </p>
        <div className="flex gap-3">
          <Link to="/onboarding">
            <Button size="sm">Update my profile</Button>
          </Link>
          <Button variant="outline" size="sm" onClick={loadRoadmap}>
            <RefreshCw className="mr-2 h-3 w-3" />
            Try again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
