
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ChevronRight } from "lucide-react";

export const RoadmapTab: React.FC = () => {
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
