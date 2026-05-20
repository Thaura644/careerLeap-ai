
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  MessageSquare, 
  Users, 
  Bookmark, 
  Calendar, 
  Crown,
  Filter
} from "lucide-react";
import { CommunityProFeatures } from "@/components/community/CommunityProFeatures";

const Community = () => {
  const [tab, setTab] = useState("discussions");
  
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Community</h1>
            <p className="text-muted-foreground">Connect with peers and professionals</p>
          </div>
          <div className="flex gap-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search discussions..."
                className="w-full sm:w-[300px] pl-8"
              />
            </div>
            <Button variant="default">
              <MessageSquare className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </div>
        </div>

        <Tabs defaultValue={tab} onValueChange={setTab} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <TabsContent value="discussions" className="space-y-4">
            {/* Public Discussions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Popular Discussions</CardTitle>
                <CardDescription>Join the conversation with your peers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Discussion 1 */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Jane Doe</span>
                          <span className="text-xs text-muted-foreground">2 days ago</span>
                        </div>
                        <h3 className="font-semibold mt-1">How to approach system design interviews?</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          I have an upcoming system design interview at a big tech company. Any advice on how to prepare and what resources to use?
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">System Design</Badge>
                  </div>
                  <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" /> 24 replies
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> 42 participants
                    </span>
                  </div>
                </div>

                {/* Discussion 2 */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>MJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Mike Johnson</span>
                          <span className="text-xs text-muted-foreground">5 hours ago</span>
                        </div>
                        <h3 className="font-semibold mt-1">Career switch to Product Management</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          After 5 years as a developer, I'm considering a switch to product management. Has anyone made this transition? What skills should I focus on?
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">Career Change</Badge>
                  </div>
                  <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" /> 18 replies
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> 23 participants
                    </span>
                  </div>
                </div>

                {/* Discussion 3 */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>SP</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Sara Peterson</span>
                          <span className="text-xs text-muted-foreground">Yesterday</span>
                        </div>
                        <h3 className="font-semibold mt-1">Remote work productivity tips?</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          I've been working remote for the past 6 months and struggling with productivity. Would love to hear what works for others!
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">Remote Work</Badge>
                  </div>
                  <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" /> 32 replies
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> 28 participants
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Pro Features Locked Section */}
            <CommunityProFeatures />
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Community Groups</CardTitle>
                <CardDescription>Find groups related to your interests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Free Groups */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold">Early Career Professionals</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    For professionals in the first 5 years of their career journey
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline">1,245 members</Badge>
                    <Badge variant="outline">Public</Badge>
                  </div>
                  <Button size="sm" className="mt-3">Join Group</Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold">Interview Preparation</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Practice interviews and share tips for landing your dream job
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline">982 members</Badge>
                    <Badge variant="outline">Public</Badge>
                  </div>
                  <Button size="sm" className="mt-3">Join Group</Button>
                </div>
                
                {/* Pro Groups - Locked */}
                <div className="border border-dashed rounded-lg p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Crown className="h-8 w-8 text-leap-purple mb-2" />
                    <h3 className="font-semibold text-center">Pro Groups</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-xs mt-1">
                      Upgrade to Pro to access industry-specific groups with verified professionals
                    </p>
                    <Button className="mt-3 bg-leap-purple hover:bg-opacity-90">Upgrade to Pro</Button>
                  </div>
                  
                  <h3 className="font-semibold">Tech Leaders Network</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    For CTOs, VP Engineering, and other technical leadership roles
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline">465 members</Badge>
                    <Badge variant="outline">Pro</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Webinars, workshops and networking opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Public Event */}
                <div className="border rounded-lg p-4">
                  <div className="flex gap-4">
                    <div className="min-w-16 h-16 bg-muted rounded-md flex flex-col items-center justify-center text-center">
                      <span className="text-sm font-medium">APR</span>
                      <span className="text-lg font-bold">15</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Intro to Technical Interviews</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Learn the basics of technical interviews and how to prepare
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          3:00 PM EST
                        </Badge>
                        <Badge variant="outline">Free</Badge>
                      </div>
                      <Button size="sm" className="mt-3">Register</Button>
                    </div>
                  </div>
                </div>
                
                {/* Pro Event - Locked */}
                <div className="border border-dashed rounded-lg p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Crown className="h-8 w-8 text-leap-purple mb-2" />
                    <h3 className="font-semibold text-center">Pro Events</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-xs mt-1">
                      Upgrade to Pro to access exclusive workshops and networking events
                    </p>
                    <Button className="mt-3 bg-leap-purple hover:bg-opacity-90">Upgrade to Pro</Button>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="min-w-16 h-16 bg-muted rounded-md flex flex-col items-center justify-center text-center">
                      <span className="text-sm font-medium">APR</span>
                      <span className="text-lg font-bold">22</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">1:1 Mock Interviews with FAANG Engineers</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Practice with current and former engineers from top tech companies
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Various times
                        </Badge>
                        <Badge variant="outline">Pro</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Saved Content</CardTitle>
                <CardDescription>Discussions and resources you've bookmarked</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 text-center">
                  <Bookmark className="h-8 w-8 mx-auto text-muted-foreground" />
                  <h3 className="font-semibold mt-2">No saved content yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Bookmark discussions and resources to access them quickly later
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Community;
