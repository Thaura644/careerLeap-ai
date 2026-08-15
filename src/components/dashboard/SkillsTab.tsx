import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface SkillsTabProps {
  skillsData: { name: string; value: number }[];
  loading?: boolean;
}

export const SkillsTab: React.FC<SkillsTabProps> = ({ skillsData, loading = false }) => {
  const focusAreas = (skillsData || []).filter((s) => s.name && s.name.trim());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Focus Areas</CardTitle>
          <CardDescription>Where your roadmap concentrates your effort</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-sm text-muted-foreground text-center">Loading…</div>
          ) : focusAreas.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Compass className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium mb-1">No focus areas yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Generate your roadmap and your focus areas will show up here.
              </p>
              <Link to="/onboarding">
                <Button variant="outline" size="sm">
                  Set up my profile
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {focusAreas.map((area) => (
                <span
                  key={area.name}
                  className="rounded-full bg-leap-purple/10 px-3 py-1.5 text-sm font-medium text-leap-purple"
                >
                  {area.name}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skill Development</CardTitle>
          <CardDescription>Honest status — assessments aren't built yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            We don't run skill assessments yet, so we won't show you invented scores. Each focus area
            below starts at 0% — you'll log real progress as you complete roadmap milestones.
          </p>
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
            ) : focusAreas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No focus areas to track yet — generate your roadmap first.
              </p>
            ) : (
              focusAreas.slice(0, 6).map((area) => (
                <div key={area.name} className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-sm">{area.name}</h3>
                    <p className="text-xs text-muted-foreground">Not assessed yet</p>
                  </div>
                  <div className="flex items-center">
                    <Progress value={area.value || 0} className="h-2 w-32" />
                    <span className="ml-2 text-sm font-medium">{area.value || 0}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
