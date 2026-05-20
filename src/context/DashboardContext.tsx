
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
  loading: boolean;
  error: string | null;
}

// Create the context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Dummy data
const dummyActivityData: ActivityDataPoint[] = [
  { name: "Apr 01", value: 20 },
  { name: "Apr 05", value: 35 },
  { name: "Apr 10", value: 15 },
  { name: "Apr 15", value: 40 },
  { name: "Apr 20", value: 30 },
  { name: "Apr 25", value: 45 },
  { name: "Apr 30", value: 60 },
];

const dummySkillsData: SkillDataPoint[] = [
  { name: "Technical", value: 65 },
  { name: "Leadership", value: 30 },
  { name: "Communication", value: 45 },
  { name: "Domain", value: 55 },
];

const dummyOverviewCards: OverviewCardData[] = [
  {
    title: "Career Roadmap Progress",
    value: "68%",
    percentChange: 4,
    progressValue: 68,
  },
  {
    title: "Skills Completed",
    value: "12/20",
    percentChange: 2,
    secondaryText: "2 new this month",
    progressValue: 60,
  },
  {
    title: "Mentor Sessions",
    value: "3",
    percentChange: 0,
    secondaryText: "Next: Today, 3PM",
    progressValue: 30,
  },
];

const dummyUpcomingSessions: SessionData[] = [
  {
    id: "1",
    title: "Mentor Session: System Design Review",
    time: "Today, 3:00 PM",
    type: "mentor",
  },
  {
    id: "2",
    title: "Peer Group: Frontend Masters",
    time: "Tomorrow, 5:00 PM",
    type: "peer",
  },
];

const dummyOnlineResources: ResourceData[] = [
  {
    id: "1",
    title: "System Design Interview Guide",
    type: "article",
    badge: "Recommended",
  },
  {
    id: "2",
    title: "Leadership in Tech Workshop",
    type: "event",
    badge: "Event",
  },
];

const dummyAchievements: AchievementData[] = [
  {
    id: "1",
    title: "JavaScript Mastery",
    date: "Earned April 1, 2025",
    color: "amber",
  },
  {
    id: "2",
    title: "90-Day Streak",
    date: "Earned March 15, 2025",
    color: "blue",
  },
];

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
  const [userName, setUserName] = useState<string>("Alex");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const localUser = localStorage.getItem("leap_user");
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser);
        if (parsed?.fullName) setUserName(parsed.fullName);
      } catch {
        // noop
      }
    }

    const fetchDashboardData = async () => {
      try {
        const data = await apiGet<{
          userName: string;
          activityData: ActivityDataPoint[];
          skillsData: SkillDataPoint[];
          overviewCards: OverviewCardData[];
          upcomingSessions: SessionData[];
          onlineResources: ResourceData[];
          achievements: AchievementData[];
        }>("/dashboard");

        setActivityData(data.activityData || []);
        setSkillsData(data.skillsData || []);
        setOverviewCards(data.overviewCards || []);
        setUpcomingSessions(data.upcomingSessions || []);
        setOnlineResources(data.onlineResources || []);
        setAchievements(data.achievements || []);
        setUserName(data.userName || "Alex");
        setLoading(false);
      } catch (err) {
        // Fallback to dummy data so feature UX remains available
        setActivityData(dummyActivityData);
        setSkillsData(dummySkillsData);
        setOverviewCards(dummyOverviewCards);
        setUpcomingSessions(dummyUpcomingSessions);
        setOnlineResources(dummyOnlineResources);
        setAchievements(dummyAchievements);
        setError("Backend unavailable. Showing demo dashboard data.");
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
