import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { 
  Search, 
  MessageSquare, 
  Users, 
  Bookmark, 
  Calendar, 
  Crown,
  Filter,
  Loader2
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { ResourcesProvider, useResources, EventType } from "@/context/ResourcesContext";

interface CommunityGroup {
  id: number;
  topic: string;
  members: number;
  lastActive: string;
}

const CommunityContent = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "events" ? "events" : "discussions";
  const [tab, setTab] = useState(initialTab);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const { upcomingEvents, loading: eventsLoading } = useResources();

  useEffect(() => {
    apiGet<CommunityGroup[]>("/community")
      .then((data) => setGroups(data || []))
      .catch(() => {
        setGroups([]);
        setGroupsError("Could not load community groups.");
      })
      .finally(() => setGroupsLoading(false));
  }, []);

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
            <Button variant="default" disabled title="Discussions open soon">
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
            <Button variant="outline" size="sm" className="hidden sm:flex" disabled>
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <TabsContent value="discussions" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Discussions</CardTitle>
                <CardDescription>Join the conversation with your peers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-10 text-center">
                  <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground" />
                  <h3 className="font-semibold mt-3">Discussions are opening soon</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                    There are no discussions yet. When posting opens, this is where the community
                    shares questions, wins, and advice.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Community Groups</CardTitle>
                <CardDescription>Find groups related to your interests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {groupsLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading groups…
                  </div>
                ) : groupsError ? (
                  <div className="border rounded-lg p-6 text-center text-muted-foreground">
                    {groupsError}
                  </div>
                ) : groups.length === 0 ? (
                  <div className="border rounded-lg p-6 text-center text-muted-foreground">
                    No groups yet — check back soon.
                  </div>
                ) : (
                  groups.map((g) => (
                    <div key={g.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{g.topic}</h3>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="outline">{g.members.toLocaleString()} members</Badge>
                        <Badge variant="outline">Active {g.lastActive}</Badge>
                      </div>
                      <Button size="sm" className="mt-3" disabled title="Joining opens with discussions">
                        Join Group
                      </Button>
                    </div>
                  ))
                )}

                <div className="border border-dashed rounded-lg p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Crown className="h-8 w-8 text-leap-purple mb-2" />
                    <h3 className="font-semibold text-center">Pro Groups</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-xs mt-1">
                      Upgrade to Pro to access industry-specific groups with verified professionals
                    </p>
                    <Button className="mt-3 bg-leap-purple hover:bg-opacity-90">Upgrade to Pro</Button>
                  </div>
                  <h3 className="font-semibold">Coming soon</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Industry-specific groups for verified professionals
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Webinars and workshops on the calendar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {eventsLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading events…
                  </div>
                ) : upcomingEvents.length === 0 ? (
                  <div className="border rounded-lg p-6 text-center text-muted-foreground">
                    No events scheduled yet — check back soon.
                  </div>
                ) : (
                  upcomingEvents.map((event: EventType) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex gap-4">
                        <div className="min-w-16 h-16 bg-muted rounded-md flex flex-col items-center justify-center text-center">
                          <span className="text-sm font-medium">{event.date.split(" ")[0]?.toUpperCase()}</span>
                          <span className="text-lg font-bold">{event.date.split(" ")[1]}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {event.date}, {event.time}
                            </Badge>
                            <Badge variant={event.isPro ? "default" : "outline"}>
                              {event.isPro ? "Pro" : "Free"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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

// The provider must wrap the component that consumes the context (matching the
// Resources page pattern) — calling useResources() in the same component that
// renders the provider crashes, because the hook runs before the provider mounts.
const Community = () => (
  <ResourcesProvider>
    <CommunityContent />
  </ResourcesProvider>
);

export default Community;
