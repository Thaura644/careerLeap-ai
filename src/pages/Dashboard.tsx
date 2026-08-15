import React, { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { SidebarContent } from "@/components/dashboard/SidebarContent";
import { DashboardProvider } from "@/context/DashboardContext";
import { AIGoalsManager } from "@/components/ai/AIGoalsManager";
import { AIResourceRecommendations } from "@/components/ai/AIResourceRecommendations";

const Dashboard = () => {
  // Controlled tab so the header's "Regenerate roadmap" action can land the
  // user on the roadmap tab with a freshly generated roadmap.
  const [activeTab, setActiveTab] = useState("roadmap");
  const [roadmapRefreshKey, setRoadmapRefreshKey] = useState(0);

  const handleRoadmapGenerated = () => {
    setRoadmapRefreshKey((k) => k + 1);
    setActiveTab("roadmap");
  };

  return (
    <DashboardProvider>
      <DashboardLayout>
        <div className="mx-auto max-w-6xl">
          <DashboardHeader onRoadmapGenerated={handleRoadmapGenerated} />
          <OverviewCards />

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2">
                <ActivityChart />
                <div className="mb-8">
                  <AIResourceRecommendations />
                </div>
                <DashboardTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  roadmapRefreshKey={roadmapRefreshKey}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                <AIGoalsManager />
                <SidebarContent />
              </div>
            </div>
          </div>
      </DashboardLayout>
    </DashboardProvider>
  );
};

export default Dashboard;
