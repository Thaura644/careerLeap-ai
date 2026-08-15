import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoadmapTab } from "./RoadmapTab";
import { InsightsTab } from "./InsightsTab";
import { SkillsTab } from "./SkillsTab";
import { NetworkTab } from "./NetworkTab";
import { useDashboard } from "@/context/DashboardContext";

interface DashboardTabsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  roadmapRefreshKey?: number;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  activeTab,
  onTabChange,
  roadmapRefreshKey = 0,
}) => {
  const { skillsData, loading } = useDashboard();

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mb-8">
      <TabsList className="mb-4">
        <TabsTrigger value="roadmap">My Roadmap</TabsTrigger>
        <TabsTrigger value="insights">AI Insights</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="network">Network</TabsTrigger>
      </TabsList>

      <TabsContent value="roadmap" className="space-y-4">
        <RoadmapTab refreshKey={roadmapRefreshKey} />
      </TabsContent>

      <TabsContent value="insights">
        <InsightsTab />
      </TabsContent>

      <TabsContent value="skills">
        <SkillsTab skillsData={skillsData} loading={loading} />
      </TabsContent>

      <TabsContent value="network">
        <NetworkTab />
      </TabsContent>
    </Tabs>
  );
};
