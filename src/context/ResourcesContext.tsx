
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiGet, apiPost } from "@/lib/api";

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
}

interface ResourcesContextType {
  trendingResources: ResourceType[];
  recommendedResources: ResourceType[];
  bookmarkedResources: ResourceType[];
  completedResources: ResourceType[];
  upcomingEvents: EventType[];
  loading: boolean;
  error: string | null;
  toggleBookmark: (id: string) => void;
}

// Create the context
const ResourcesContext = createContext<ResourcesContextType | undefined>(undefined);

// Dummy data
const dummyTrendingResources: ResourceType[] = [
  { 
    id: "1",
    title: "System Design for Senior Engineers",
    type: "Course",
    rating: 4.9,
    reviews: 128,
    duration: "8 hours",
    image: "/placeholder.svg",
    isPro: false,
    isBookmarked: false
  },
  { 
    id: "2",
    title: "Leadership for Technical Managers",
    type: "Course",
    rating: 4.7,
    reviews: 86,
    duration: "5 hours",
    image: "/placeholder.svg",
    isPro: true,
    isBookmarked: true
  },
  { 
    id: "3",
    title: "Effective Communication in Tech Teams",
    type: "Workshop",
    rating: 4.8,
    reviews: 42,
    duration: "2 hours",
    image: "/placeholder.svg",
    isPro: false,
    isBookmarked: false
  },
  { 
    id: "4",
    title: "Negotiation Skills for Career Advancement",
    type: "Guide",
    rating: 4.6,
    reviews: 56,
    duration: "45 minutes",
    image: "/placeholder.svg",
    isPro: false,
    isBookmarked: true
  },
  { 
    id: "5",
    title: "AI-Powered Job Search Strategies",
    type: "Webinar",
    rating: 4.5,
    reviews: 34,
    duration: "1 hour",
    image: "/placeholder.svg",
    isPro: true,
    isBookmarked: false
  },
  { 
    id: "6",
    title: "Personal Branding for Professionals",
    type: "Course",
    rating: 4.9,
    reviews: 67,
    duration: "4 hours",
    image: "/placeholder.svg",
    isPro: false,
    isBookmarked: false
  }
];

const dummyRecommendedResources: ResourceType[] = [
  { 
    id: "7",
    title: "Advanced System Architecture",
    type: "Course",
    rating: 4.9,
    reviews: 213,
    duration: "10 hours",
    image: "/placeholder.svg",
    isPro: true,
    isBookmarked: true
  },
  { 
    id: "8",
    title: "Team Leadership Workshop",
    type: "Workshop",
    rating: 4.8,
    reviews: 78,
    duration: "3 hours",
    image: "/placeholder.svg",
    isPro: false,
    isBookmarked: false
  },
  { 
    id: "9",
    title: "Microservices Design Patterns",
    type: "Guide",
    rating: 4.7,
    reviews: 92,
    duration: "6 hours",
    image: "/placeholder.svg",
    isPro: false,
    isBookmarked: true
  },
  { 
    id: "10",
    title: "Tech Leadership in Startups",
    type: "Podcast",
    rating: 4.6,
    reviews: 45,
    duration: "5 episodes",
    image: "/placeholder.svg",
    isPro: false,
    isBookmarked: false
  },
  { 
    id: "11",
    title: "AI Ethics for Developers",
    type: "Course",
    rating: 4.9,
    reviews: 67,
    duration: "4 hours",
    image: "/placeholder.svg",
    isPro: true,
    isBookmarked: false
  },
  { 
    id: "12",
    title: "Building Resilient Systems",
    type: "eBook",
    rating: 4.8,
    reviews: 112,
    duration: "180 pages",
    image: "/placeholder.svg",
    isPro: false,
    isBookmarked: true
  }
];

