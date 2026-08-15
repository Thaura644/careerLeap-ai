import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LineArt } from "@/components/common/LineArt";

export const Achievements: React.FC = () => {
  const { achievements, loading } = useDashboard();

  const getColorClasses = (color: string) => {
    switch (color) {
      case "amber":
        return "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400";
      case "blue":
        return "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400";
      case "green":
        return "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400";
      case "purple":
        return "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400";
      default:
        return "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Achievements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex items-center">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div>
                <Skeleton className="h-5 w-28 mb-1" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          ))
        ) : achievements.length === 0 ? (
          <div className="text-center py-6">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center text-leap-purple">
              <LineArt variant="climb" className="h-16 w-16" />
            </div>
            <p className="text-sm font-medium mb-1">No achievements yet</p>
            <p className="text-sm text-muted-foreground">
              Complete resources and goals to earn your first ones.
            </p>
          </div>
        ) : (
          achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center">
              <div className={cn("p-2 rounded-full mr-3", getColorClasses(achievement.color))}>
                <Award size={20} />
              </div>
              <div>
                <h3 className="font-medium">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground">{achievement.date}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
