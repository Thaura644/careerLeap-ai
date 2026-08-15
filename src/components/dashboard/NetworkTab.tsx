import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineArt } from "@/components/common/LineArt";

export const NetworkTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Network</CardTitle>
        <CardDescription>Connect with peers and professionals</CardDescription>
      </CardHeader>
      <CardContent className="py-10 text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center text-leap-purple">
          <LineArt variant="network" />
        </div>
        <h3 className="font-semibold mb-1">Connections are coming</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Networking features — profiles, connections, and matching — are on the roadmap but not
          built yet. This page will light up when they exist, and it will never show you
          connections that aren't real.
        </p>
      </CardContent>
    </Card>
  );
};
