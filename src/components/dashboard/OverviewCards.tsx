
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDashboard } from "@/context/DashboardContext";
import { Skeleton } from "@/components/ui/skeleton";

export const OverviewCards: React.FC = () => {
  const { overviewCards, loading } = useDashboard();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {loading ? (
        // Loading skeleton state
        Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-36" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))
      ) : (
        // Loaded cards
        overviewCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold">{card.value}</span>
                {card.percentChange > 0 ? (
                  <span className="text-green-500 text-sm font-medium">+{card.percentChange}% from last week</span>
                ) : card.percentChange < 0 ? (
                  <span className="text-red-500 text-sm font-medium">{card.percentChange}% from last week</span>
                ) : (
                  <span className="text-blue-500 text-sm font-medium">{card.secondaryText || 'No change'}</span>
                )}
              </div>
              <Progress value={card.progressValue} className="h-2" />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
