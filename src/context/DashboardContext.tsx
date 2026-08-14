import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiGet } from "@/lib/api";

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
  percentChange: number;
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

  useEffect(() => {
    const localUser = localStorage.getItem("leap_user");
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser);
        if (parsed?.fullName) setUserName(parsed.fullName.split(" ")[0]);
      } catch {
        // noop
      }
    }

    const fetchDashboardData = async () => {
      // Not logged in? Skip the protected call entirely (it would just 401).
      if (!localStorage.getItem("leap_token")) {
        setLoading(false);
        return;
      }
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
      } catch (err) {
        // Honest empty state — the dashboard shows real numbers or nothing.
        setActivityData([]);
        setSkillsData([]);
        setOverviewCards([]);
        setUpcomingSessions([]);
        setOnlineResources([]);
        setAchievements([]);
        setError("Could not load your dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
