import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { apiGet, apiPost } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Currency = "NGN" | "USD" | "GHS" | "ZAR" | "KES";
type CurrencyPrice = { displayPrice: string; amountMinor: number };
type Plan = { id: string; label: string; prices: Record<Currency, CurrencyPrice> };
type PaymentStatus = {
  mode: string;
  enabled: boolean;
  publicKey: string;
  currencies: Currency[];
  plans: Plan[];
};

/** Short, honest description of the current payments mode for the banner. */
function modeNotice(status: PaymentStatus | null): { tone: "info" | "warn" | "live"; text: string } | null {
  if (!status) return null;
  switch (status.mode) {
    case "simulate":
      return {
        tone: "warn",
        text: "DRY RUN — payments are in simulation mode. No money moves: the buttons below simulate a successful charge and prove the Pro entitlement flow end-to-end.",
      };
    case "sandbox":
      return {
        tone: "warn",
        text: "SANDBOX — checkout is live against Paystack's test environment. Use the test card 4084 4084 4084 4081 (any future expiry, any CVV). No real money moves.",
      };
    case "live":
      return {
        tone: "live",
        text: "Live checkout — real customer money. This is the production payment flow.",
      };
    default:
      return null;
  }
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).PaystackPop) return resolve();
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("failed to load Paystack"));
    document.head.appendChild(s);
  });
}

/** Best-guess currency from the visitor's locale; falls back to USD. */
function detectCurrency(): Currency {
  const region = (navigator.language || "en-US").split("-")[1]?.toUpperCase();
  const byRegion: Record<string, Currency> = {
    NG: "NGN", GH: "GHS", ZA: "ZAR", KE: "KES",
    US: "USD", GB: "USD", CA: "USD", AU: "USD", DE: "USD", FR: "USD",
  };
  return byRegion[region || ""] || "USD";
}

