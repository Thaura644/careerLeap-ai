import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, BookOpen, ExternalLink, Layers, Loader2, RefreshCw, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  fetchTopicCatalog,
  CatalogLink,
  TopicCatalogEntry,
} from "@/data/topicResourceCatalog";
import { cn } from "@/lib/utils";

/** Kind badge coloring for catalog links (matches the roadmap panel). */
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

const LinkCard: React.FC<{ link: CatalogLink }> = ({ link }) => (
  <a
    href={link.url}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-start justify-between gap-3 rounded-md border p-3 transition-colors hover:border-leap-purple/50 hover:bg-accent/50"
  >
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-sm font-medium group-hover:text-leap-purple">{link.title}</span>
        <Badge variant="outline" className={cn("px-1.5 py-0 text-[10px] font-medium", KIND_BADGE[link.kind])}>
          {link.kind}
        </Badge>
      </div>
      {link.note && <p className="mt-0.5 text-xs text-muted-foreground">{link.note}</p>}
    </div>
    <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-leap-purple" />
  </a>
);

/** The same curated topic catalog the roadmap segments link to, browsable with
 *  topic filters: "All" shows every topic as a card; picking one filters to
 *  that topic's resources and tools. */
export const TopicCatalogSection: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<string>("ALL");
  const [catalog, setCatalog] = useState<TopicCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    // The catalog is maintained on the server (TopicCatalogService) and shared
    // by every client — this section just renders whatever the server serves.
    fetchTopicCatalog()
      .then((topics) => {
        if (!cancelled) {
          setCatalog(topics);
          // Apply any deep link (e.g. /resources#topic=System+design) once the
          // catalog is known, so the hash can be validated against real topics.
          const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const topic = params.get("topic");
          if (topic && topics.some((t) => t.topic === topic)) {
            setActiveTopic(topic);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setError("The topic catalog couldn't be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => loadCatalog(), [loadCatalog]);

  // Support deep links like /resources#topic=System+design so a topic's
  // resources can be shared directly (the selection also syncs to the hash).
  useEffect(() => {
    const readHash = () => {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const topic = params.get("topic");
      if (topic && catalog.some((t) => t.topic === topic)) {
        setActiveTopic(topic);
      }
    };
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, [catalog]);

  const selectTopic = (topic: string) => {
    setActiveTopic(topic);
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (topic === "ALL") {
      params.delete("topic");
    } else {
      params.set("topic", topic);
    }
    const next = params.toString();
    window.history.replaceState(null, "", next ? `#${next}` : window.location.pathname);
  };

  const selected: TopicCatalogEntry | null = useMemo(
    () =>
      activeTopic === "ALL"
        ? null
        : catalog.find((t) => t.topic === activeTopic) || null,
    [activeTopic, catalog]
  );

  return (
    <Card className="mb-8">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5 text-leap-purple" />
          <div>
            <h2 className="text-lg font-semibold leading-tight">Topic catalog</h2>
            <p className="text-sm text-muted-foreground">
              The same curated resources and tools that power your roadmap — browse by topic.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading the topic catalog…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={loadCatalog}>
              <RefreshCw className="mr-2 h-3 w-3" />
              Try again
            </Button>
          </div>
        ) : (
          <>
            {/* Topic filters */}
            <div className="flex flex-wrap gap-1.5">
              <FilterChip active={activeTopic === "ALL"} onClick={() => selectTopic("ALL")}>
                All topics
              </FilterChip>
              {catalog.map((entry) => (
                <FilterChip
                  key={entry.topic}
                  active={activeTopic === entry.topic}
                  onClick={() => selectTopic(entry.topic)}
                >
                  {entry.topic}
                </FilterChip>
              ))}
            </div>

            {selected ? (
          /* One topic: its resources and tools */
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-leap-purple" />
                <h3 className="text-sm font-semibold">Resources</h3>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  {selected.resources.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {selected.resources.map((link) => (
                  <LinkCard key={link.url} link={link} />
                ))}
              </div>
            </div>
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-leap-purple" />
                <h3 className="text-sm font-semibold">Tools</h3>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  {selected.tools.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {selected.tools.map((link) => (
                  <LinkCard key={link.url} link={link} />
                ))}
              </div>
            </div>
          </div>
          ) : (
            /* All topics: a grid of topic cards */
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.map((entry) => (
              <button
                key={entry.topic}
                type="button"
                onClick={() => selectTopic(entry.topic)}
                className="group rounded-md border p-4 text-left transition-colors hover:border-leap-purple/50 hover:bg-accent/40"
              >
                <p className="font-medium group-hover:text-leap-purple">{entry.topic}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.resources.length} resources · {entry.tools.length} tools
                </p>
              </button>
            ))}
            </div>
          )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

const FilterChip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({
  active,
  onClick,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "rounded-full border px-3 py-1 text-xs transition-colors",
      active
        ? "border-leap-purple bg-leap-purple text-white"
        : "border-border text-muted-foreground hover:border-leap-purple hover:text-leap-purple"
    )}
  >
    {children}
  </button>
);
