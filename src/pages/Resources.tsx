
import React from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ResourcesProvider } from "@/context/ResourcesContext";
import { ResourceSearch } from "@/components/resources/ResourceSearch";
import { ResourceTabs } from "@/components/resources/ResourceTabs";
import { EventsSection } from "@/components/resources/EventsSection";
import { ProUpgradePrompt } from "@/components/common/ProUpgradePrompt";
import { useToast } from "@/hooks/use-toast";

const Resources = () => {
  const { toast } = useToast();

  const handleSearch = (query: string) => {
    // This would be implemented with real search in a production app
    toast({
      title: "Search initiated",
      description: `Searching for: ${query}`,
    });
  };

  const handleFilter = () => {
    // This would open a filter modal in a production app
    toast({
      title: "Filters",
      description: "Filter functionality would be implemented here",
    });
  };

  return (
    <ResourcesProvider>
      <DashboardLayout>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Resources</h1>
            <p className="text-muted-foreground">
              Curated learning materials to advance your career across various disciplines and industries
            </p>
          </div>

          <ResourceSearch onSearch={handleSearch} onFilter={handleFilter} />
          <ResourceTabs />
          <EventsSection />
          <ProUpgradePrompt />
        </div>
      </DashboardLayout>
    </ResourcesProvider>
  );
};

export default Resources;