const UpgradePro = () => {
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan");
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [currency, setCurrency] = useState<Currency>("USD");
  // ?plan=pro-annual preselects annual billing; ?plan=roadmap-report scrolls to
  // the Career Audit card. The context survives from signup → onboarding → here.
  const [billing, setBilling] = useState<"monthly" | "annual">(
    planParam === "pro-annual" ? "annual" : "monthly"
  );
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [pro, setPro] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // Live-money guard: verification is server-side and requires a session, so a
  // logged-out visitor must never reach a real Paystack charge they can't get
  // credited. The message renders right where the user clicked, not at the
  // bottom of the page where it was invisible (the "it does nothing" bug).
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);

  /** Validates checkout preconditions and returns a readable error, or null.
   *  Errors are scrolled into view and rendered inline next to the CTA. */
  const checkoutError = (): string | null => {
    if (signedIn === false) {
      return "You need to be signed in to upgrade — verification is tied to your account.";
    }
    if (!status?.enabled) {
      return "Checkout is not armed yet — payments are gated until the human flips the flag.";
    }
    if (!email.trim()) {
      return "Enter your email first.";
    }
    if (currency === "KES" && !phone.trim()) {
      return "Enter your M-Pesa phone number for mobile money payment.";
    }
    return null;
  };

  const focusEmail = () => {
    setTimeout(() => {
      emailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      emailRef.current?.focus();
    }, 50);
  };

  useEffect(() => {
    apiGet<PaymentStatus>("/payments/status")
      .then((res) => {
        setStatus(res);
        // Only use the detected currency if the backend actually supports it.
        const detected = detectCurrency();
        setCurrency(res.currencies.includes(detected) ? detected : res.currencies[0] || "USD");
      })
      .catch(() => setStatus(null));
    // Real entitlement from the server — not a localStorage flag.
    apiGet<{ pro: boolean }>("/payments/me")
      .then((res) => {
        setPro(res.pro);
        setSignedIn(true);
      })
      .catch(() => {
        setPro(false);
        setSignedIn(false);
      });
    // Landing user chose the Career Audit — bring the audit card into view so
    // the pay prompt is what they see, not the Pro card.
    if (planParam === "roadmap-report") {
      setTimeout(() => {
        document.getElementById("career-audit")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
    }
  }, [planParam]);

  const proMonthly = status?.plans.find((p) => p.id === "pro-monthly");
  const proAnnual = status?.plans.find((p) => p.id === "pro-annual");
  const reportPlan = status?.plans.find((p) => p.id === "roadmap-report");
  // The billing toggle picks which Pro plan gets charged; fall back to monthly
  // if the backend hasn't served the annual plan yet.
  const proPlan = billing === "annual" ? proAnnual || proMonthly : proMonthly;

  const priceFor = (plan?: Plan) => {
    if (!plan || !status) return { display: "—", amount: 0 };
    const p = plan.prices[currency] || plan.prices[status.currencies[0]];
    return { display: p.displayPrice, amount: p.amountMinor };
  };
  const proPrice = useMemo(() => priceFor(proPlan), [proPlan, currency, status]);
  const reportPrice = useMemo(() => priceFor(reportPlan), [reportPlan, currency, status]);
  const proPeriod = billing === "annual" ? "/year" : "/month";
  const proCtaSuffix = billing === "annual" ? "/yr" : "/mo";
  const notice = modeNotice(status);
  const simulated = status?.mode === "simulate";
  const ctaLabel = (fallback: string, price: string) =>
    !status?.enabled ? "Checkout coming soon" : simulated ? `Simulate payment — ${price}` : `${fallback} — ${price}`;

  /** "≈ $8.33/mo" — the annual price expressed as a per-month figure, so the
   *  discount is legible without trusting the label. */
  const monthlyEquivalent = (plan: Plan | undefined, c: Currency) => {
    if (!plan) return "";
    const p = plan.prices[c];
    if (!p) return "";
    const num = parseFloat(p.displayPrice.replace(/[^\d.,]/g, "").replace(/,/g, ""));
    if (!isFinite(num) || num <= 0) return "";
    const prefix = p.displayPrice.replace(/[\d.,\s]/g, "");
    const perMonth = num / 12;
    const shown = c === "USD" ? `$${perMonth.toFixed(2)}` : `${prefix}${Math.round(perMonth).toLocaleString()}`;
    return `≈ ${shown}/mo`;
  };

  /** Simulate mode: no Paystack — call verify() directly and grant the plan. */
  const simulatePayment = async (plan: Plan) => {
    if (!status?.enabled || status.mode !== "simulate") return;
    if (!email.trim()) {
      setMessage("Enter your email first.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const reference = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const res = await apiPost<{ verified: boolean; simulated?: boolean; pro?: boolean }>("/payments/verify", {
        reference,
        plan: plan.id,
        email: email.trim(),
      });
      if (res.verified) {
        setPro(true);
        setMessage(res.simulated ? "Simulated payment verified — Pro activated (dry run)." : "Payment verified — Pro activated. Thank you!");
      } else {
        setMessage("Payment could not be verified.");
      }
    } catch {
      setMessage("Verification failed.");
    }
    setBusy(false);
  };

  const startCheckout = async (plan: Plan) => {
    // Guard before any money can move: signed in, armed, email present. Errors
    // render inline next to the CTA and scroll it into view — never silently
    // at the bottom of the page.
    const error = checkoutError();
    if (error) {
      setMessage(error);
      if (signedIn === false) {
        // Not signed in: never open a real Paystack charge. Send to login.
        window.location.href = "/login?next=/upgrade";
        return;
      }
      if (!email.trim()) {
        focusEmail();
      }
      return;
    }
    if (status?.mode === "simulate") {
      await simulatePayment(plan);
      return;
    }
    const p = plan.prices[currency] || plan.prices[status.currencies[0]];
    setBusy(true);
    setMessage(null);
    try {
      await loadPaystackScript();
      const reference = `leap_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const popup = (window as any).PaystackPop.setup({
        key: status.publicKey,
        email: email.trim(),
        amount: p.amountMinor,
        currency,
        ref: reference,
        metadata: { plan: plan.id, phone_number: currency === "KES" ? phone.trim() : undefined },
        // NOTE: Paystack's validator rejects async functions as `callback`
        // ("Attribute callback must be a valid function") — keep this sync and
        // run the async verification inside.
        callback: (response: { reference: string }) => {
          (async () => {
            try {
              const res = await apiPost<{ verified: boolean; pro?: boolean }>("/payments/verify", {
                reference: response.reference,
                email: email.trim(),
              });
              if (res.verified) {
                setPro(true);
                setMessage("Payment verified — Pro activated. Thank you!");
              } else {
                setMessage("Payment could not be verified. Contact support if you were charged.");
              }
            } catch {
              setMessage("Verification failed. Contact support if you were charged.");
            }
            setBusy(false);
          })();
        },
        onClose: () => setBusy(false),
      });
      popup.openIframe();
    } catch {
      setBusy(false);
      setMessage("Could not load Paystack. Try again in a moment.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-3">Upgrade to Pro</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The roadmap is free. Pro unlocks what roadmap.sh and AI agents can't give you: the
            full practice engine, real-world scenarios, interview &amp; exam prep, and live
            creator content.
          </p>
          {notice && (
            <div
              className={`mt-4 mx-auto max-w-2xl rounded-md px-4 py-3 text-sm text-left ${
                notice.tone === "live"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                  : notice.tone === "warn"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {notice.text}
            </div>
          )}
          {status && !status.enabled && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              Payments are gated right now (PAYMENTS_MODE is "{status.mode}") — checkout appears once the human arms it.
            </p>
          )}
          {pro && <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">✓ Pro is active</p>}
          {planParam && !pro && (
            <p className="mx-auto mt-4 max-w-2xl rounded-md bg-stone-100 px-4 py-2.5 text-sm text-stone-700">
              You're here to get{" "}
              <span className="font-semibold">
                {planParam === "roadmap-report" ? "the Career Audit" : planParam === "pro-annual" ? "Pro — annual" : "Pro"}
              </span>
              . Complete the payment below to unlock it — otherwise your account stays on the free
              plan.
            </p>
          )}
        </div>

        {status && status.currencies.length > 0 && (
          <div className="flex justify-center items-center gap-3 mb-8">
            <span className="text-sm text-muted-foreground">Currency</span>
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {status.currencies.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* One email field for every plan, always visible when checkout is
            armed — the old field lived only on the Pro card, so clicking any
            other CTA without it silently failed. The error message now renders
            inline below the CTAs, next to where the user actually clicked. */}
        {status?.enabled && (
          <div className="mx-auto mb-10 max-w-xl">
            <label htmlFor="checkout-email" className="mb-1.5 block text-sm font-medium">
              Email for your receipt
            </label>
            <input
              id="checkout-email"
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (message) setMessage(null);
              }}
              placeholder="you@example.com"
              className="h-11 w-full rounded-md border bg-background px-3 text-sm"
            />
            {currency === "KES" && (
              <div className="mt-3">
                <label htmlFor="checkout-phone" className="mb-1.5 block text-sm font-medium">
                  M-Pesa phone number
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (message) setMessage(null);
                  }}
                  placeholder="2547XXXXXXXX"
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  This is the Safaricom number linked to your M-Pesa. You'll receive an STK push to confirm.
                </p>
              </div>
            )}
            {message && (
              <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                {message}
              </p>
            )}
            {signedIn === false && (
              <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                You're not signed in. Upgrade is tied to your account — you'll be sent to login first.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Career Audit */}
          <Card id="career-audit">
            <CardHeader>
              <CardTitle>Career Audit</CardTitle>
              <CardDescription>One-time deep review of your profile and the gap to your target</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">{reportPrice.display}</span>
                <span className="text-muted-foreground"> one-time</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Full profile + resume review</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Skill-gap analysis, in priority order</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Personalized action plan</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Delivered instantly, yours to keep</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button
                className="w-full"
                disabled={!status?.enabled || busy}
                onClick={() => reportPlan && startCheckout(reportPlan)}
              >
                {ctaLabel("Get your audit", reportPrice.display)}
              </Button>
            </CardFooter>
          </Card>

          {/* Pro */}
          <Card className="border-leap-purple border-2">
            <div className="bg-leap-purple text-white py-1 px-3 rounded-t-md text-center text-sm font-medium">
              RECOMMENDED
            </div>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>Everything, unlocked — practice, prep, creators, live sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Monthly / annual toggle */}
              <div className="grid grid-cols-2 gap-1 rounded-md border p-1 mb-4">
                <button
                  type="button"
                  onClick={() => setBilling("monthly")}
                  className={`h-9 rounded text-sm font-medium transition-colors ${
                    billing === "monthly"
                      ? "bg-leap-purple text-white"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBilling("annual")}
                  className={`h-9 rounded text-sm font-medium transition-colors ${
                    billing === "annual"
                      ? "bg-leap-purple text-white"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Annual · save ~30%
                </button>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold">{proPrice.display}</span>
                <span className="text-muted-foreground">{proPeriod}</span>
                {billing === "annual" && (
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
                    {monthlyEquivalent(proAnnual, currency) || "≈ 30% off monthly"}
                  </span>
                )}
              </div>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Full practice library — every topic, real code judge</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Real-world scenarios: case studies, build projects, interview &amp; exam prep tracks</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Unlimited roadmaps + goal tracking + AI insights</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Live workshops, webinars &amp; courses from creators</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Publish your own resources &amp; go live as a creator</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Community support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button
                className="w-full bg-leap-purple hover:bg-opacity-90"
                disabled={!status?.enabled || busy}
                onClick={() => proPlan && startCheckout(proPlan)}
              >
                {ctaLabel("Go Pro", `${proPrice.display}${proCtaSuffix}`)}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto grid gap-6 text-left">
            <div>
              <h3 className="font-bold mb-2">Can I cancel my Pro subscription at any time?</h3>
              <p className="text-muted-foreground">
                Yes — cancel anytime and the plan stays active until the end of the period you paid for.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Why pay when roadmaps are free on roadmap.sh or from AI agents?</h3>
              <p className="text-muted-foreground">
                Fair question — and the roadmap itself is free here. You pay for what a static
                roadmap can't do: a practice engine with a real code judge, real-world case
                studies and build projects, interview &amp; exam prep tracks, an AI assistant
                that knows your profile and progress, and live workshops and courses from
                creators. Free users get a real taste of each; Pro unlocks the full library.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Is there a discount for paying annually?</h3>
              <p className="text-muted-foreground">
                Yes — Pro annual is $100/yr, about 30% off the monthly rate (≈ $8.33/mo).
                Toggle Monthly / Annual above to see the price in your currency.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Which currencies do you accept?</h3>
              <p className="text-muted-foreground">
                Naira, US Dollars, Ghanaian Cedis, South African Rand, and Kenyan Shillings — pick yours
                above and the price is shown in it.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Is there a refund policy?</h3>
              <p className="text-muted-foreground">
                If the roadmap doesn't help, email us within 7 days of purchase and we'll refund it.
                Every roadmap is generated fresh for your profile — there's nothing canned to resell.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 pb-10 text-center">
          <Button
            className="bg-leap-purple hover:bg-opacity-90 px-8 py-6 text-lg"
            disabled={!status?.enabled || busy}
            onClick={() => proPlan && startCheckout(proPlan)}
          >
            {ctaLabel("Upgrade to Pro", `${proPrice.display}${proCtaSuffix}`)}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UpgradePro;
