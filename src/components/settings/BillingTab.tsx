import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Receipt, Coins, CalendarClock, ArrowRight } from "lucide-react";
import { apiGet } from "@/lib/api";

interface Invoice {
  id: number;
  planId: string;
  planLabel: string;
  reference: string;
  currency: string;
  amountMinor: number | null;
  status: string;
  createdAt: string;
  expiresAt: string | null;
}

interface CreditInfo {
  plan: string;
  creditsTotal: number | string;
  creditsRemaining: number | string;
  creditsUsed: number;
  resetsAt: string | null;
  refreshesIn: number | null;
}

interface BillingSummary {
  plan: string;
  planLabel: string;
  status: string;
  nextRenewal: string | null;
  invoices: Invoice[];
  credits: CreditInfo;
}

const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
};

const fmtTimeLeft = (seconds: number | null) => {
  if (seconds == null || seconds <= 0) return null;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
};

const BillingTab = () => {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiGet<BillingSummary>("/billing/summary")
      .then((s) => setSummary(s))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading your billing…
      </div>
    );
  }

  if (error || !summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Could not load your billing details right now.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The server may be waking up. Refresh in a few seconds.
          </p>
        </CardContent>
      </Card>
    );
  }

  const active = summary.plan === "pro";
  const credits = summary.credits;
  const isUnlimited = credits.plan === "pro";
  const remaining = isUnlimited ? null : (credits.creditsRemaining as number);
  const total = isUnlimited ? null : (credits.creditsTotal as number);
  const used = credits.creditsUsed;
  const refreshLeft = fmtTimeLeft(credits.refreshesIn);
  const pct = !isUnlimited && total ? Math.round((remaining! / total) * 100) : 100;

  return (
    <div className="grid gap-8">
      {/* Plan + Credits */}
      <Card>
        <CardHeader>
          <CardTitle>Plan &amp; credits</CardTitle>
          <CardDescription>Your current plan and AI credits balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${
                  active
                    ? "bg-stone-900 text-stone-50"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {summary.planLabel}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-sm ${
                  active ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${active ? "bg-green-500" : "bg-stone-300"}`} />
                {active ? "Active" : "Free plan"}
              </span>
            </div>
            {!active && (
              <Button asChild className="bg-stone-900 text-stone-50 hover:bg-stone-700">
                <Link to="/upgrade">
                  Upgrade to Pro <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {/* Credits bar */}
          <div className="mt-6 rounded-md border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Coins className="h-4 w-4" /> AI Credits
              </div>
              {isUnlimited ? (
                <span className="text-sm font-bold text-green-600 dark:text-green-400">Unlimited</span>
              ) : (
                <span className="text-sm">
                  <span className="font-bold">{remaining}</span>
                  <span className="text-muted-foreground"> / {total}</span>
                </span>
              )}
            </div>
            {!isUnlimited && (
              <>
                <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-stone-900 dark:bg-stone-100 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {used} used this month · {remaining} remaining
                </p>
                {refreshLeft && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    Credits refresh in {refreshLeft}
                  </p>
                )}
                {credits.resetsAt && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Full reset on {fmtDate(credits.resetsAt)}
                  </p>
                )}
              </>
            )}
            {isUnlimited && (
              <p className="mt-1 text-xs text-muted-foreground">
                Pro plan — no credit limits, use AI as much as you need.
              </p>
            )}
          </div>

          {summary.nextRenewal && (
            <div className="mt-4 flex items-start gap-2 rounded-md border bg-stone-50 px-4 py-3 text-sm dark:bg-stone-950">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />
              <div>
                <p className="font-medium">Next renewal: {fmtDate(summary.nextRenewal)}</p>
                <p className="text-muted-foreground">
                  If not renewed by this date, your account returns to the free plan.
                </p>
              </div>
            </div>
          )}
          {!summary.nextRenewal && !active && (
            <p className="mt-4 text-sm text-muted-foreground">
              You're on the free plan — no recurring charges. Upgrade any time to unlock
              unlimited AI credits and the full practice library.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Invoice history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Invoices
          </CardTitle>
          <CardDescription>Payment history for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {summary.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No payments yet. Invoices appear here when you purchase a plan.
            </p>
          ) : (
            <div className="divide-y">
              {summary.invoices.map((inv) => (
                <div key={inv.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm font-medium">{inv.planLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmtDate(inv.createdAt)}
                      {inv.expiresAt ? ` · until ${fmtDate(inv.expiresAt)}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize">
                      {inv.currency} {inv.amountMinor != null ? (inv.amountMinor / 100).toFixed(2) : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{inv.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingTab;