const dummyCompletedResources: ResourceType[] = [
  { 
    id: "13",
    title: "JavaScript for Senior Engineers",
    type: "Course",
    rating: 4.9,
    reviews: 156,
    duration: "7 hours",
    image: "/placeholder.svg",
    isPro: false,
    isBookmarked: false,
    isCompleted: true
  },
  { 
    id: "14",
    title: "Code Review Best Practices",
    type: "Workshop",
    rating: 4.8,
    reviews: 92,
    duration: "2 hours",
    image: "/placeholder.svg",
    isPro: false,
    isBookmarked: false,
    isCompleted: true
  }
];

const dummyUpcomingEvents: EventType[] = [
  {
    id: "1",
    title: "Career Transition Strategies",
    description: "Learn how to effectively transition to a new role or industry with minimal friction.",
    type: "Webinar",
    isPro: false,
    date: "April 20, 2025",
    time: "2:00 PM EST",
    color: "blue"
  },
  {
    id: "2",
    title: "AI Tools for Career Development",
    description: "Hands-on workshop on leveraging AI tools to accelerate your professional growth.",
    type: "Workshop",
    isPro: true,
    date: "April 25, 2025",
    time: "1:00 PM EST",
    color: "purple"
  }
];

interface ResourcesProviderProps {
  children: ReactNode;
}

export const ResourcesProvider = ({ children }: ResourcesProviderProps) => {
  const [trendingResources, setTrendingResources] = useState<ResourceType[]>([]);
  const [recommendedResources, setRecommendedResources] = useState<ResourceType[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<ResourceType[]>([]);
  const [completedResources, setCompletedResources] = useState<ResourceType[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await apiGet<{
          trendingResources: ResourceType[];
          recommendedResources: ResourceType[];
          bookmarkedResources: ResourceType[];
          completedResources: ResourceType[];
          upcomingEvents: EventType[];
        }>("/resources");

        setTrendingResources(data.trendingResources || []);
        setRecommendedResources(data.recommendedResources || []);
        setBookmarkedResources(data.bookmarkedResources || []);
        setCompletedResources(data.completedResources || []);
        setUpcomingEvents(data.upcomingEvents || []);
        setLoading(false);
      } catch (err) {
        // Fallback to dummy data so all feature ideas remain visible in UI
        setTrendingResources(dummyTrendingResources);
        setRecommendedResources(dummyRecommendedResources);
        setBookmarkedResources([...dummyTrendingResources, ...dummyRecommendedResources].filter(r => r.isBookmarked));
        setCompletedResources(dummyCompletedResources);
        setUpcomingEvents(dummyUpcomingEvents);
        setError("Backend unavailable. Showing demo resource data.");
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const toggleBookmark = async (id: string) => {
    // Helper function to toggle bookmark in a resource array
    const toggleInArray = (resources: ResourceType[]) => {
      return resources.map(resource => 
        resource.id === id 
          ? { ...resource, isBookmarked: !resource.isBookmarked } 
          : resource
      );
    };

    // Notify backend (best-effort)
    try {
      await apiPost(`/resources/${id}/bookmark`, {});
    } catch {
      // keep UI responsive even if backend call fails
    }

    // Update all arrays that might contain this resource
    setTrendingResources(toggleInArray(trendingResources));
    setRecommendedResources(toggleInArray(recommendedResources));
    
    // Update bookmarked array
    const resource = [...trendingResources, ...recommendedResources].find(r => r.id === id);
    if (resource) {
      const isCurrentlyBookmarked = resource.isBookmarked;
      if (isCurrentlyBookmarked) {
        // Remove from bookmarked
        setBookmarkedResources(bookmarkedResources.filter(r => r.id !== id));
      } else {
        // Add to bookmarked
        setBookmarkedResources([...bookmarkedResources, {...resource, isBookmarked: true}]);
      }
    }
  };

  return (
    <ResourcesContext.Provider value={{
      trendingResources,
      recommendedResources,
      bookmarkedResources,
      completedResources,
      upcomingEvents,
      loading,
      error,
      toggleBookmark
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
