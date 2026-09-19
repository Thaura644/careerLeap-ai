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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MessageSquare,
  Bookmark,
  Calendar,
  Crown,
  Filter,
  Loader2,
  Check,
  Plus,
} from "lucide-react";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { ResourcesProvider, useResources, EventType } from "@/context/ResourcesContext";

interface CommunityGroup {
  id: number;
  topic: string;
  description: string | null;
  userCreated: boolean;
  members: number;
  lastActive: string;
  joined: boolean;
}

interface CommunityPost {
  id: number;
  groupId: number;
  groupTopic: string;
  authorName: string;
  body: string;
  createdAt: string;
}

const CommunityContent = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "events" ? "events" : "discussions";
  const [tab, setTab] = useState(initialTab);
  const { toast } = useToast();

  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  const [postOpen, setPostOpen] = useState(false);
  const [postGroupId, setPostGroupId] = useState<string>("");
  const [postBody, setPostBody] = useState("");
  const [posting, setPosting] = useState(false);

  const { upcomingEvents, loading: eventsLoading } = useResources();

  const loadGroups = () => {
    apiGet<CommunityGroup[]>("/community")
      .then((data) => setGroups(data || []))
      .catch(() => {
        setGroups([]);
        setGroupsError("Could not load community groups.");
      })
      .finally(() => setGroupsLoading(false));
  };

  const loadPosts = () => {
    apiGet<{ posts: CommunityPost[] }>("/community/posts")
      .then((res) => setPosts(res.posts || []))
      .catch(() => setPostsError("Could not load discussions."))
      .finally(() => setPostsLoading(false));
  };

  useEffect(() => {
    loadGroups();
    loadPosts();
  }, []);

  const joinedGroups = groups.filter((g) => g.joined);

  const toggleMembership = async (group: CommunityGroup) => {
    setJoiningId(group.id);
    try {
      const updated = await apiPost<CommunityGroup>(
        `/community/${group.id}/${group.joined ? "leave" : "join"}`,
        {}
      );
      setGroups((prev) => prev.map((g) => (g.id === group.id ? { ...g, ...updated } : g)));
    } catch {
      toast({ title: "Something went wrong", description: "Try again in a moment.", variant: "destructive" });
    } finally {
      setJoiningId(null);
    }
  };

  const handleCreateGroup = async () => {
    if (!newTopic.trim()) return;
    setCreatingGroup(true);
    try {
      const created = await apiPost<CommunityGroup>("/community", {
        topic: newTopic.trim(),
        description: newDescription.trim(),
      });
      setGroups((prev) => [...prev, created]);
      setNewTopic("");
      setNewDescription("");
      setCreateOpen(false);
      toast({ title: "Group created", description: "You're the first member." });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not create the group.";
      toast({ title: "Couldn't create group", description: message, variant: "destructive" });
    } finally {
      setCreatingGroup(false);
    }
  };

  const submitPost = async () => {
    if (!postGroupId || !postBody.trim()) return;
    setPosting(true);
    try {
      await apiPost(`/community/${postGroupId}/posts`, { body: postBody.trim() });
      setPostBody("");
      setPostGroupId("");
      setPostOpen(false);
      loadPosts();
      toast({ title: "Posted", description: "Your post is live in the group." });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not post — try again.";
      toast({ title: "Couldn't post", description: message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  return (
      <DashboardLayout>
        <div className="flex flex-col gap-6">
        <div className="flex flex-col flex-wrap justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <h1 className="font-marketing text-2xl font-extrabold">Community</h1>
            <p className="text-muted-foreground">Connect with peers and professionals</p>
          </div>
          <div className="flex min-w-0 gap-2">
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search discussions..."
                className="w-full pl-8 sm:w-[280px]"
              />
            </div>
            <Dialog open={postOpen} onOpenChange={setPostOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  disabled={joinedGroups.length === 0}
                  title={joinedGroups.length === 0 ? "Join a group first to post" : undefined}
                  className="shrink-0 rounded-full"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New post</DialogTitle>
                  <DialogDescription>Share a question, a win, or advice with a group you've joined.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={postGroupId} onValueChange={setPostGroupId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {joinedGroups.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="What's on your mind?"
                    value={postBody}
                    onChange={(e) => setPostBody(e.target.value.slice(0, 4000))}
                    rows={5}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={submitPost} disabled={posting || !postGroupId || !postBody.trim()} className="rounded-full">
                    {posting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Post
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
            <Button variant="outline" size="sm" className="hidden sm:flex rounded-full" disabled>
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <TabsContent value="discussions" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Discussions</CardTitle>
                <CardDescription>Real posts from groups across the community</CardDescription>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading discussions…
                  </div>
                ) : postsError ? (
                  <div className="rounded-2xl border p-6 text-center text-muted-foreground">{postsError}</div>
                ) : posts.length === 0 ? (
                  <div className="rounded-2xl border p-10 text-center">
                    <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground" />
                    <h3 className="font-semibold mt-3">No discussions yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                      {joinedGroups.length === 0
                        ? "Join a group below, then be the first to start a conversation."
                        : "Be the first to post in a group you've joined."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {posts.map((p) => (
                      <div key={p.id} className="rounded-2xl border p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{p.authorName}</p>
                          <Badge variant="outline" className="rounded-full">{p.groupTopic}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">{p.body}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(p.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <Card>
              <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>Community Groups</CardTitle>
                  <CardDescription>Find groups related to your interests, or start your own</CardDescription>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="shrink-0 rounded-full">
                      <Plus className="mr-2 h-4 w-4" /> Create group
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>New group</DialogTitle>
                      <DialogDescription>You'll be its first member — invite others by sharing it.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Group name — e.g. 'Breaking into UX Research'"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value.slice(0, 200))}
                      />
                      <Textarea
                        placeholder="What's this group for? (optional)"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value.slice(0, 500))}
                        rows={3}
                      />
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateGroup} disabled={creatingGroup || !newTopic.trim()} className="rounded-full">
                        {creatingGroup && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-4">
                {groupsLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading groups…
                  </div>
                ) : groupsError ? (
                  <div className="rounded-2xl border p-6 text-center text-muted-foreground">
                    {groupsError}
                  </div>
                ) : groups.length === 0 ? (
                  <div className="rounded-2xl border p-6 text-center text-muted-foreground">
                    No groups yet — create the first one.
                  </div>
                ) : (
                  groups.map((g) => (
                    <div key={g.id} className="rounded-2xl border p-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{g.topic}</h3>
                        {g.userCreated && <Badge variant="outline" className="rounded-full text-[10px]">Member-created</Badge>}
                      </div>
                      {g.description && <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>}
                      <div className="flex gap-2 mt-3">
                        <Badge variant="outline" className="rounded-full">{g.members.toLocaleString()} members</Badge>
                        <Badge variant="outline" className="rounded-full">{g.lastActive}</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant={g.joined ? "outline" : "default"}
                        className="mt-3 rounded-full"
                        disabled={joiningId === g.id}
                        onClick={() => toggleMembership(g)}
                      >
                        {joiningId === g.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : g.joined ? (
                          <Check className="mr-2 h-4 w-4" />
                        ) : null}
                        {g.joined ? "Joined" : "Join Group"}
                      </Button>
                    </div>
                  ))
                )}

                <div className="rounded-2xl border border-dashed p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Crown className="h-8 w-8 text-edu-coral mb-2" />
                    <h3 className="font-semibold text-center">Pro Groups</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-xs mt-1">
                      Upgrade to Pro to access industry-specific groups with verified professionals
                    </p>
                    <Button className="mt-3 rounded-full bg-edu-coral hover:bg-edu-coral-dark">Upgrade to Pro</Button>
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
                  <div className="rounded-2xl border p-6 text-center text-muted-foreground">
                    No events scheduled yet — check back soon.
                  </div>
                ) : (
                  upcomingEvents.map((event: EventType) => (
                    <div key={event.id} className="rounded-2xl border p-4">
                      <div className="flex gap-4">
                        <div className="min-w-16 h-16 bg-muted rounded-xl flex flex-col items-center justify-center text-center">
                          <span className="text-sm font-medium">{event.date.split(" ")[0]?.toUpperCase()}</span>
                          <span className="text-lg font-bold">{event.date.split(" ")[1]}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="flex items-center gap-1 rounded-full">
                              <Calendar className="h-3 w-3" />
                              {event.date}, {event.time}
                            </Badge>
                            <Badge variant={event.isPro ? "default" : "outline"} className="rounded-full">
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
                <div className="rounded-2xl border p-6 text-center">
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
