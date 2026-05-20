
import React from "react";
import { EventCard } from "./EventCard";
import { useResources } from "@/context/ResourcesContext";
import { Skeleton } from "@/components/ui/skeleton";

export const EventsSection: React.FC = () => {
  const { upcomingEvents, loading } = useResources();

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-6">Upcoming Live Events</h2>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-6">
              <Skeleton className="h-12 w-12 rounded-lg mb-4" />
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-9 w-32 mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};
