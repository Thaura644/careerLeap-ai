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

interface Usage {
  monthPromptTokens: number;
  monthCompletionTokens: number;
  monthTotalTokens: number;
  monthRequests: number;
  model: string;
  freeModel: boolean;
  estimatedCostUsd: number;
  note: string;
}

interface BillingSummary {
  plan: string;
  planLabel: string;
  status: string;
  nextRenewal: string | null;
  invoices: Invoice[];
  usage: Usage;
}

const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
};

const fmtNumber = (n: number) => n.toLocaleString();

/** Invoice rows + plan status + a per-user LLM usage breakdown. Everything is
 *  scoped to the signed-in user server-side; nothing here is shared. */
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
            The server may be waking up. Refresh in a few seconds to see your plan, invoices, and usage.
          </p>
        </CardContent>
      </Card>
    );
  }

  const active = summary.plan === "pro";

  return (
    <div className="grid gap-8">
      {/* Plan status + renewal schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Plan &amp; renewal</CardTitle>
          <CardDescription>Your current plan, its status, and when it renews</CardDescription>
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
                {active ? "Active" : summary.status === "expired" ? "Expired — downgraded to Free" : "Free plan"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {!active && (
                <Button asChild className="bg-stone-900 text-stone-50 hover:bg-stone-700">
                  <Link to="/upgrade">
                    Upgrade to Pro <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {summary.nextRenewal && (
            <div className="mt-5 flex items-start gap-2 rounded-md border bg-stone-50 px-4 py-3 text-sm dark:bg-stone-950">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />
              <div>
                <p className="font-medium">Next renewal: {fmtDate(summary.nextRenewal)}</p>
                <p className="text-muted-foreground">
                  If the subscription isn't renewed by this date, your account returns to the free
                  plan automatically — Pro features turn off, nothing extra is charged.
                </p>
              </div>
            </div>
          )}
          {!summary.nextRenewal && !active && (
            <p className="mt-5 text-sm text-muted-foreground">
              You're on the free plan — no recurring charges, no card on file. Upgrade any time to
              unlock the full practice library, scenarios, and creator content.
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
          <CardDescription>
            Every payment confirmed on your account — what was paid, when, and what it covered.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No payments yet. When you buy the Career Audit or subscribe to Pro, the invoice
              appears here with its reference, amount, and coverage period.
            </p>
          ) : (
            <div className="divide-y">
              {summary.invoices.map((inv) => (
                <div key={inv.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm font-medium">{inv.planLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmtDate(inv.createdAt)}
                      {inv.expiresAt ? ` · covers until ${fmtDate(inv.expiresAt)}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize">
                      {inv.currency} {inv.amountMinor != null ? (inv.amountMinor / 100).toFixed(2) : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ref {inv.reference.slice(0, 14)}… · {inv.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage breakdown — where the allowance goes (incl. LLM tokens) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-4 w-4" /> Usage breakdown
          </CardTitle>
          <CardDescription>
            How your allowance is being used — including the AI (LLM) compute behind your roadmap,
            practice hints, and assistant answers. This is your account's data, shown only to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-md border p-4">
              <p className="text-2xl font-bold">{fmtNumber(summary.usage.monthTotalTokens)}</p>
              <p className="text-xs text-muted-foreground">LLM tokens (30 days)</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-2xl font-bold">{fmtNumber(summary.usage.monthRequests)}</p>
              <p className="text-xs text-muted-foreground">AI requests</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-2xl font-bold">{fmtNumber(summary.usage.monthPromptTokens)}</p>
              <p className="text-xs text-muted-foreground">Input tokens</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-2xl font-bold">{fmtNumber(summary.usage.monthCompletionTokens)}</p>
              <p className="text-xs text-muted-foreground">Output tokens</p>
            </div>
          </div>
          <div className="mt-4 rounded-md border bg-stone-50 px-4 py-3 text-sm dark:bg-stone-950">
            <p className="font-medium">
              Estimated LLM cost:{" "}
              <span className="font-bold text-green-600 dark:text-green-400">
                ${summary.usage.estimatedCostUsd.toFixed(2)}
              </span>
            </p>
            <p className="mt-1 text-muted-foreground">{summary.usage.note}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.usage.model || "Model not configured yet"}
            </p>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium">What your plan pays for</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>· Server &amp; infrastructure that keeps the app fast (no spin-down delays)</li>
              <li>· The practice judge, scenarios, and creator content hosting</li>
              <li>· AI compute — recorded per request above (today: a free model, so $0)</li>
              <li>· Support and continued development</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingTab;
