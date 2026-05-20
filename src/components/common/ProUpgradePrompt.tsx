
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProUpgradePromptProps {
  title?: string;
  description?: string;
  className?: string;
  buttonText?: string;
}

export const ProUpgradePrompt: React.FC<ProUpgradePromptProps> = ({
  title = "Unlock Premium Resources",
  description = "Gain access to over 500+ exclusive courses, workshops, and guides curated for your industry and career goals.",
  className = "",
  buttonText = "Upgrade to Pro"
}) => {
  return (
    <div className={cn("bg-muted/30 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6", className)}>
      <div>
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
      <Link to="/upgrade">
        <Button className="bg-leap-purple hover:bg-opacity-90 whitespace-nowrap">
          {buttonText}
        </Button>
      </Link>
    </div>
  );
};
