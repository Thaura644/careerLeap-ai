import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ResourcesProvider, useResources } from "@/context/ResourcesContext";
import { ResourceSearch } from "@/components/resources/ResourceSearch";
import { ResourceTabs } from "@/components/resources/ResourceTabs";
import { ResourcesSection } from "@/components/resources/ResourcesSection";
import { EventsSection } from "@/components/resources/EventsSection";
import { ResourceEnginePanel } from "@/components/resources/ResourceEnginePanel";
import { CreatorStudio } from "@/components/resources/CreatorStudio";
import { TopicCatalogSection } from "@/components/resources/TopicCatalogSection";
import { ProUpgradePrompt } from "@/components/common/ProUpgradePrompt";
import { apiGet } from "@/lib/api";

/** The engine and creator sections sit above the tabs; this inner component
 *  reads the context so the page stays wrapped in a single provider. */
const EngineAndCreatorSections: React.FC = () => {
  const { openResources, creatorResources, loading } = useResources();
  return (
    <>
      <ResourceEnginePanel />
      <CreatorStudio />
      {!loading && openResources.length > 0 && (
        <ResourcesSection
          title="Open-source picks"
          description="Real learning materials the resource engine cataloged from the open web — every link opens somewhere."
          resources={openResources}
        />
      )}
      {!loading && creatorResources.length > 0 && (
        <ResourcesSection
          title="From creators"
          description="Guides, courses, and workshops published by Pro members."
          resources={creatorResources}
        />
      )}
    </>
  );
};

const Resources = () => {
  const [query, setQuery] = useState("");
  const [preferredFormats, setPreferredFormats] = useState<string[]>([]);

  // The user's saved learning formats (from onboarding) drive the "My formats"
  // filter, so preferences are backed by an actual feature, not a label.
  useEffect(() => {
    apiGet<{ user?: { learningFormats?: string | null } }>("/auth/me")
      .then(({ user }) => {
        const formats = user?.learningFormats
          ?.split(",")
          .map((f) => f.trim())
          .filter(Boolean);
        setPreferredFormats(formats && formats.length ? formats : []);
      })
      .catch(() => setPreferredFormats([]));
  }, []);

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

          <TopicCatalogSection />
          <EngineAndCreatorSections />
          <ResourceSearch value={query} onChange={setQuery} />
          <ResourceTabs query={query} preferredFormats={preferredFormats} />
          <EventsSection />
          <ProUpgradePrompt />
        </div>
      </DashboardLayout>
    </ResourcesProvider>
  );
};

export default Resources;
