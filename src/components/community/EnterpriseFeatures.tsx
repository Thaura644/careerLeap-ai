
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Shield, Handshake } from "lucide-react";
import { Link } from "react-router-dom";

export const EnterpriseFeatures: React.FC = () => {
  return (
    <Card className="border-2 border-amber-500/30">
      <CardHeader className="pb-3 bg-amber-500/5">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              Enterprise Network
              <Badge className="bg-amber-500 text-white">ENTERPRISE</Badge>
            </CardTitle>
            <CardDescription>Company-specific networking and resources</CardDescription>
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
            <Building className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="font-semibold">Private Company Network</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Secure, invitation-only network for your organization
            </p>
          </div>
          
          <div className="border rounded-lg p-4">
            <Shield className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="font-semibold">Enhanced Security & Compliance</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Enterprise-grade security with audit trails and compliance features
            </p>
          </div>
          
          <div className="border rounded-lg p-4">
            <Handshake className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="font-semibold">Strategic Partnership</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Custom integrations and dedicated account management
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
