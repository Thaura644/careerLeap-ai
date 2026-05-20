
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
    // This would be replaced with actual API calls in a real app
    const fetchDashboardData = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use dummy data for now
        setActivityData(dummyActivityData);
        setSkillsData(dummySkillsData);
        setOverviewCards(dummyOverviewCards);
        setUpcomingSessions(dummyUpcomingSessions);
        setOnlineResources(dummyOnlineResources);
        setAchievements(dummyAchievements);
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard data");
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
