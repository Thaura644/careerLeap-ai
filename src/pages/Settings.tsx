
import React from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  LogOut, 
  Loader2, 
  Upload, 
  Linkedin, 
  Twitter, 
  Github,
  Mail,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

const Settings = () => {
  const [isEmailUpdating, setIsEmailUpdating] = React.useState(false);
  const [passwordUpdated, setPasswordUpdated] = React.useState(false);

  const handleUpdateEmail = () => {
    setIsEmailUpdating(true);
    // Simulate API call
    setTimeout(() => {
      setIsEmailUpdating(false);
    }, 1500);
  };

  const handleUpdatePassword = () => {
    // Simulate API call
    setTimeout(() => {
      setPasswordUpdated(true);
      // Reset after 3 seconds
      setTimeout(() => setPasswordUpdated(false), 3000);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="mb-8">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Connections</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-lg">AL</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Change Photo
                      </Button>
                    </div>
                    <div className="flex-1 grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" defaultValue="Alex" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" defaultValue="Johnson" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="alex@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input id="title" defaultValue="Senior Developer" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company/Organization</Label>
                        <Input id="company" defaultValue="Tech Solutions Inc." />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio" 
                        rows={4}
                        defaultValue="Senior developer with 8+ years of experience in web and mobile application development. Passionate about system architecture and team leadership."
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select defaultValue="technology">
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" defaultValue="San Francisco, CA" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Personal Website (optional)</Label>
                      <Input id="website" placeholder="https://www.example.com" />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Career Goals</CardTitle>
                  <CardDescription>Update your career objectives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="targetRole">Target Role</Label>
                      <Input id="targetRole" defaultValue="Engineering Manager" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeline">Timeline for Next Career Move</Label>
                      <Select defaultValue="6-12">
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-6">0-6 months</SelectItem>
                          <SelectItem value="6-12">6-12 months</SelectItem>
                          <SelectItem value="1-2">1-2 years</SelectItem>
                          <SelectItem value="2+">2+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="goals">Long-term Career Goals</Label>
                      <Textarea 
                        id="goals" 
                        rows={3}
                        defaultValue="Become a CTO within the next 5-7 years, focusing on building innovative products and leading high-performing engineering teams."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control when and how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Roadmap Updates</p>
                          <p className="text-sm text-muted-foreground">Receive updates when your career roadmap changes</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Mentor Sessions</p>
                          <p className="text-sm text-muted-foreground">Notifications about upcoming mentor sessions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">AI Insights</p>
                          <p className="text-sm text-muted-foreground">Weekly AI-generated career insights</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Community Activity</p>
                          <p className="text-sm text-muted-foreground">Updates from discussions you're participating in</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Marketing & Promotions</p>
                          <p className="text-sm text-muted-foreground">Product updates and special offers</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">In-App Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Achievement Unlocked</p>
                          <p className="text-sm text-muted-foreground">Notifications when you earn new achievements</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Connection Requests</p>
                          <p className="text-sm text-muted-foreground">Notifications for new connection requests</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Resource Recommendations</p>
                          <p className="text-sm text-muted-foreground">Suggested learning resources based on your goals</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Notification Frequency</h3>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Email Digest Frequency</Label>
                      <Select defaultValue="weekly">
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="connections">
            <Card>
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>Manage your connected social accounts and platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#0077b5]/10 p-2 rounded-full">
                        <Linkedin className="h-6 w-6 text-[#0077b5]" />
                      </div>
                      <div>
                        <p className="font-medium">LinkedIn</p>
                        <p className="text-sm text-muted-foreground">Connect your professional profile</p>
                      </div>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#1DA1F2]/10 p-2 rounded-full">
                        <Twitter className="h-6 w-6 text-[#1DA1F2]" />
                      </div>
                      <div>
                        <p className="font-medium">Twitter</p>
                        <p className="text-sm text-muted-foreground">Connect for industry updates</p>
                      </div>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#333]/10 dark:bg-[#f6f8fa]/10 p-2 rounded-full">
                        <Github className="h-6 w-6 text-[#333] dark:text-[#f6f8fa]" />
                      </div>
                      <div>
                        <p className="font-medium">GitHub</p>
                        <p className="text-sm text-muted-foreground">Showcase your projects and contributions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800">
                        Connected
                      </Badge>
                      <Button variant="ghost" size="sm">Disconnect</Button>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">API Integrations</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your career development data with third-party services
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-dashed">
                      <CardContent className="pt-6 flex flex-col items-center justify-center h-40 text-center">
                        <p className="font-medium mb-2">Learning Platforms</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          Connect your courses from Udemy, Coursera, etc.
                        </p>
                        <Button variant="outline" size="sm">
                          Browse Integrations
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-dashed">
                      <CardContent className="pt-6 flex flex-col items-center justify-center h-40 text-center">
                        <p className="font-medium mb-2">Project Management</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          Connect to GitHub, JIRA, or Trello boards
                        </p>
                        <Button variant="outline" size="sm">
                          Browse Integrations
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>Manage your password and security settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Email Address</h3>
                      
                      <div className="flex items-end gap-4">
                        <div className="space-y-2 flex-1">
                          <Label htmlFor="currentEmail">Current Email</Label>
                          <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted/50">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            alex@example.com
                            <Badge className="ml-2 bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800">
                              Verified
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-end gap-4">
                        <div className="space-y-2 flex-1">
                          <Label htmlFor="newEmail">New Email</Label>
                          <Input id="newEmail" type="email" placeholder="Enter new email address" />
                        </div>
                        <Button onClick={handleUpdateEmail} disabled={isEmailUpdating}>
                          {isEmailUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Email"
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Password</h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input id="currentPassword" type="password" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input id="newPassword" type="password" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input id="confirmPassword" type="password" />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          {passwordUpdated && (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span className="text-sm">Password updated successfully</span>
                            </div>
                          )}
                        </div>
                        <Button onClick={handleUpdatePassword}>Update Password</Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Enable 2FA</p>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Session Management</h3>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          You're currently logged in on these devices
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-md">
                            <div>
                              <p className="font-medium">MacBook Pro (Current)</p>
                              <p className="text-xs text-muted-foreground">
                                San Francisco, CA · Last active: Just now
                              </p>
                            </div>
                            <Badge>Current</Badge>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border rounded-md">
                            <div>
                              <p className="font-medium">iPhone 13</p>
                              <p className="text-xs text-muted-foreground">
                                San Francisco, CA · Last active: 2 hours ago
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Log Out
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="flex items-center gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                        <LogOut className="h-4 w-4" />
                        Log Out of All Devices
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Control your data and privacy preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Profile Visibility</p>
                        <p className="text-sm text-muted-foreground">
                          Control who can see your profile and activities
                        </p>
                      </div>
                      <Select defaultValue="connections">
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="connections">Connections</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Data Processing</p>
                        <p className="text-sm text-muted-foreground">
                          Allow us to process your data for personalized suggestions
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Data Analytics</p>
                        <p className="text-sm text-muted-foreground">
                          Allow anonymous usage data collection to improve our services
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 border rounded-md bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800 dark:text-yellow-500">Data Export & Deletion</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                          You can request a copy of your data or delete your account at any time. 
                          Account deletion will permanently remove all your data from our systems.
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <Button variant="outline" size="sm">
                            Export Data
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button>Save Privacy Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
