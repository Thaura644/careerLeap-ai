
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoadmapTab } from "./RoadmapTab";
import { InsightsTab } from "./InsightsTab";
import { SkillsTab } from "./SkillsTab";
import { NetworkTab } from "./NetworkTab";
import { useDashboard } from "@/context/DashboardContext";

export const DashboardTabs: React.FC = () => {
  const { skillsData, loading } = useDashboard();

  return (
    <Tabs defaultValue="roadmap" className="mb-8">
      <TabsList className="mb-4">
        <TabsTrigger value="roadmap">My Roadmap</TabsTrigger>
        <TabsTrigger value="insights">AI Insights</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="network">Network</TabsTrigger>
      </TabsList>
      
      <TabsContent value="roadmap" className="space-y-4">
        <RoadmapTab />
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
