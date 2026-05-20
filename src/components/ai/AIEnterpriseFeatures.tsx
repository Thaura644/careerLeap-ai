
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Database, LineChart } from "lucide-react";
import { Link } from "react-router-dom";

export const AIEnterpriseFeatures: React.FC = () => {
  return (
    <Card className="border-2 border-amber-500/30">
      <CardHeader className="pb-3 bg-amber-500/5">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              Enterprise AI Solutions
              <Badge className="bg-amber-500 text-white">ENTERPRISE</Badge>
            </CardTitle>
            <CardDescription>Organizational-level AI insights and workforce analytics</CardDescription>
          </div>
          <Link to="/contact">
            <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-500/10">
              <Building className="mr-2 h-4 w-4" />
              Contact Sales
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <Users className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="font-semibold">Team Skills Analysis</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Comprehensive skills mapping across your entire organization
            </p>
          </div>
          
          <div className="border rounded-lg p-4">
            <Database className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="font-semibold">Custom AI Integration</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Connect with your existing HR systems and talent databases
            </p>
          </div>
          
          <div className="border rounded-lg p-4">
            <LineChart className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="font-semibold">Workforce Analytics</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Advanced reporting on career progression and skills development
            </p>
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <Link to="/upgrade">
            <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-500/10">
              Learn More About Enterprise
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
