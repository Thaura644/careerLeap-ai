import React, { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourcesSection } from "./ResourcesSection";
import { useResources, ResourceType } from "@/context/ResourcesContext";
import { cn } from "@/lib/utils";

const matches = (resource: ResourceType, query: string): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [resource.title, resource.type, resource.description || ""]
    .join(" ")
    .toLowerCase()
    .includes(q);
};

/** Maps the user's preferred learning formats to library resource types. */
const FORMAT_TO_TYPES: Record<string, string[]> = {
  "Video Courses": ["Course"],
  "Books & Documentation": ["eBook", "Guide"],
  "Articles & Blog Posts": ["Guide"],
  "Podcasts": ["Podcast"],
  "Live Workshops & Webinars": ["Workshop", "Webinar"],
};

interface ResourceTabsProps {
  query?: string;
  preferredFormats?: string[];
}

export const ResourceTabs: React.FC<ResourceTabsProps> = ({ query = "", preferredFormats = [] }) => {
  const {
    trendingResources,
    recommendedResources,
    bookmarkedResources,
    completedResources,
    loading,
  } = useResources();

  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Distinct library types present in the catalog.
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    [...trendingResources, ...recommendedResources].forEach((r) => {
      if (r.type) types.add(r.type);
    });
    return Array.from(types).sort();
  }, [trendingResources, recommendedResources]);

  // Types implied by the user's preferred learning formats.
  const preferredTypes = useMemo(() => {
    const types = new Set<string>();
    preferredFormats.forEach((format) => {
      (FORMAT_TO_TYPES[format] || []).forEach((t) => types.add(t));
    });
    return Array.from(types);
  }, [preferredFormats]);

  const typeMatches = (resource: ResourceType): boolean => {
    if (typeFilter === "ALL") return true;
    if (typeFilter === "MY") return preferredTypes.includes(resource.type);
    return resource.type === typeFilter;
  };

  const filter = (list: ResourceType[]) =>
    list.filter((r) => matches(r, query) && typeMatches(r));

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

      {availableTypes.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <FilterChip active={typeFilter === "ALL"} onClick={() => setTypeFilter("ALL")}>
            All types
          </FilterChip>
          {availableTypes.map((type) => (
            <FilterChip key={type} active={typeFilter === type} onClick={() => setTypeFilter(type)}>
              {type}
            </FilterChip>
          ))}
          {preferredTypes.length > 0 && (
            <FilterChip
              active={typeFilter === "MY"}
              onClick={() => setTypeFilter(typeFilter === "MY" ? "ALL" : "MY")}
            >
              ★ My formats
            </FilterChip>
          )}
        </div>
      )}

      {typeFilter === "MY" && preferredTypes.length === 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Your saved formats don't map to library items — try the practice problems or community
          sections for hands-on and discussion formats.
        </p>
      )}

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

const FilterChip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({
  active,
  onClick,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "rounded-full border px-3 py-1 text-xs transition-colors",
      active
        ? "border-leap-purple bg-leap-purple text-white"
        : "border-gray-300 text-muted-foreground hover:border-leap-purple hover:text-leap-purple"
    )}
  >
    {children}
  </button>
);

const SearchEmptyState: React.FC<{ query: string }> = ({ query }) => (
  <div className="text-center p-8 border rounded-lg">
    <h3 className="text-xl font-bold mb-2">No matches for “{query}”</h3>
    <p className="text-muted-foreground">Try a different title, type, or description.</p>
  </div>
);
