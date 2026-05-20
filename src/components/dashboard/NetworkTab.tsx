
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Linkedin, Twitter, Globe } from "lucide-react";

export const NetworkTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Network</CardTitle>
        <CardDescription>Connect with peers and professionals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Connected Platforms</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2">
              <Linkedin className="h-4 w-4 text-blue-600" />
              LinkedIn
            </Button>
            <Button variant="outline" className="gap-2">
              <Twitter className="h-4 w-4 text-blue-400" />
              Twitter
            </Button>
            <Button variant="outline" className="gap-2">
              <Globe className="h-4 w-4" />
              Connect More
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Recommended Connections</h3>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted"></div>
              <div>
                <p className="font-medium">Sarah Johnson</p>
                <p className="text-sm text-muted-foreground">Senior Developer at TechCorp</p>
              </div>
            </div>
            <Button size="sm" variant="outline">Connect</Button>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted"></div>
              <div>
                <p className="font-medium">Michael Chen</p>
                <p className="text-sm text-muted-foreground">Engineering Manager at StartupX</p>
              </div>
            </div>
            <Button size="sm" variant="outline">Connect</Button>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted"></div>
              <div>
                <p className="font-medium">Priya Patel</p>
                <p className="text-sm text-muted-foreground">Cloud Architect at CloudSys</p>
              </div>
            </div>
            <Button size="sm" variant="outline">Connect</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
