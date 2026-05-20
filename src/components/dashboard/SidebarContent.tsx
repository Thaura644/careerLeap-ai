
import React from "react";
import { UpcomingSessions } from "./UpcomingSessions";
import { OnlineResources } from "./OnlineResources";
import { Achievements } from "./Achievements";
import { UpgradeToPro } from "./UpgradeToPro";

export const SidebarContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <UpcomingSessions />
      <OnlineResources />
      <Achievements />
      <UpgradeToPro />
    </div>
  );
};
