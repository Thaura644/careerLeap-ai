
import React from "react";
import { ResourceCard } from "./ResourceCard";
import { ResourceType } from "@/context/ResourcesContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ResourcesSectionProps {
  title?: string;
  description?: string;
  resources: ResourceType[];
  loading?: boolean;
}

export const ResourcesSection: React.FC<ResourcesSectionProps> = ({
  title,
  description,
  resources,
  loading = false
}) => {
  return (
    <div className="mb-6">
      {title && <h2 className="text-xl font-bold mb-1">{title}</h2>}
      {description && <p className="text-muted-foreground mb-4">{description}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))
        ) : (
          resources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))
        )}
      </div>
    </div>
  );
};
