
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Briefcase, Users, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export const CommunityProFeatures: React.FC = () => {
  return (
    <Card className="border border-dashed">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              Pro Communities
              <Badge className="bg-leap-purple text-white">PRO</Badge>
            </CardTitle>
            <CardDescription>Premium discussions with industry professionals</CardDescription>
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
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex items-center justify-center">
          <div className="text-center p-6 max-w-md">
            <Crown className="h-12 w-12 text-leap-purple mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">Unlock Pro Communities</h3>
            <p className="text-muted-foreground mb-4">
              Connect with verified professionals in your industry, join exclusive discussions, and access premium networking events.
            </p>
            <Link to="/upgrade">
              <Button className="bg-leap-purple hover:bg-opacity-90 px-6">
                See Pro Benefits
              </Button>
            </Link>
          </div>
        </div>

        {/* Pro Features (blurred) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <Briefcase className="h-8 w-8 text-leap-purple mb-2" />
            <h3 className="font-semibold">Industry-Specific Networks</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Connect with professionals in your specific industry vertical
            </p>
          </div>
          
          <div className="border rounded-lg p-4">
            <Users className="h-8 w-8 text-leap-purple mb-2" />
            <h3 className="font-semibold">Verified Professional Network</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Engage with verified professionals with proven expertise
            </p>
          </div>
          
          <div className="border rounded-lg p-4">
            <Globe className="h-8 w-8 text-leap-purple mb-2" />
            <h3 className="font-semibold">Global Networking Events</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Exclusive online and offline networking opportunities
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
