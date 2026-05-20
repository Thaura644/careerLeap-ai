
import React from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { SidebarContent } from "@/components/dashboard/SidebarContent";
import { DashboardProvider } from "@/context/DashboardContext";
import { AIProvider } from "@/context/AIContext";
import { AIAgentChat } from "@/components/ai/AIAgentChat";
import { AIGoalsManager } from "@/components/ai/AIGoalsManager";
import { AIResourceRecommendations } from "@/components/ai/AIResourceRecommendations";

const Dashboard = () => {
  return (
    <AIProvider>
      <DashboardProvider>
        <DashboardLayout>
          <DashboardHeader />
          <OverviewCards />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2">
              <ActivityChart />
              <div className="mb-8">
                <AIAgentChat className="mb-6" />
                <AIResourceRecommendations />
              </div>
              <DashboardTabs />
            </div>
            
            {/* Right Column */}
            <div className="space-y-8">
              <AIGoalsManager />
              <SidebarContent />
            </div>
          </div>
        </DashboardLayout>
      </DashboardProvider>
    </AIProvider>
  );
};

export default Dashboard;
