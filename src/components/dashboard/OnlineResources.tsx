import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export const OnlineResources: React.FC = () => {
  const { onlineResources, loading } = useDashboard();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Online Resources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))
        ) : (
          onlineResources.map((resource) => (
            <div key={resource.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{resource.title}</h3>
                <Badge variant="outline">{resource.badge}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {resource.description || "Part of the Leap.ai learning library."}
              </p>
              <Link to="/resources">
                <Button
                  variant="link"
                  size="sm"
                  className="text-leap-purple px-0 flex items-center"
                >
                  Open in the library <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          ))
        )}

        {!loading && onlineResources.length === 0 && (
          <div className="text-center p-4">
            <p className="text-muted-foreground">No recommended resources yet</p>
            <Link to="/resources">
              <Button variant="link" className="text-leap-purple mt-2">
                Explore resources
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
