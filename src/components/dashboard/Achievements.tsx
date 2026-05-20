
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ChevronRight } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const Achievements: React.FC = () => {
  const { achievements, loading } = useDashboard();
  const { toast } = useToast();

  const handleViewAll = () => {
    toast({
      title: "Achievements",
      description: "Viewing all achievements",
    });
  };

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
        ) : (
          achievements.map(achievement => (
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
        
        <Button 
          variant="link" 
          className="mt-2 px-0 text-leap-purple flex items-center"
          onClick={handleViewAll}
          disabled={loading}
        >
          View all achievements <ChevronRight size={16} />
        </Button>
      </CardContent>
    </Card>
  );
};
