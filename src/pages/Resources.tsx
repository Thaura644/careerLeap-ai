import React, { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ResourcesProvider } from "@/context/ResourcesContext";
import { ResourceSearch } from "@/components/resources/ResourceSearch";
import { ResourceTabs } from "@/components/resources/ResourceTabs";
import { EventsSection } from "@/components/resources/EventsSection";
import { ProUpgradePrompt } from "@/components/common/ProUpgradePrompt";

const Resources = () => {
  const [query, setQuery] = useState("");

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

          <ResourceSearch value={query} onChange={setQuery} />
          <ResourceTabs query={query} />
          <EventsSection />
          <ProUpgradePrompt />
        </div>
      </DashboardLayout>
    </ResourcesProvider>
  );
};

export default Resources;
