
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourcesSection } from "./ResourcesSection";
import { Button } from "@/components/ui/button";
import { useResources } from "@/context/ResourcesContext";
import { EventCard } from "./EventCard";

export const ResourceTabs: React.FC = () => {
  const { 
    trendingResources, 
    recommendedResources, 
    bookmarkedResources, 
    completedResources, 
    loading 
  } = useResources();

  return (
    <Tabs defaultValue="trending" className="mb-8">
      <TabsList>
        <TabsTrigger value="trending">Trending</TabsTrigger>
        <TabsTrigger value="recommended">Recommended</TabsTrigger>
        <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>
      
      <TabsContent value="trending" className="mt-6">
        <ResourcesSection 
          resources={trendingResources}
          loading={loading}
        />
        
        {!loading && trendingResources.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline">Load More Resources</Button>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="recommended" className="mt-6">
        <ResourcesSection 
          title="Based on Your Career Goals"
          resources={recommendedResources.slice(0, 3)}
          loading={loading}
        />
        
        <ResourcesSection 
          title="Industry-Specific Resources"
          resources={recommendedResources.slice(3, 6)}
          loading={loading}
        />
      </TabsContent>
      
      <TabsContent value="bookmarked" className="mt-6">
        <ResourcesSection 
          resources={bookmarkedResources}
          loading={loading}
        />
        
        {!loading && bookmarkedResources.length === 0 && (
          <div className="text-center p-8 border rounded-lg">
            <h3 className="text-xl font-bold mb-2">No bookmarks yet</h3>
            <p className="text-muted-foreground mb-4">
              Save resources you're interested in by clicking the bookmark icon on any resource card.
            </p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="completed" className="mt-6">
        <ResourcesSection 
          resources={completedResources}
          loading={loading}
        />
        
        {!loading && completedResources.length === 0 && (
          <div className="text-center p-8 border rounded-lg">
            <h3 className="text-xl font-bold mb-2">No completed resources</h3>
            <p className="text-muted-foreground mb-4">
              As you complete resources, they will appear here to help you track your progress.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
