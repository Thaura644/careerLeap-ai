import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CornerDownLeft, ArrowUpDown, FileText, LayoutDashboard, BookOpen, Users, Lightbulb, Settings, Crown, X, Code2, Brain } from "lucide-react";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";

type PageResult = {
  type: "page";
  title: string;
  subtitle: string;
  to: string;
  icon: React.ElementType;
};

type ResourceResult = {
  type: "resource";
  title: string;
  subtitle: string;
  to: string;
};

type Result = PageResult | ResourceResult;

const PAGES: PageResult[] = [
  { type: "page", title: "Dashboard", subtitle: "Your roadmap and progress", to: "/dashboard", icon: LayoutDashboard },
  { type: "page", title: "Resources", subtitle: "Learning library", to: "/resources", icon: BookOpen },
  { type: "page", title: "Practice", subtitle: "Coding problems with a real judge", to: "/practice", icon: Code2 },
  { type: "page", title: "Flashcards", subtitle: "Spaced-repetition study cards", to: "/flashcards", icon: Brain },
  { type: "page", title: "Community", subtitle: "Groups and discussions", to: "/community", icon: Users },
  { type: "page", title: "AI Insights", subtitle: "Skill gaps and recommendations", to: "/insights", icon: Lightbulb },
  { type: "page", title: "Settings", subtitle: "Profile and account", to: "/settings", icon: Settings },
  { type: "page", title: "Upgrade to Pro", subtitle: "Unlimited roadmaps and more", to: "/upgrade", icon: Crown },
];

/** Opens the global search palette from anywhere (e.g. the sidebar input). */
export const openGlobalSearch = () => {
  window.dispatchEvent(new CustomEvent("leap:opensearch"));
};

const isTypingTarget = (el: EventTarget | null): boolean => {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
};

export const GlobalSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [resources, setResources] = useState<ResourceResult[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load the library once per session for resource search.
  useEffect(() => {
    if (!open || resources !== null) return;
    apiGet<{
      trendingResources?: { title: string; type: string }[];
      recommendedResources?: { title: string; type: string }[];
    }>("/resources")
      .then((data) => {
        const map = (r: { title: string; type: string }): ResourceResult => ({
          type: "resource",
          title: r.title,
          subtitle: `Resource · ${r.type}`,
          to: "/resources",
        });
        const list = [
          ...(data.trendingResources || []).map(map),
          ...(data.recommendedResources || []).map(map),
        ];
        setResources(list);
      })
      .catch(() => setResources([]));
  }, [open, resources]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "/" && !isTypingTarget(e.target)) {
        e.preventDefault();
        setQuery("");
        setOpen(true);
        return;
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const onOpen = () => {
      setQuery("");
      setOpen(true);
    };
    window.addEventListener("leap:opensearch", onOpen);
    return () => window.removeEventListener("leap:opensearch", onOpen);
  }, []);

  // Focus the input whenever the palette opens.
  useEffect(() => {
    if (open) {
      setHighlight(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery("");
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [...PAGES];
    }
    const pages = PAGES.filter((p) =>
      `${p.title} ${p.subtitle}`.toLowerCase().includes(q)
    );
    const res = (resources || []).filter((r) =>
      `${r.title} ${r.subtitle}`.toLowerCase().includes(q)
    );
    return [...pages, ...res].slice(0, 12);
  }, [query, resources]);

  const groups = useMemo(() => {
    const pages = results.filter((r) => r.type === "page");
    const res = results.filter((r) => r.type === "resource");
    const out: { label: string; items: Result[] }[] = [];
    if (pages.length) out.push({ label: "Pages", items: pages });
    if (res.length) out.push({ label: "Resources", items: res });
    return out;
  }, [results]);

  const flat = groups.flatMap((g) => g.items);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % Math.max(flat.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + Math.max(flat.length, 1)) % Math.max(flat.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flat[highlight];
      if (item) {
        setOpen(false);
        navigate(item.to);
      }
    }
  };

  if (!open) return null;

  let index = -1;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-xl border bg-background shadow-2xl">
        <div className="flex items-center gap-2 border-b px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlight(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search pages and resources…"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            onClick={() => setOpen(false)}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto py-2">
          {flat.length === 0 && (
            <div className="px-4 py-10 text-center">
              <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No results for “{query}” — try a page name or resource title.
              </p>
            </div>
          )}
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-4 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              {group.items.map((item) => {
                index += 1;
                const active = index === highlight;
                return (
                  <button
                    key={`${item.type}-${item.title}`}
                    type="button"
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => {
                      setOpen(false);
                      navigate(item.to);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left",
                      active ? "bg-accent text-accent-foreground" : "text-foreground"
                    )}
                  >
                    {item.type === "page" ? (
                      <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="flex-1">
                      <span className="block text-sm">{item.title}</span>
                      <span className="block text-xs text-muted-foreground">{item.subtitle}</span>
                    </span>
                    {active && <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 border-t px-4 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" /> Navigate
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" /> Open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border px-1">esc</kbd> Close
          </span>
          <span className="ml-auto">Press ⌘K anywhere</span>
        </div>
      </div>
    </div>
  );
};
