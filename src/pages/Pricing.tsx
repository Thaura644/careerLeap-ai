import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { getAuthToken } from "@/lib/authSession";
import { Reveal } from "@/components/common/Reveal";
import StaticPageShell from "./StaticPageShell";

/** Prices served by GET /api/payments/status — the single source of truth. */
type CurrencyPrice = { displayPrice: string; amountMinor: number };
type PlanStatus = { id: string; label: string; prices: Record<string, CurrencyPrice> };
type PaymentStatus = { mode: string; enabled: boolean; currencies: string[]; plans: PlanStatus[] };

const FREE_PLAN = {
  id: "free",
  name: "Free",
  price: "$0",
  period: "Early Access",
  cta: "Start free",
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
    id: "roadmap-report",
    name: "Career Audit",
    price: "$12",
    period: "one-time · also ₦15,000",
    cta: "Get your audit",
    features: [
      "Full profile + resume review",
      "Skill-gap analysis, in priority order",
      "Personalized action plan",
      "Delivered instantly, yours to keep",
    ],
  },
  {
    id: "pro-monthly",
    name: "Pro",
    price: "$15",
    period: "per month · also ₦18,750 · or $100/yr",
    cta: "Go Pro",
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

const Pricing = () => {
  const [paidPlans, setPaidPlans] = useState<typeof FALLBACK_PLANS>(FALLBACK_PLANS);

  // Pull the live prices from the backend so this page always shows the
  // real values (single source of truth: /api/payments/status). Falls back
  // to FALLBACK_PLANS if the fetch fails (offline / backend cold start).
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
            id: "roadmap-report",
            name: "Career Audit",
            price: usd(report),
            period: `one-time${ngn(report) ? ` · also ${ngn(report)}` : ""}`,
            cta: "Get your audit",
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
            id: "pro-monthly",
            name: "Pro",
            price: usd(monthly),
            period: `per month${ngn(monthly) ? ` · also ${ngn(monthly)}` : ""}${usd(annual) ? ` · or ${usd(annual)}/yr` : ""}`,
            cta: "Go Pro",
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

  const signedIn = typeof window !== "undefined" ? !!getAuthToken() : false;
  const planHref = (plan: { id: string }) => {
    if (plan.id === "free") return signedIn ? "/dashboard" : "/signup";
    return signedIn ? `/upgrade?plan=${plan.id}` : `/signup?plan=${plan.id}`;
  };

  return (
    <StaticPageShell>
      <section className="border-b border-edu-ink/5">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <span className="inline-flex items-center rounded-full bg-edu-mint px-4 py-1.5 text-xs font-semibold text-edu-mint-fg">
            Pricing
          </span>
          <h1 className="mt-4 max-w-xl font-marketing text-4xl font-extrabold tracking-tight text-edu-ink sm:text-5xl">
            Start free. Pay when it's useful.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-edu-ink/70">
            Roadmaps are free — you pay for what roadmap.sh and AI agents can't give you: a
            practice engine with a real judge, real-world scenarios, interview & exam prep
            tracks, and live content from creators.
          </p>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((plan, i) => {
              const isPro = i === plans.length - 1;
              return (
                <Reveal key={plan.name} delayMs={i * 100}>
                  <div
                    className={
                      isPro
                        ? "relative rounded-3xl border-2 border-edu-indigo bg-white p-7 shadow-xl shadow-edu-indigo/10"
                        : "rounded-3xl border border-edu-ink/10 bg-white p-7 shadow-sm"
                    }
                  >
                    {isPro && (
                      <span className="absolute -top-3 left-7 rounded-full bg-edu-indigo px-3 py-1 text-[11px] font-semibold text-white">
                        Most popular
                      </span>
                    )}
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-edu-ink/60">
                      {plan.name}
                    </h2>
                    <p className="mt-4 font-marketing text-4xl font-extrabold tracking-tight text-edu-ink">
                      {plan.price}
                    </p>
                    <p className="mt-1 text-xs text-edu-ink/50">{plan.period}</p>
                    <ul className="mt-6 space-y-2.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-[13px] text-edu-ink/70">
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-edu-indigo" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className={
                        isPro
                          ? "mt-8 h-11 w-full rounded-full bg-edu-coral text-sm font-semibold hover:bg-edu-coral-dark"
                          : "mt-8 h-11 w-full rounded-full border border-edu-ink/15 bg-transparent text-sm font-semibold text-edu-ink hover:bg-edu-bg"
                      }
                    >
                      <Link to={planHref(plan)}>{plan.cta}</Link>
                    </Button>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <p className="mt-6 text-[12px] text-edu-ink/50">
            Checkout is live via Paystack in NGN, USD, GHS, ZAR, or KES — M-Pesa included for
            Kenyan shillings. The free plan is free forever; upgrade when it's useful.
          </p>
        </div>
      </section>
    </StaticPageShell>
  );
};

export default Pricing;
