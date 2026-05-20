
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export const DashboardHeader: React.FC = () => {
  const { userName, loading } = useDashboard();
  const { toast } = useToast();

  const handleGenerateReport = () => {
    toast({
      title: "Generating Report",
      description: "Your AI-powered career report is being generated.",
    });
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        {loading ? (
          <>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Welcome back, {userName}!</h1>
            <p className="text-muted-foreground">Your career journey continues here</p>
          </>
        )}
      </div>
      <Button 
        className="bg-leap-purple hover:bg-opacity-90"
        onClick={handleGenerateReport}
        disabled={loading}
      >
        Generate AI Report <ArrowUpRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};
