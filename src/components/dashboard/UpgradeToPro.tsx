
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

export const UpgradeToPro: React.FC = () => {
  return (
    <Card className="bg-leap-purple text-white">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-2">Upgrade to Pro</h3>
        <p className="text-sm opacity-90 mb-4">
          Get unlimited AI insights, premium resources, and priority mentorship matching.
        </p>
        <div className="flex items-baseline mb-4">
          <span className="text-2xl font-bold">$19</span>
          <span className="text-sm opacity-90 ml-1">/month</span>
        </div>
        <Button variant="secondary" className="w-full">
          <Crown className="mr-2 h-4 w-4" />
          Upgrade Now
        </Button>
      </CardContent>
    </Card>
  );
};
