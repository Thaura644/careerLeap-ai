
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";
import { PieChart } from "@/components/ui/pie-chart";

interface SkillsTabProps {
  skillsData: { name: string; value: number }[];
  loading?: boolean; // Make loading optional
}

export const SkillsTab: React.FC<SkillsTabProps> = ({ skillsData, loading = false }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Skills Distribution</CardTitle>
          <CardDescription>Your skills across different categories</CardDescription>
        </CardHeader>
        <CardContent className="h-[240px]">
          <PieChart data={skillsData} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>My Skills Development</CardTitle>
          <CardDescription>Track and improve your competencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">JavaScript</h3>
                <p className="text-sm text-muted-foreground">Advanced level</p>
              </div>
              <div className="flex items-center">
                <Progress value={90} className="h-2 w-32" />
                <span className="ml-2 text-sm font-medium">90%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">React</h3>
                <p className="text-sm text-muted-foreground">Intermediate level</p>
              </div>
              <div className="flex items-center">
                <Progress value={75} className="h-2 w-32" />
                <span className="ml-2 text-sm font-medium">75%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">System Design</h3>
                <p className="text-sm text-muted-foreground">Intermediate level</p>
              </div>
              <div className="flex items-center">
                <Progress value={68} className="h-2 w-32" />
                <span className="ml-2 text-sm font-medium">68%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Team Leadership</h3>
                <p className="text-sm text-muted-foreground">Beginner level</p>
              </div>
              <div className="flex items-center">
                <Progress value={30} className="h-2 w-32" />
                <span className="ml-2 text-sm font-medium">30%</span>
              </div>
            </div>
            
            <Button variant="link" className="mt-2 px-0 text-leap-purple flex items-center">
              View skill assessment <ChevronRight size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
