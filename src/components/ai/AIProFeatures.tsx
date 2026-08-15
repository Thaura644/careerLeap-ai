
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Brain, BarChart, FileText, Check } from "lucide-react";
import { Link } from "react-router-dom";

interface AIProFeaturesProps {
  isPro?: boolean;
}

export const AIProFeatures: React.FC<AIProFeaturesProps> = ({ isPro = false }) => {
  return (
    <Card className="border border-dashed">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              Advanced AI Insights
              <Badge className="bg-leap-purple text-white">PRO</Badge>
            </CardTitle>
            <CardDescription>Unlock powerful career analysis and guidance</CardDescription>
          </div>
          <Link to="/upgrade">
            <Button className="bg-leap-purple hover:bg-opacity-90">
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        {!isPro && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="text-center p-6 max-w-md">
              <Crown className="h-12 w-12 text-leap-purple mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Unlock Advanced AI Features</h3>
              <p className="text-muted-foreground mb-4">
                Unlimited AI conversations, advanced insights, and Pro-gated resources.
              </p>
              <Link to="/upgrade">
                <Button className="bg-leap-purple hover:bg-opacity-90 px-6">
                  See Pro Benefits
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Pro Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isPro && (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 col-span-full">
              <Check className="h-4 w-4" /> Pro is active on your account — these are included.
            </div>
          )}
          <div className="border rounded-lg p-4">
            <Brain className="h-8 w-8 text-leap-purple mb-2" />
            <h3 className="font-semibold">Advanced Career Insights</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Personalized recommendations based on your career trajectory
            </p>
          </div>
          
          <div className="border rounded-lg p-4">
            <BarChart className="h-8 w-8 text-leap-purple mb-2" />
            <h3 className="font-semibold">Skills Gap Analysis</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Analysis of your skills against the roadmap focus areas
            </p>
          </div>
          
          <div className="border rounded-lg p-4">
            <FileText className="h-8 w-8 text-leap-purple mb-2" />
            <h3 className="font-semibold">Interview Preparation</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Preparation guidance for your target roles
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
