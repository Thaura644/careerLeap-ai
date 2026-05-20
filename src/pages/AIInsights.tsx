
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpRight, 
  Lightbulb, 
  Crown, 
  Brain, 
  FileText, 
  BarChart, 
  Building,
  Users,
  MessageSquare,
  RefreshCw
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { AIProFeatures } from "@/components/ai/AIProFeatures";
import { AIEnterpriseFeatures } from "@/components/ai/AIEnterpriseFeatures";

const AIInsights = () => {
  const [prompt, setPrompt] = useState("");
  
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">AI Insights</h1>
            <p className="text-muted-foreground">Get personalized career guidance and insights</p>
          </div>
          <Button className="bg-leap-purple hover:bg-opacity-90">
            Generate Full Report <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Quick Career Question</CardTitle>
            <CardDescription>Ask the AI about your career journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea 
                placeholder="Ask a question about your career path, skills, or industry trends..."
                className="min-h-24"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="flex flex-col xs:flex-row gap-3 justify-between">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">3</span> free questions remaining today
                </div>
                <Button disabled={!prompt.trim()}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Ask AI
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="insights" className="space-y-4">
          <TabsList>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="career">Career Analysis</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Personalized Insights</CardTitle>
                <CardDescription>AI-generated observations based on your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <h3 className="font-medium mb-1">Industry Trend Alert</h3>
                    <p className="text-sm text-muted-foreground">
                      Your skills align with emerging opportunities in AI integration roles. Consider exploring specialized courses in machine learning operations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Pro Features - Locked */}
            <AIProFeatures />
          </TabsContent>
          
          <TabsContent value="career" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Career Skills Analysis</CardTitle>
                <CardDescription>AI assessment of your skill development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Technical Skills</span>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Strong foundation, consider advanced cloud architecture knowledge</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Leadership</span>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Development area, focus on team management experience</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Communication</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Improving, practice technical presentations</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex flex-col items-start">
                <p className="text-sm text-muted-foreground mb-3">
                  This is a basic skills analysis. Upgrade to Pro for detailed insights and personalized improvement plans.
                </p>
                <Button className="bg-leap-purple hover:bg-opacity-90">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade for Full Analysis
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>AI Reports</CardTitle>
                <CardDescription>In-depth analysis of your career progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
                  <h3 className="font-medium mt-2">No reports generated yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Generate comprehensive reports about your skills, career path, and future opportunities.
                  </p>
                  <Button>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate First Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Enterprise Features Showcase */}
        <AIEnterpriseFeatures />
      </div>
    </DashboardLayout>
  );
};

export default AIInsights;
