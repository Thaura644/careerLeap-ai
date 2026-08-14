import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { apiPost } from "@/lib/api";

interface RoadmapPhase {
  title: string;
  duration?: string;
  focus?: string;
  skills?: string[];
  milestones?: string[];
  resources?: { title: string; type?: string }[];
}

interface RoadmapResponse {
  source?: string;
  roadmap?: {
    summary?: string;
    phases?: RoadmapPhase[];
  };
}

// Default profile until the onboarding questionnaire is wired in.
const DEFAULT_PROFILE = {
  currentRole: "Mid-level software engineer",
  targetRole: "Senior / Staff engineer",
  timeframeMonths: 12,
  focusAreas: ["System design", "Technical leadership"],
};

export const RoadmapTab: React.FC = () => {
  const [roadmap, setRoadmap] = useState<RoadmapResponse["roadmap"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiPost<RoadmapResponse>("/insights/roadmap", DEFAULT_PROFILE)
      .then((res) => {
        if (!cancelled && res.roadmap?.phases?.length) setRoadmap(res.roadmap);
      })
      .catch(() => {
        // Keep the static fallback — never leave the tab broken.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating your personalized roadmap…
        </CardContent>
      </Card>
    );
  }

  if (roadmap?.phases?.length) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{roadmap.summary ? "Your Personalized Roadmap" : "Career Roadmap"}</CardTitle>
              {roadmap.summary && (
                <CardDescription>{roadmap.summary}</CardDescription>
              )}
            </div>
            <Button variant="outline" size="sm">Change Industry</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roadmap.phases.map((phase, i) => (
              <div key={phase.title + i} className="p-4 border rounded-lg">
                <div className="flex items-start">
                  <div className="bg-leap-purple/10 p-2 rounded-full text-leap-purple mr-3">
                    <BookOpen size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="font-medium">{phase.title}</h3>
                      {phase.duration && (
                        <span className="text-xs font-medium text-muted-foreground">{phase.duration}</span>
                      )}
                    </div>
                    {phase.focus && (
                      <p className="text-sm text-muted-foreground mb-2">{phase.focus}</p>
                    )}
                    {phase.skills?.length ? (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {phase.skills.map((skill) => (
                          <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-muted">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {phase.milestones?.length ? (
                      <ul className="text-sm space-y-1 mb-2">
                        {phase.milestones.map((milestone) => (
                          <li key={milestone} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-leap-purple shrink-0" />
                            {milestone}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {phase.resources?.length ? (
                      <p className="text-xs text-muted-foreground">
                        Resources: {phase.resources.map((r) => r.title).join(" · ")}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="link" className="mt-4 px-0 text-leap-purple flex items-center">
            View full roadmap <ChevronRight size={16} />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Static fallback (shown if the API is unreachable).
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Senior Developer Roadmap</CardTitle>
            <CardDescription>Your personalized career path</CardDescription>
          </div>
          <Button variant="outline" size="sm">Change Industry</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-950/50 border border-green-100 dark:border-green-900 rounded-lg">
            <div className="flex items-start">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full text-green-600 dark:text-green-400 mr-3">
                <BookOpen size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Advanced JavaScript Concepts</h3>
                <p className="text-sm text-muted-foreground mb-2">Completed on April 2, 2025</p>
                <div className="flex items-center">
                  <Progress value={100} className="h-1 flex-1 mr-2" />
                  <span className="text-xs font-medium">100%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-lg">
            <div className="flex items-start">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full text-blue-600 dark:text-blue-400 mr-3">
                <BookOpen size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">System Design Fundamentals</h3>
                <p className="text-sm text-muted-foreground mb-2">In progress - Due April 18</p>
                <div className="flex items-center">
                  <Progress value={68} className="h-1 flex-1 mr-2" />
                  <span className="text-xs font-medium">68%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-background border rounded-lg">
            <div className="flex items-start">
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-600 dark:text-gray-400 mr-3">
                <BookOpen size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Team Leadership Skills</h3>
                <p className="text-sm text-muted-foreground mb-2">Starts April 20</p>
                <div className="flex items-center">
                  <Progress value={0} className="h-1 flex-1 mr-2" />
                  <span className="text-xs font-medium">0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button variant="link" className="mt-4 px-0 text-leap-purple flex items-center">
          View full roadmap <ChevronRight size={16} />
        </Button>
      </CardContent>
    </Card>
  );
};
