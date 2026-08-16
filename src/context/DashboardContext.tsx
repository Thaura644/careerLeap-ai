import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { apiGet } from "@/lib/api";
import { getAuthToken, getAuthUser } from "@/lib/authSession";

// Define types for dashboard data
export interface ActivityDataPoint {
  name: string;
  value: number;
}

export interface SkillDataPoint {
  name: string;
  value: number;
}

export interface OverviewCardData {
  title: string;
  value: string;
  progressValue: number;
  secondaryText?: string;
}

export interface SessionData {
  id: string;
  title: string;
  time: string;
  type: "mentor" | "peer" | "workshop";
  event?: boolean;
}

export interface ResourceData {
  id: string;
  title: string;
  type: string;
  badge?: string;
  description?: string;
  duration?: string;
  url?: string;
}

export interface AchievementData {
  id: string;
  title: string;
  date: string;
  color: string;
}

interface DashboardContextType {
  activityData: ActivityDataPoint[];
  skillsData: SkillDataPoint[];
  overviewCards: OverviewCardData[];
  upcomingSessions: SessionData[];
  onlineResources: ResourceData[];
  achievements: AchievementData[];
  userName: string;
  hasRoadmap: boolean;
  loading: boolean;
  error: string | null;
}

// Create the context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  const [activityData, setActivityData] = useState<ActivityDataPoint[]>([]);
  const [skillsData, setSkillsData] = useState<SkillDataPoint[]>([]);
  const [overviewCards, setOverviewCards] = useState<OverviewCardData[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<SessionData[]>([]);
  const [onlineResources, setOnlineResources] = useState<ResourceData[]>([]);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [userName, setUserName] = useState<string>("there");
  const [hasRoadmap, setHasRoadmap] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearData = useCallback(() => {
    setActivityData([]);
    setSkillsData([]);
    setOverviewCards([]);
    setUpcomingSessions([]);
    setOnlineResources([]);
    setAchievements([]);
    setUserName("there");
    setHasRoadmap(false);
    setError(null);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    // Not logged in? Skip the protected call entirely (it would just 401).
    if (!getAuthToken()) {
      clearData();
      setLoading(false);
      return;
    }
    const localUser = getAuthUser();
    if (localUser?.fullName) setUserName(localUser.fullName.split(" ")[0]);
    try {
      const data = await apiGet<{
        userName: string;
        activityData: ActivityDataPoint[];
        skillsData: SkillDataPoint[];
        overviewCards: OverviewCardData[];
        upcomingSessions: SessionData[];
        onlineResources: ResourceData[];
        achievements: AchievementData[];
        hasRoadmap: boolean;
      }>("/dashboard");

      setActivityData(data.activityData || []);
      setSkillsData(data.skillsData || []);
      setOverviewCards(data.overviewCards || []);
      setUpcomingSessions(data.upcomingSessions || []);
      setOnlineResources(data.onlineResources || []);
      setAchievements(data.achievements || []);
      setUserName(data.userName || "there");
      setHasRoadmap(data.hasRoadmap || false);
      setError(null);
    } catch (err) {
      // Honest empty state — the dashboard shows real numbers or nothing.
      clearData();
      setError("Could not load your dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [clearData]);

  // Load on mount, then re-sync whenever the session changes (login, logout,
  // or a different account signing in). Without this the dashboard would keep
  // showing the previous account's data — the very bug where the next user's
  // name renders with the old user's roadmap underneath.
  useEffect(() => {
    fetchDashboardData();
    const sync = () => fetchDashboardData();
    window.addEventListener("leap:auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("leap:auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [fetchDashboardData]);

  return (
    <DashboardContext.Provider value={{
      activityData,
      skillsData,
      overviewCards,
      upcomingSessions,
      onlineResources,
      achievements,
      userName,
      hasRoadmap,
      loading,
      error,
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

// Hook for using the dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
