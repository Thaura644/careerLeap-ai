import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthMenu } from "@/components/auth/AuthMenu";
import { apiGet } from "@/lib/api";

/** Prices served by GET /api/payments/status — the single source of truth. */
type CurrencyPrice = { displayPrice: string; amountMinor: number };
type PlanStatus = { id: string; label: string; prices: Record<string, CurrencyPrice> };
type PaymentStatus = { mode: string; enabled: boolean; currencies: string[]; plans: PlanStatus[] };

const FREE_PLAN = {
  name: "Free",
  price: "$0",
  period: "Early Access",
  cta: "Start free",
  to: "/onboarding",
  features: [
    "Personalized career roadmap",
    "Practice problems tied to your roadmap — real code judge",
    "Trial real-world scenarios: case study, build, interview, exam",
    "Community access",
    "No card, no spam",
  ],
};

/** Fallback if the status fetch fails (offline/cold start) — mirrors backend pricing. */
const FALLBACK_PLANS = [
  {
    name: "Career Audit",
    price: "$12",
    period: "one-time · also ₦15,000",
    cta: "Get your audit",
    to: "/upgrade",
    features: [
      "Full profile + resume review",
      "Skill-gap analysis, in priority order",
      "Personalized action plan",
      "Delivered instantly, yours to keep",
    ],
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month · also ₦15,000 · or $100/yr",
    cta: "Go Pro",
    to: "/upgrade",
    features: [
      "Everything in Free",
      "Full practice library — every topic, real code judge",
      "Real-world scenarios: case studies, build projects, interview & exam prep tracks",
      "Unlimited roadmaps + goal tracking + AI insights",
      "Live workshops, webinars & courses from creators",
      "Publish your own resources & go live as a creator",
      "Community support",
    ],
  },
];

const phases = [
  {
    n: "01",
    title: "Own a cross-team system",
    desc: "End-to-end ownership of one system two or more teams depend on. Your name in the runbooks, your pager in the rotation.",
  },
  {
    n: "02",
    title: "Publish your technical strategy",
    desc: "Write the RFC other engineers follow — reviewed, revised, and shipped, not filed.",
  },
  {
    n: "03",
    title: "Prove the leverage",
    desc: "One metric that moved because of you, and the writeup that shows how.",
  },
];

const steps = [
  {
    n: "1",
    title: "Tell us where you are",
    desc: "Current role, target role, timeframe. Two minutes — not a form-filling marathon.",
  },
  {
    n: "2",
    title: "We name the gap",
    desc: "The specific skills and proof your target level actually requires, in priority order.",
  },
  {
    n: "3",
    title: "Execute in order",
    desc: "Projects and milestones sequenced so each one makes the next one possible.",
  },
  {
    n: "4",
    title: "Show the receipts",
    desc: "Interview reps and a proof portfolio aimed at the level above you.",
  },
];

const featureList = [
  {
    n: "01",
    title: "Roadmaps, not courses",
    desc: "One plan from here to your target role — sequenced so each step builds on the last. No 40-hour course list.",
  },
  {
    n: "02",
    title: "The gap, named",
    desc: "Skill-gap analysis that tells you what's missing in priority order, not a generic checklist.",
  },
  {
    n: "03",
    title: "Proof, not certificates",
    desc: "Concrete projects and case studies that make the next level visible to hiring teams.",
  },
  {
    n: "04",
    title: "A cohort, not a feed",
    desc: "A small community of engineers at the same crossroads — wins, advice, accountability.",
  },
  {
    n: "05",
    title: "Interview reps",
    desc: "Targeted practice for the interviews that stand between you and the offer.",
  },
  {
    n: "06",
    title: "Resources that fit the plan",
    desc: "Workshops and material matched to your roadmap, not a generic catalog.",
  },
];



const footerLinks: { label: string; to: string }[][] = [
  [
    { label: "How it works", to: "/#how-it-works" },
    { label: "Features", to: "/#features" },
    { label: "Pricing", to: "/#pricing" },
    { label: "Dashboard", to: "/dashboard" },
  ],
  [
    { label: "Resources", to: "/resources" },
    { label: "Community", to: "/community" },
    { label: "Blog", to: "/blog" },
    { label: "FAQ", to: "/faq" },
  ],
  [
    { label: "Privacy", to: "/privacy" },
    { label: "Terms", to: "/terms" },
    { label: "Support", to: "/support" },
    { label: "Contact", to: "/contact" },
  ],
];

