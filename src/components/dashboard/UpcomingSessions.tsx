
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export const UpcomingSessions: React.FC = () => {
  const { upcomingSessions, loading } = useDashboard();
  const { toast } = useToast();

  const handleSessionAction = (title: string) => {
    toast({
      title: "Session Action",
      description: `Action taken for: ${title}`,
    });
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case "mentor":
        return <Calendar size={20} />;
      case "peer":
        return <Users size={20} />;
      default:
        return <Calendar size={20} />;
    }
  };

  const getSessionIconClasses = (type: string) => {
    switch (type) {
      case "mentor":
        return "bg-leap-purple/10 dark:bg-leap-purple/20 text-leap-purple";
      case "peer":
        return "bg-leap-teal/10 dark:bg-leap-teal/20 text-leap-teal";
      default:
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-600";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex items-start">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-24 mt-2" />
              </div>
            </div>
          ))
        ) : (
          upcomingSessions.map(session => (
            <div key={session.id} className="flex items-start">
              <div className={`p-2 rounded-full mr-3 ${getSessionIconClasses(session.type)}`}>
                {getSessionIcon(session.type)}
              </div>
              <div>
                <h3 className="font-medium">{session.title}</h3>
                <p className="text-sm text-muted-foreground">{session.time}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={() => handleSessionAction(session.title)}
                >
                  {session.type === "mentor" ? "Join Meeting" : "View Details"}
                </Button>
              </div>
            </div>
          ))
        )}

        {!loading && upcomingSessions.length === 0 && (
          <div className="text-center p-4">
            <p className="text-muted-foreground">No upcoming sessions</p>
            <Button variant="outline" size="sm" className="mt-2">
              Schedule a session
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
