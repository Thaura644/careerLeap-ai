import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check, Zap } from "lucide-react";
import { apiGet } from "@/lib/api";
import { Link } from "react-router-dom";

interface PriceEntry {
  displayPrice: string;
  amountMinor: number;
}

interface PlanDto {
  id: string;
  label: string;
  prices: Record<string, PriceEntry>;
}

interface PaymentsStatus {
  mode: string;
  enabled: boolean;
  plans: PlanDto[];
}

/** Shape of GET /api/billing/summary's "credits" field (CreditService.status). */
interface CreditStatus {
  plan: "free" | "pro";
  creditsTotal: number | "Unlimited";
  creditsRemaining: number | "Unlimited";
  creditsUsed: number;
  refreshesIn: number | null;
}

export const UpgradeToPro: React.FC = () => {
  const [proPrice, setProPrice] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [credits, setCredits] = useState<CreditStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Real pricing is served by the backend — never hardcoded in the UI.
    apiGet<PaymentsStatus>("/payments/status")
      .then((status) => {
        if (!cancelled) {
        const pro = (status.plans || []).find((p) => p.id === "pro-monthly");
        const usd = pro?.prices?.["USD"];
        if (pro && usd) setProPrice(`${usd.displayPrice}/month`);
        }
      })
      .catch(() => {
        // Fall back to nothing — the card simply won't show a price.
      });
    apiGet<{ pro: boolean }>("/payments/me")
      .then((me) => {
        if (!cancelled) setIsPro(Boolean(me.pro));
      })
      .catch(() => {});
    // Usage-based upsell: once a free user has burned through most of their
    // monthly credits, the card below switches to a usage-specific nudge
    // instead of the generic pitch — shown at the moment the constraint is
    // actually felt, not just as a permanent sidebar ad.
    apiGet<{ credits: CreditStatus }>("/billing/summary")
      .then((res) => {
        if (!cancelled) setCredits(res.credits);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const remaining = typeof credits?.creditsRemaining === "number" ? credits.creditsRemaining : null;
  const total = typeof credits?.creditsTotal === "number" ? credits.creditsTotal : null;
  const isLow = remaining !== null && total !== null && total > 0 && remaining / total <= 0.25;
  const isExhausted = remaining === 0;

  if (isPro) {
    return (
      <Card className="bg-edu-indigo text-white">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Crown className="h-5 w-5" /> You're on Pro
          </h3>
          <p className="text-sm opacity-90 mb-4">
            Thanks for supporting Leap.ai — all Pro features are unlocked on your account.
          </p>
          <Link to="/upgrade">
            <Button variant="secondary" className="w-full">
              Manage your plan
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-edu-indigo text-white">
      <CardContent className="p-6">
        {isExhausted ? (
          <>
            <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
              <Zap className="h-5 w-5" /> Free credits used up
            </h3>
            <p className="mb-4 text-sm opacity-90">
              {credits?.refreshesIn
                ? `A partial refill lands in about ${Math.max(1, Math.round(credits.refreshesIn / 3600))}h, or go Pro for unlimited right now.`
                : "Go Pro for unlimited AI conversations, roadmaps, and resource generation — no waiting on a refill."}
            </p>
          </>
        ) : isLow ? (
          <>
            <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
              <Zap className="h-5 w-5" /> Running low on credits
            </h3>
            <p className="mb-1.5 text-sm opacity-90">
              You've used {credits!.creditsUsed}/{total} free credits this month.
            </p>
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${Math.min(100, Math.round(((total! - remaining!) / total!) * 100))}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-2">Upgrade to Pro</h3>
            <p className="text-sm opacity-90 mb-4">
              Unlimited AI conversations, advanced insights, and Pro-gated resources.
            </p>
          </>
        )}
        {proPrice && (
          <div className="flex items-baseline mb-4">
            <span className="text-2xl font-bold">{proPrice.split("/")[0]}</span>
            <span className="text-sm opacity-90 ml-1">/month</span>
          </div>
        )}
        <ul className="space-y-1.5 mb-4 text-sm opacity-95">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4" /> Unlimited AI career conversations
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4" /> Advanced insights and skill-gap analysis
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4" /> Pro-gated courses and events
          </li>
        </ul>
        <Link to="/upgrade">
          <Button variant="secondary" className="w-full">
            <Crown className="mr-2 h-4 w-4" />
            {isExhausted || isLow ? "Go unlimited" : "Upgrade Now"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
