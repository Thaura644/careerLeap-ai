import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";
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

export const UpgradeToPro: React.FC = () => {
  const [proPrice, setProPrice] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);

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
    return () => {
      cancelled = true;
    };
  }, []);

  if (isPro) {
    return (
      <Card className="bg-leap-purple text-white">
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
    <Card className="bg-leap-purple text-white">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-2">Upgrade to Pro</h3>
        <p className="text-sm opacity-90 mb-4">
          Unlimited AI conversations, advanced insights, and Pro-gated resources.
        </p>
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
            Upgrade Now
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
