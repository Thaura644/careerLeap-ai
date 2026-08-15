import React, { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { LearningTools } from "@/components/dashboard/LearningTools";
import { RoadmapTab } from "@/components/dashboard/RoadmapTab";
import { UpcomingSessions } from "@/components/dashboard/UpcomingSessions";
import { UpgradeToPro } from "@/components/dashboard/UpgradeToPro";
import { AIGoalsManager } from "@/components/ai/AIGoalsManager";
import { AIResourceRecommendations } from "@/components/ai/AIResourceRecommendations";
import { DashboardProvider } from "@/context/DashboardContext";

const Dashboard = () => {
  // Controlled refresh so the header's "Regenerate roadmap" action updates the
  // roadmap card in place without a full page reload.
  const [roadmapRefreshKey, setRoadmapRefreshKey] = useState(0);

  const handleRoadmapGenerated = () => {
    setRoadmapRefreshKey((k) => k + 1);
  };

  return (
    <DashboardProvider>
      <DashboardLayout>
        <div className="mx-auto max-w-6xl">
          <DashboardHeader onRoadmapGenerated={handleRoadmapGenerated} />
          <DashboardStats />
          <LearningTools />

          {/* Main content: the roadmap is the hero (it loads the saved version
              instantly — no regeneration on every visit) with recommendations
              below it. The right rail holds goals, events, and upgrade. */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <RoadmapTab refreshKey={roadmapRefreshKey} />
              </div>
              <AIResourceRecommendations />
            </div>

            <div className="space-y-8">
              <AIGoalsManager />
              <UpcomingSessions />
              <UpgradeToPro />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </DashboardProvider>
  );
};

export default Dashboard;
