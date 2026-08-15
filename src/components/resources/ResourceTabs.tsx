import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourcesSection } from "./ResourcesSection";
import { useResources, ResourceType } from "@/context/ResourcesContext";

const matches = (resource: ResourceType, query: string): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [resource.title, resource.type, resource.description || ""]
    .join(" ")
    .toLowerCase()
    .includes(q);
};

interface ResourceTabsProps {
  query?: string;
}

export const ResourceTabs: React.FC<ResourceTabsProps> = ({ query = "" }) => {
  const {
    trendingResources,
    recommendedResources,
    bookmarkedResources,
    completedResources,
    loading,
  } = useResources();

  const filter = (list: ResourceType[]) => list.filter((r) => matches(r, query));

  const noMatches = (list: ResourceType[]) =>
    !loading && query.trim() !== "" && filter(list).length === 0;

  return (
    <Tabs defaultValue="trending" className="mb-8">
      <TabsList>
        <TabsTrigger value="trending">Trending</TabsTrigger>
        <TabsTrigger value="recommended">Recommended</TabsTrigger>
        <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>

      <TabsContent value="trending" className="mt-6">
        <ResourcesSection resources={filter(trendingResources)} loading={loading} />
        {noMatches(trendingResources) && <SearchEmptyState query={query} />}
      </TabsContent>

      <TabsContent value="recommended" className="mt-6">
        <ResourcesSection
          title="Based on Your Career Goals"
          resources={filter(recommendedResources)}
          loading={loading}
        />
        {noMatches(recommendedResources) && <SearchEmptyState query={query} />}
      </TabsContent>

      <TabsContent value="bookmarked" className="mt-6">
        <ResourcesSection resources={filter(bookmarkedResources)} loading={loading} />
        {!loading && query.trim() === "" && bookmarkedResources.length === 0 && (
          <div className="text-center p-8 border rounded-lg">
            <h3 className="text-xl font-bold mb-2">No bookmarks yet</h3>
            <p className="text-muted-foreground mb-4">
              Save resources you're interested in by clicking the bookmark icon on any resource card.
            </p>
          </div>
        )}
        {noMatches(bookmarkedResources) && <SearchEmptyState query={query} />}
      </TabsContent>

      <TabsContent value="completed" className="mt-6">
        <ResourcesSection resources={filter(completedResources)} loading={loading} />
        {!loading && query.trim() === "" && completedResources.length === 0 && (
          <div className="text-center p-8 border rounded-lg">
            <h3 className="text-xl font-bold mb-2">No completed resources</h3>
            <p className="text-muted-foreground mb-4">
              As you complete resources, they will appear here to help you track your progress.
            </p>
          </div>
        )}
        {noMatches(completedResources) && <SearchEmptyState query={query} />}
      </TabsContent>
    </Tabs>
  );
};

const SearchEmptyState: React.FC<{ query: string }> = ({ query }) => (
  <div className="text-center p-8 border rounded-lg">
    <h3 className="text-xl font-bold mb-2">No matches for “{query}”</h3>
    <p className="text-muted-foreground">Try a different title, type, or description.</p>
  </div>
);
