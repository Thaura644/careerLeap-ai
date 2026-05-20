
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";

export const InsightsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Generated Career Insights</CardTitle>
        <CardDescription>Personalized recommendations based on your progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start p-4 bg-leap-purple/5 dark:bg-leap-purple/10 rounded-lg">
            <div className="bg-leap-purple/10 dark:bg-leap-purple/20 p-2 rounded-full text-leap-purple mr-3">
              <Lightbulb size={20} />
            </div>
            <div>
              <h3 className="font-medium mb-1">Focus on System Design</h3>
              <p className="text-sm text-muted-foreground">
                Based on your career goals and current skill set, focusing on system design will significantly increase your promotion chances within the next 6 months.
              </p>
            </div>
          </div>
          
          <div className="flex items-start p-4 bg-leap-teal/5 dark:bg-leap-teal/10 rounded-lg">
            <div className="bg-leap-teal/10 dark:bg-leap-teal/20 p-2 rounded-full text-leap-teal mr-3">
              <Lightbulb size={20} />
            </div>
            <div>
              <h3 className="font-medium mb-1">Consider Mentoring Junior Developers</h3>
              <p className="text-sm text-muted-foreground">
                Your technical skills are strong, but leadership experience would round out your profile. Consider volunteering to mentor junior team members.
              </p>
            </div>
          </div>

          <div className="flex items-start p-4 bg-amber-500/5 dark:bg-amber-500/10 rounded-lg">
            <div className="bg-amber-500/10 dark:bg-amber-500/20 p-2 rounded-full text-amber-500 mr-3">
              <Lightbulb size={20} />
            </div>
            <div>
              <h3 className="font-medium mb-1">Industry Trends Alert</h3>
              <p className="text-sm text-muted-foreground">
                Recent job postings in your area show increased demand for cloud infrastructure skills. Consider exploring AWS or Azure certifications.
              </p>
              <Badge variant="outline" className="mt-2">Trending Skill</Badge>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 border rounded-lg bg-muted/50">
          <h3 className="font-medium mb-2">Unlock Premium AI Insights</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Upgrade to Pro to receive in-depth analysis, interview preparation tips, and personalized learning recommendations.
          </p>
          <Button variant="default" size="sm" className="bg-leap-purple hover:bg-opacity-90">
            Upgrade Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
