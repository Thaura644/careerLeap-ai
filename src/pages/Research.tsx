import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ExternalLink, Search, Sparkles } from "lucide-react";
import { getAuthToken } from "@/lib/authSession";
import { Reveal } from "@/components/common/Reveal";
import StaticPageShell from "./StaticPageShell";

/**
 * A hand-compiled directory of the world's major publications and research
 * sources, organized by field. Real, citable, open sources only — no paywall
 * guesswork. This is the browsing layer; the AI layer (search across them,
 * summaries tied to your roadmap) unlocks when you're signed in.
 */
type Publication = {
  name: string;
  url: string;
  desc: string;
};

const BY_CATEGORY: { category: string; icon: string; outlets: Publication[] }[] = [
  {
    category: "Technology & Computing",
    icon: "💻",
    outlets: [
      { name: "arXiv (cs)", url: "https://arxiv.org/list/cs/recent", desc: "Open-access preprints across all computer science — AI, systems, HCI, and more." },
      { name: "ACM Digital Library", url: "https://dl.acm.org/", desc: "The computing field's flagship research library; many conference papers are open." },
      { name: "IEEE Xplore", url: "https://ieeexplore.ieee.org/", desc: "Engineering and computing research, standards, and conferences." },
      { name: "Communications of the ACM", url: "https://cacm.acm.org/", desc: "Practitioner-readable research commentary for computing professionals." },
    ],
  },
  {
    category: "Health & Medicine",
    icon: "🩺",
    outlets: [
      { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/", desc: "36M+ citations for biomedical literature from MEDLINE, life-science journals, and books." },
      { name: "The Lancet", url: "https://www.thelancet.com/", desc: "A leading general-medicine journal; key public-health and clinical research." },
      { name: "BMJ", url: "https://www.bmj.com/", desc: "British Medical Journal — clinical research, education, and news, much of it open." },
      { name: "WHO Publications", url: "https://www.who.int/publications", desc: "Global health statistics, guidelines, and world health reports." },
    ],
  },
  {
    category: "Business & Economics",
    icon: "📈",
    outlets: [
      { name: "NBER Working Papers", url: "https://www.nber.org/papers", desc: "National Bureau of Economic Research working papers — economics as it happens." },
      { name: "SSRN", url: "https://www.ssrn.com/index.cfm/en/", desc: "Early-stage research across social sciences, economics, and management." },
      { name: "World Bank Open Knowledge", url: "https://openknowledge.worldbank.org/", desc: "Development economics research and global data reports." },
      { name: "IMF eLibrary", url: "https://www.elibrary.imf.org/", desc: "Global macroeconomic analysis, country reports, and working papers." },
    ],
  },
  {
    category: "Data & AI",
    icon: "🤖",
    outlets: [
      { name: "Papers with Code", url: "https://paperswithcode.com/", desc: "Machine-learning papers paired with runnable code and benchmarks." },
      { name: "JMLR", url: "https://jmlr.org/", desc: "Journal of Machine Learning Research — fully open, peer-reviewed ML papers." },
      { name: "Distill", url: "https://distill.pub/", desc: "Interactive, visual ML research explanations (archived, still canonical)." },
      { name: "Google Research", url: "https://research.google/pubs/", desc: "Published research from one of the largest industrial research labs." },
    ],
  },
  {
    category: "Social Science & Policy",
    icon: "🏛️",
    outlets: [
      { name: "SSRN eLibrary", url: "https://www.ssrn.com/index.cfm/en/library/", desc: "Working papers across law, political science, and public policy." },
      { name: "UNESCO Digital Library", url: "https://unesdoc.unesco.org/", desc: "Education, science, and cultural policy documents and reports." },
      { name: "OECD iLibrary", url: "https://www.oecd-ilibrary.org/", desc: "Policy research and statistics across member economies." },
      { name: "Our World in Data", url: "https://ourworldindata.org/", desc: "Research-backed data visualizations on global problems and progress." },
    ],
  },
  {
    category: "Education & Learning Science",
    icon: "🎓",
    outlets: [
      { name: "ERIC", url: "https://eric.ed.gov/", desc: "Education Resources Information Center — 1.5M+ education research records." },
      { name: "EdWorkingPapers", url: "https://edworkingpapers.com/", desc: "Open working papers from the Annenberg Institute on education outcomes." },
      { name: "Journal of Educational Psychology", url: "https://psycnet.apa.org/journals/edu/", desc: "APA's flagship journal on how people learn." },
      { name: "Learning Sciences (Taylor & Francis)", url: "https://www.tandfonline.com/toc/hlsc20/current", desc: "Research on how learning environments and design affect outcomes." },
    ],
  },
  {
    category: "Science (General)",
    icon: "🔬",
    outlets: [
      { name: "Nature", url: "https://www.nature.com/", desc: "One of the world's most-cited interdisciplinary science journals." },
      { name: "Science (AAAS)", url: "https://www.science.org/", desc: "Peer-reviewed research and news across the sciences." },
      { name: "PLOS", url: "https://plos.org/", desc: "Open-access publisher across biology, medicine, and computational science." },
      { name: "DOAJ", url: "https://doaj.org/", desc: "Directory of Open Access Journals — 20,000+ vetted open journals, searchable by field." },
    ],
  },
];

const Research = () => {
  const [query, setQuery] = useState("");
  const signedIn = typeof window !== "undefined" ? !!getAuthToken() : false;

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      !q
        ? BY_CATEGORY
        : BY_CATEGORY.map((c) => ({
            ...c,
            outlets: c.outlets.filter(
              (o) =>
                o.name.toLowerCase().includes(q) ||
                o.desc.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q)
            ),
          })).filter((c) => c.outlets.length > 0),
    [q]
  );

  const totalOutlets = BY_CATEGORY.reduce((n, c) => n + c.outlets.length, 0);

  return (
    <StaticPageShell>
      <section className="border-b border-edu-ink/5">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal className="text-center">
            <span className="inline-flex items-center rounded-full bg-edu-sky px-4 py-1.5 text-xs font-semibold text-edu-sky-fg">
              Resources · Research
            </span>
            <h1 className="mx-auto mt-4 max-w-xl font-marketing text-4xl font-extrabold tracking-tight text-edu-ink sm:text-5xl">
              Real research, compiled and organized by field.
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-edu-ink/70">
              The world's major publications and open research libraries — {totalOutlets}+ sources
              across {BY_CATEGORY.length} fields, hand-picked so you can actually find things.
              Browse freely; AI search unlocks when you sign in.
            </p>
          </Reveal>

          {/* Search */}
          <Reveal delayMs={80} className="mx-auto mt-8 max-w-lg">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-edu-ink/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sources — try 'machine learning' or 'public health'…"
                className="w-full rounded-full border border-edu-ink/15 bg-white py-3 pl-11 pr-4 text-sm text-edu-ink placeholder:text-edu-ink/40 focus:border-edu-indigo focus:outline-none focus:ring-2 focus:ring-edu-indigo/20"
              />
            </div>
          </Reveal>

          {/* AI hook — honest about state: browsing now, AI search after sign-in */}
          <Reveal delayMs={120} className="mx-auto mt-6 max-w-2xl">
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-edu-indigo/20 bg-edu-lavender/40 px-6 py-5 text-center sm:flex-row sm:text-left">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-edu-indigo text-white">
                <Sparkles className="h-5 w-5" />
              </span>
              <p className="flex-1 text-[13px] leading-relaxed text-edu-ink/70">
                {signedIn ? (
                  <>
                    <span className="font-semibold text-edu-ink">AI research search is warming up.</span>{" "}
                    We're wiring it to search across these sources and summarize findings against
                    your roadmap — keep an eye on your dashboard.
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-edu-ink">AI search across all sources — for signed-in users.</span>{" "}
                    Ask in plain language, get findings summarized and tied to your roadmap.
                    {totalOutlets > 0 && (
                      <>
                        {" "}
                        <Link to="/signup" className="font-semibold text-edu-indigo underline underline-offset-4 hover:text-edu-ink">
                          Create a free account
                        </Link>{" "}
                        to get it first.
                      </>
                    )}
                  </>
                )}
              </p>
              {!signedIn && (
                <Link
                  to="/signup"
                  className="shrink-0 rounded-full bg-edu-ink px-4 py-2 text-xs font-semibold text-white hover:bg-edu-ink/90"
                >
                  Sign up free
                </Link>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Categories of publications */}
      {filtered.map(({ category, icon, outlets }, ci) => (
        <section
          key={category}
          className={ci % 2 === 0 ? "border-b border-edu-ink/5 bg-white" : "border-b border-edu-ink/5"}
        >
          <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
            <Reveal delayMs={ci * 40}>
              <h2 className="flex items-center gap-2.5 font-marketing text-xl font-extrabold tracking-tight text-edu-ink">
                <span aria-hidden="true">{icon}</span> {category}
              </h2>
            </Reveal>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {outlets.map((o, i) => (
                <Reveal key={o.url} delayMs={i * 40}>
                  <a
                    href={o.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex h-full flex-col rounded-3xl border border-edu-ink/10 bg-edu-bg p-5 transition-all hover:-translate-y-0.5 hover:border-edu-indigo/30 hover:shadow-lg hover:shadow-edu-indigo/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[15px] font-semibold tracking-tight text-edu-ink group-hover:text-edu-indigo">
                        {o.name}
                      </h3>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-edu-ink/30 group-hover:text-edu-indigo" />
                    </div>
                    <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-edu-ink/60">
                      {o.desc}
                    </p>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <section className="py-20 text-center">
          <p className="text-sm text-edu-ink/60">
            Nothing matched "{query}" — try a broader term, or{" "}
            <Link to="/contact" className="font-semibold text-edu-indigo hover:text-edu-ink">
              suggest a source
            </Link>
            .
          </p>
        </section>
      )}

      {/* Cross-link to the rest of Resources */}
      <section className="py-16 text-center">
        <Reveal>
          <p className="text-sm text-edu-ink/60">More in Resources:</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-edu-ink/15 bg-white px-4 py-2 text-xs font-semibold text-edu-ink hover:border-edu-indigo/40"
            >
              <BookOpen className="h-3.5 w-3.5 text-edu-indigo" /> Blog
            </Link>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-full border border-edu-ink/15 bg-white px-4 py-2 text-xs font-semibold text-edu-ink hover:border-edu-indigo/40"
            >
              Practice catalog
            </Link>
          </div>
        </Reveal>
      </section>
    </StaticPageShell>
  );
};

export default Research;
