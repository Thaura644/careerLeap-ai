import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

/** Honest placeholder for the not-yet-built Enterprise offering. */
export const AIEnterpriseFeatures: React.FC = () => {
  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div>
          <CardTitle>Enterprise</CardTitle>
          <CardDescription>
            Team-level skills mapping and workforce analytics — on the roadmap, not built yet.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-sm text-muted-foreground">
          There's no Enterprise plan to buy yet. When it exists, it will be team skills
          mapping, custom integration, and workforce analytics — and this page will say so.
          For now, Pro covers everything that's actually available.
        </p>
        <Link to="/upgrade" className="text-sm text-leap-purple hover:underline">
          See what's available now on /upgrade →
        </Link>
      </CardContent>
    </Card>
  );
};