const LegacyLanding = () => {
  const [open, setOpen] = useState(false);
  const [paidPlans, setPaidPlans] = useState<typeof FALLBACK_PLANS>(FALLBACK_PLANS);

  // Pull the live prices from the backend so the landing always shows the
  // real values (single source of truth: /api/payments/status). Falls back to
  // FALLBACK_PLANS if the fetch fails (offline / backend cold start).
  useEffect(() => {
    let active = true;
    apiGet<PaymentStatus>("/payments/status")
      .then((status) => {
        if (!active || !Array.isArray(status.plans)) return;
        const report = status.plans.find((p) => p.id === "roadmap-report");
        const monthly = status.plans.find((p) => p.id === "pro-monthly");
        const annual = status.plans.find((p) => p.id === "pro-annual");
        const usd = (p?: PlanStatus) => (p && p.prices["USD"]?.displayPrice) || "";
        const ngn = (p?: PlanStatus) => (p && p.prices["NGN"]?.displayPrice) || "";
        const next: typeof FALLBACK_PLANS = [];
        if (report) {
          next.push({
            name: "Career Audit",
            price: usd(report),
            period: `one-time${ngn(report) ? ` · also ${ngn(report)}` : ""}`,
            cta: "Get your audit",
            to: "/upgrade",
            features: [
              "Full profile + resume review",
              "Skill-gap analysis, in priority order",
              "Personalized action plan",
              "Delivered instantly, yours to keep",
            ],
          });
        }
        if (monthly) {
          next.push({
            name: "Pro",
            price: usd(monthly),
            period: `per month${ngn(monthly) ? ` · also ${ngn(monthly)}` : ""}${usd(annual) ? ` · or ${usd(annual)}/yr` : ""}`,
            cta: "Go Pro",
            to: "/upgrade",
            features: [
              "Everything in Free",
              "Full practice library — every topic, real code judge",
              "Real-world scenarios: case studies, build projects, interview & exam prep tracks",
              "Unlimited roadmaps + goal tracking + AI insights",
              "Live workshops, webinars & courses from creators",
              "Publish your own resources & go live as a creator",
              "Community support",
            ],
          });
        }
        if (next.length >= 1) setPaidPlans(next);
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      active = false;
    };
  }, []);

  const plans = [FREE_PLAN, ...paidPlans];

  const navLinks = (
    <>
      <a href="#features" className="text-[13px] tracking-wide text-stone-600 hover:text-stone-900">
        Features
      </a>
      <a href="#how-it-works" className="text-[13px] tracking-wide text-stone-600 hover:text-stone-900">
        How it works
      </a>
      <a href="#pricing" className="text-[13px] tracking-wide text-stone-600 hover:text-stone-900">
        Pricing
      </a>
      <Link to="/resources" className="text-[13px] tracking-wide text-stone-600 hover:text-stone-900">
        Resources
      </Link>
      <Link to="/community" className="text-[13px] tracking-wide text-stone-600 hover:text-stone-900">
        Community
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-stone-900">
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#FAF9F7]/95 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="font-display text-[22px] font-semibold tracking-tight">
            Leap<span className="text-stone-400">.ai</span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">{navLinks}</div>

          {/* Signed out: Log in / Sign up. Signed in: avatar + verified badge
              with Dashboard / Profile / Sign out. */}
          <div className="hidden md:block">
            <AuthMenu />
          </div>

          <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </nav>

        {open && (
          <div className="flex flex-col gap-4 border-t border-stone-200 px-5 py-4 md:hidden">
            {navLinks}
            <AuthMenu />
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="border-b border-stone-200">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#C2410C]">
                Live now · free to start
              </p>
              <h1 className="mt-5 font-display text-[40px] font-medium leading-[1.05] tracking-tight sm:text-[56px]">
                The gap between Senior and Staff was never more{" "}
                <em className="font-display italic">code</em>.
              </h1>
              <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-stone-600">
                It's leverage. It's scope. It's visible proof that you moved a metric that
                mattered. Leap.ai turns that gap into a working plan — the skills to build,
                the projects to ship, and the milestones to hit, in that order.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  className="h-11 rounded-none bg-stone-900 px-6 text-sm hover:bg-stone-700"
                >
                  <Link to="/onboarding">
                    Get my career plan <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="h-11 rounded-none border-stone-300 bg-transparent px-6 text-sm text-stone-700 hover:bg-stone-100"
                >
                  <a href="#sample">See what you get</a>
                </Button>
              </div>
              <p className="mt-5 text-[13px] text-stone-500">
                Free to start. No card, no spam — delete your account anytime.
              </p>
            </div>

            {/* The roadmap as a printed artifact */}
            <div id="sample" className="relative self-center">
              <div className="rotate-[0.5deg] rounded-sm border border-stone-300 bg-white shadow-[6px_8px_0_rgba(28,25,23,0.07)]">
                <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">
                    Leap.ai
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">
                    Roadmap № 0007
                  </p>
                </div>
                <div className="px-5 py-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-stone-500">
                    Senior → Staff · 12 months
                  </p>
                  <div className="mt-4 space-y-4">
                    {phases.map((p, i) => (
                      <div key={p.n} className="relative flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className="font-mono text-[11px] text-stone-400">{p.n}</span>
                          {i < phases.length - 1 && (
                            <span className="mt-2 w-px flex-1 bg-stone-200" />
                          )}
                        </div>
                        <div className="pb-2">
                          <h3 className="text-[15px] font-semibold tracking-tight">{p.title}</h3>
                          <p className="mt-1 text-[13px] leading-relaxed text-stone-600">{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-stone-200 px-5 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">
                    Generated from your profile — not a mockup
                  </p>
                </div>
              </div>
              <p className="absolute -right-2 -top-4 rotate-3 font-mono text-[11px] text-[#C2410C] sm:-right-4">
                ← this is the actual output
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-b border-stone-200">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#C2410C]">
              How it works
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Four steps. No dead ends.
            </h2>
            <div className="mt-12 grid gap-px overflow-hidden border border-stone-200 bg-stone-200 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s) => (
                <div key={s.n} className="bg-[#FAF9F7] p-7">
                  <span className="font-display text-3xl font-medium text-stone-300">{s.n}</span>
                  <h3 className="mt-4 text-[15px] font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-stone-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-b border-stone-200">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#C2410C]">
              What's inside
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Built for the Senior → Staff gap. Nothing else.
            </h2>
            <div className="mt-12 grid gap-x-14 gap-y-10 md:grid-cols-2">
              {featureList.map((f) => (
                <div key={f.n} className="flex gap-5 border-t border-stone-200 pt-5">
                  <span className="font-mono text-[11px] text-stone-400">{f.n}</span>
                  <div>
                    <h3 className="text-[15px] font-semibold tracking-tight">{f.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-stone-600">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-b border-stone-200">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#C2410C]">
              Pricing
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Start free. Pay when it's useful.
            </h2>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {plans.map((plan, i) => (
                <div
                  key={plan.name}
                  className={
                    i === plans.length - 1
                      ? "border border-stone-900 bg-white p-7"
                      : "border border-stone-300 bg-[#FAF9F7] p-7"
                  }
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-mono text-[12px] uppercase tracking-[0.18em] text-stone-500">
                      {plan.name}
                    </h3>
                    <p className="font-mono text-[10px] text-stone-400">{plan.period}</p>
                  </div>
                  <p className="mt-4 font-display text-4xl font-medium tracking-tight">
                    {plan.price}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13px] text-stone-700">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-stone-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={
                      i === plans.length - 1
                        ? "mt-8 h-10 w-full rounded-none bg-stone-900 text-[13px] hover:bg-stone-700"
                        : "mt-8 h-10 w-full rounded-none border border-stone-300 bg-transparent text-[13px] text-stone-800 hover:bg-stone-100"
                    }
                  >
                    <Link to={plan.to}>{plan.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[12px] text-stone-500">
              Roadmaps are free — you pay for what roadmap.sh and AI agents can't give you: a
              practice engine with a real judge, real-world scenarios, interview & exam prep
              tracks, and live content from creators. Checkout is live via Paystack in NGN, USD,
              GHS, ZAR, or KES. The free plan is free forever; upgrade when it's useful.
            </p>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="bg-stone-900">
          <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
            <h2 className="font-display text-3xl font-medium tracking-tight text-stone-50 sm:text-4xl">
              Your next level is a list of moves.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] text-stone-400">
              Start with the first one — a two-minute profile is all it takes to see yours.
            </p>
            <div className="mt-8">
              <Button
                asChild
                className="h-11 rounded-none bg-stone-50 px-7 text-sm text-stone-900 hover:bg-white"
              >
                <Link to="/onboarding">
                  Get my career plan <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <p className="font-display text-xl font-semibold tracking-tight">
                Leap<span className="text-stone-400">.ai</span>
              </p>
              <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-stone-600">
                Built by one person, in the open. Early access is free — your feedback decides
                what ships next.
              </p>
            </div>
            {footerLinks.map((col, i) => (
              <div key={i} className="grid grid-cols-1 gap-2.5 content-start">
                {col.map((l) => (
                  <Link
                    key={l.label}
                    to={l.to}
                    className="text-[13px] text-stone-600 hover:text-stone-900"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-10 border-t border-stone-200 pt-6 font-mono text-[11px] text-stone-400">
            © {new Date().getFullYear()} Leap.ai — made with a keyboard, not a template.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LegacyLanding;
