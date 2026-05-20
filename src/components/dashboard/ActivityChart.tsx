
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart } from "@/components/ui/area-chart";
import { useDashboard } from "@/context/DashboardContext";
import { Skeleton } from "@/components/ui/skeleton";

export const ActivityChart: React.FC = () => {
  const { activityData, loading } = useDashboard();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Activity Overview</CardTitle>
        <CardDescription>Your engagement over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="h-[200px]">
        {loading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <AreaChart data={activityData} />
        )}
      </CardContent>
    </Card>
  );
};
