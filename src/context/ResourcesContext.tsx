import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { getAuthToken } from "@/lib/authSession";

// Define types for resource data
export interface ResourceType {
  id: string;
  title: string;
  type: string;
  rating: number;
  reviews: number;
  duration: string;
  image: string;
  isPro: boolean;
  isBookmarked: boolean;
  isCompleted?: boolean;
  description?: string;
  /** External link the resource actually opens (engine/creator resources). */
  url?: string | null;
  /** Where it came from: "library" | "open" | "creator". */
  source?: string;
  createdByName?: string | null;
}

export interface EventType {
  id: string;
  title: string;
  description: string;
  type: string;
  isPro: boolean;
  date: string;
  time: string;
  color: string;
  hostName?: string | null;
  joinUrl?: string | null;
  isLive?: boolean;
}

interface ResourcesContextType {
  trendingResources: ResourceType[];
  recommendedResources: ResourceType[];
  bookmarkedResources: ResourceType[];
  completedResources: ResourceType[];
  openResources: ResourceType[];
  creatorResources: ResourceType[];
  upcomingEvents: EventType[];
  loading: boolean;
  error: string | null;
  toggleBookmark: (id: string) => void;
  refresh: () => Promise<void>;
}

// Create the context
const ResourcesContext = createContext<ResourcesContextType | undefined>(undefined);

interface ResourcesProviderProps {
  children: ReactNode;
}

export const ResourcesProvider = ({ children }: ResourcesProviderProps) => {
  const [trendingResources, setTrendingResources] = useState<ResourceType[]>([]);
  const [recommendedResources, setRecommendedResources] = useState<ResourceType[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<ResourceType[]>([]);
  const [completedResources, setCompletedResources] = useState<ResourceType[]>([]);
  const [openResources, setOpenResources] = useState<ResourceType[]>([]);
  const [creatorResources, setCreatorResources] = useState<ResourceType[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    // Not logged in? Skip the protected call entirely (it would just 401).
    if (!getAuthToken()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<{
        trendingResources: ResourceType[];
        recommendedResources: ResourceType[];
        bookmarkedResources: ResourceType[];
        completedResources: ResourceType[];
        openResources: ResourceType[];
        creatorResources: ResourceType[];
        upcomingEvents: EventType[];
      }>("/resources");

      setTrendingResources(data.trendingResources || []);
      setRecommendedResources(data.recommendedResources || []);
      setBookmarkedResources(data.bookmarkedResources || []);
      setCompletedResources(data.completedResources || []);
      setOpenResources(data.openResources || []);
      setCreatorResources(data.creatorResources || []);
      setUpcomingEvents(data.upcomingEvents || []);
    } catch (err) {
      // Honest empty state — no invented demo data. The UI says what failed.
      setTrendingResources([]);
      setRecommendedResources([]);
      setBookmarkedResources([]);
      setCompletedResources([]);
      setOpenResources([]);
      setCreatorResources([]);
      setUpcomingEvents([]);
      setError("Could not load the learning library. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const toggleBookmark = async (id: string) => {
    const toggleInArray = (resources: ResourceType[]) =>
      resources.map((resource) =>
        resource.id === id ? { ...resource, isBookmarked: !resource.isBookmarked } : resource
      );

    const all = [...trendingResources, ...recommendedResources];
    const resource = all.find((r) => r.id === id);
    const willBeBookmarked = resource ? !resource.isBookmarked : false;

    setTrendingResources((prev) => toggleInArray(prev));
    setRecommendedResources((prev) => toggleInArray(prev));
    setBookmarkedResources((prev) =>
      willBeBookmarked
        ? resource
          ? [...prev.filter((r) => r.id !== id), { ...resource, isBookmarked: true }]
          : prev
        : prev.filter((r) => r.id !== id)
    );

    // Persist — the server is the source of truth; refresh on failure.
    try {
      await apiPost(`/resources/${id}/bookmark`, {});
    } catch {
      await fetchResources();
    }
  };

  return (
    <ResourcesContext.Provider value={{
      trendingResources,
      recommendedResources,
      bookmarkedResources,
      completedResources,
      openResources,
      creatorResources,
      upcomingEvents,
      loading,
      error,
      toggleBookmark,
      refresh: fetchResources,
    }}>
      {children}
    </ResourcesContext.Provider>
  );
};

// Hook for using the resources context
export const useResources = () => {
  const context = useContext(ResourcesContext);
  if (context === undefined) {
    throw new Error("useResources must be used within a ResourcesProvider");
  }
  return context;
};
