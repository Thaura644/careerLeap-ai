import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Lock, Search, Sparkles } from "lucide-react";
import { apiGet } from "@/lib/api";
import { getAuthToken } from "@/lib/authSession";
import { Reveal } from "@/components/common/Reveal";
import StaticPageShell from "./StaticPageShell";

type ScenarioCard = {
  slug: string;
  title: string;
  type: string;
  difficulty: string;
  category: string;
  estMinutes: number;
  summary: string;
  free: boolean;
};

type CatalogLink = { title: string; url: string; kind: string; note?: string };
type CatalogTopic = { topic: string; keywords: string[]; resources: CatalogLink[]; tools: CatalogLink[] };

const humanize = (s: string) =>
  s.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const Catalog = () => {
  const [scenarios, setScenarios] = useState<ScenarioCard[]>([]);
  const [topics, setTopics] = useState<CatalogTopic[]>([]);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const signedIn = typeof window !== "undefined" ? !!getAuthToken() : false;

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      apiGet<{ scenarios: ScenarioCard[] }>("/practice/scenarios/public"),
      apiGet<{ topics: CatalogTopic[] }>("/resources/catalog"),
    ]).then(([s, t]) => {
      if (!active) return;
      if (s.status === "fulfilled") setScenarios(s.value.scenarios || []);
      if (t.status === "fulfilled") setTopics(t.value.topics || []);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const q = query.trim().toLowerCase();
  const filteredScenarios = useMemo(
    () =>
      !q
        ? scenarios
        : scenarios.filter(
            (s) =>
              s.title.toLowerCase().includes(q) ||
              s.category.toLowerCase().includes(q) ||
              s.summary.toLowerCase().includes(q)
          ),
    [scenarios, q]
  );
  const filteredTopics = useMemo(
    () =>
      !q
        ? topics
        : topics.filter(
            (t) =>
              t.topic.toLowerCase().includes(q) ||
              t.keywords.some((k) => k.toLowerCase().includes(q))
          ),
    [topics, q]
  );

  const scenariosByCategory = useMemo(() => {
    const map = new Map<string, ScenarioCard[]>();
    for (const s of filteredScenarios) {
      const list = map.get(s.category) || [];
      list.push(s);
      map.set(s.category, list);
    }
    return Array.from(map.entries());
  }, [filteredScenarios]);

  const noResults = loaded && q && filteredScenarios.length === 0 && filteredTopics.length === 0;
  const startHref = signedIn ? "/dashboard" : `/signup`;

  return (
    <StaticPageShell>
      <section className="border-b border-edu-ink/5">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal className="text-center">
            <span className="inline-flex items-center rounded-full bg-edu-lavender px-4 py-1.5 text-xs font-semibold text-edu-lavender-fg">
              Practice catalog
            </span>
            <h1 className="mx-auto mt-4 max-w-2xl font-marketing text-4xl font-extrabold tracking-tight text-edu-ink sm:text-5xl">
              Everything you can practice — browse it first.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-edu-ink/70">
              Real case studies, build projects, interview & exam prep, plus curated free
              courses across every field we cover. Search it, then sign in to start.
            </p>
          </Reveal>

          {/* Free vs Pro, up front and unambiguous */}
          <Reveal delayMs={80} className="mx-auto mt-8 flex max-w-lg flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-edu-mint px-4 py-2 text-xs font-semibold text-edu-mint-fg">
              <Check className="h-3.5 w-3.5" /> Free forever: one scenario per category + full course catalog
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-edu-ink shadow-sm">
              <Lock className="h-3.5 w-3.5 text-edu-coral" /> Pro: the full scenario library
            </span>
            <Link to="/pricing" className="inline-flex items-center px-2 text-xs font-semibold text-edu-indigo hover:text-edu-ink">
              See full pricing →
            </Link>
          </Reveal>

          {/* Search */}
          <Reveal delayMs={120} className="mx-auto mt-8 max-w-lg">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edu-ink/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by role, skill, or category…"
                className="w-full rounded-full border border-edu-ink/15 bg-white py-3 pl-11 pr-4 text-sm text-edu-ink placeholder:text-edu-ink/40 focus:border-edu-indigo focus:outline-none focus:ring-2 focus:ring-edu-indigo/20"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Real-world scenarios, grouped by category */}
      {scenariosByCategory.length > 0 && (
        <section className="border-b border-edu-ink/5 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
            <Reveal>
              <h2 className="font-marketing text-2xl font-extrabold tracking-tight text-edu-ink">
                Real-world scenarios
              </h2>
            </Reveal>
            {scenariosByCategory.map(([category, items], gi) => (
              <div key={category} className="mt-8">
                <Reveal delayMs={gi * 40}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-edu-ink/50">
                    {category}
                  </h3>
                </Reveal>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((s, i) => (
                    <Reveal key={s.slug} delayMs={i * 50}>
                      <div className="flex h-full flex-col rounded-3xl border border-edu-ink/10 bg-edu-bg p-6">
                        <div className="flex items-start justify-between gap-3">
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-edu-ink/60">
                            {humanize(s.type)}
                          </span>
                          {s.free ? (
                            <span className="rounded-full bg-edu-mint px-2.5 py-1 text-[11px] font-semibold text-edu-mint-fg">
                              Free
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 rounded-full bg-edu-coral/10 px-2.5 py-1 text-[11px] font-semibold text-edu-coral">
                              <Lock className="h-3 w-3" /> Pro
                            </span>
                          )}
                        </div>
                        <h4 className="mt-3 text-[15px] font-semibold tracking-tight text-edu-ink">
                          {s.title}
                        </h4>
                        <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-edu-ink/60">
                          {s.summary}
                        </p>
                        <p className="mt-3 text-[11px] text-edu-ink/40">
                          {humanize(s.difficulty)} · ~{s.estMinutes} min
                        </p>
                        <Link
                          to={startHref}
                          className="mt-4 rounded-full bg-edu-ink px-4 py-2 text-center text-xs font-semibold text-white hover:bg-edu-ink/90"
                        >
                          {signedIn ? "Open in dashboard" : "Start — sign in"}
                        </Link>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Curated free courses, by sector */}
      {filteredTopics.length > 0 && (
        <section className="border-b border-edu-ink/5">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
            <Reveal>
              <h2 className="font-marketing text-2xl font-extrabold tracking-tight text-edu-ink">
                Courses & guides, by sector
              </h2>
              <p className="mt-2 text-sm text-edu-ink/60">
                Free, external resources curated per field — always free, no sign-in needed to
                browse or open them.
              </p>
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTopics.map((t, i) => (
                <Reveal key={t.topic} delayMs={i * 40}>
                  <div className="rounded-3xl border border-edu-ink/10 bg-white p-6 shadow-sm">
                    <h3 className="text-[15px] font-semibold tracking-tight text-edu-ink">{t.topic}</h3>
                    <ul className="mt-3 space-y-2">
                      {[...t.resources, ...t.tools].slice(0, 3).map((l) => (
                        <li key={l.url}>
                          <a
                            href={l.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[13px] font-medium text-edu-indigo hover:text-edu-ink"
                          >
                            {l.title}
                          </a>
                          {l.note && <p className="text-[12px] text-edu-ink/50">{l.note}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nothing matched, or just a standing invite — build-with-AI fallback */}
      {(noResults || loaded) && (
        <section className="py-16">
          <div className="mx-auto max-w-lg px-5 text-center sm:px-8">
            <Reveal>
              <motion.span
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-edu-lavender text-edu-lavender-fg"
              >
                <Sparkles className="h-6 w-6" />
              </motion.span>
              <h2 className="mt-4 font-marketing text-xl font-extrabold tracking-tight text-edu-ink">
                {noResults ? "Can't find it? Build this with AI." : "Don't see your exact situation?"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-edu-ink/60">
                Sign up and describe what you're working toward — your AI coach builds a plan
                around it, on top of everything above.
              </p>
              <Link
                to={startHref}
                className="mt-5 inline-block rounded-full bg-edu-coral px-6 py-2.5 text-sm font-semibold text-white hover:bg-edu-coral-dark"
              >
                {signedIn ? "Open dashboard" : "Sign up free"}
              </Link>
            </Reveal>
          </div>
        </section>
      )}
    </StaticPageShell>
  );
};

export default Catalog;
