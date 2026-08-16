import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Crown,
  Loader2,
  Plus,
  Trash2,
  Radio,
  Square,
  ExternalLink,
  Mic2,
  BookOpen,
  CalendarDays,
} from "lucide-react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useResources } from "@/context/ResourcesContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CreatorResource {
  id: string;
  title: string;
  type: string;
  url: string;
  description?: string;
}

interface CreatorEvent {
  id: string;
  title: string;
  type: string;
  description?: string;
  date: string;
  time: string;
  hostName?: string;
  joinUrl?: string;
  isLive?: boolean;
}

const RESOURCE_TYPES = ["Guide", "Course", "Workshop", "Webinar", "eBook", "Podcast", "Tool"];
const EVENT_TYPES = ["Webinar", "Workshop", "Course", "Guide"];

/** Creator Studio — Pro members publish resources and host live events.
 *  Free accounts see an upgrade prompt; the backend also enforces the gate
 *  (403) so this is never just a hidden button. */
export const CreatorStudio: React.FC = () => {
  const { refresh } = useResources();
  const { toast } = useToast();
  const [isCreator, setIsCreator] = useState<boolean | null>(null);

  const [myResources, setMyResources] = useState<CreatorResource[]>([]);
  const [myEvents, setMyEvents] = useState<CreatorEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Resource form
  const [resTitle, setResTitle] = useState("");
  const [resUrl, setResUrl] = useState("");
  const [resType, setResType] = useState("Guide");
  const [resDesc, setResDesc] = useState("");
  const [savingRes, setSavingRes] = useState(false);

  // Event form
  const [evTitle, setEvTitle] = useState("");
  const [evType, setEvType] = useState("Webinar");
  const [evDate, setEvDate] = useState("");
  const [evTime, setEvTime] = useState("");
  const [evDesc, setEvDesc] = useState("");
  const [evJoinUrl, setEvJoinUrl] = useState("");
  const [savingEv, setSavingEv] = useState(false);
  const [liveBusy, setLiveBusy] = useState<string | null>(null);

  const loadStudio = async () => {
    try {
      const status = await apiGet<{ creator: boolean }>("/creator/status");
      setIsCreator(Boolean(status.creator));
      if (!status.creator) return;
      setLoading(true);
      const [res, evs] = await Promise.all([
        apiGet<{ resources: CreatorResource[] }>("/creator/resources"),
        apiGet<{ events: CreatorEvent[] }>("/creator/events"),
      ]);
      setMyResources(res.resources || []);
      setMyEvents(evs.events || []);
    } catch {
      setIsCreator(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStudio();
  }, []);

  const createResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !resUrl.trim()) return;
    setSavingRes(true);
    try {
      await apiPost("/creator/resources", {
        title: resTitle.trim(),
        url: resUrl.trim(),
        type: resType,
        description: resDesc.trim(),
      });
      toast({ title: "Published", description: "Your resource is now in the library." });
      setResTitle(""); setResUrl(""); setResDesc("");
      await Promise.all([loadStudio(), refresh()]);
    } catch (err) {
      toast({
        title: "Could not publish",
        description: String(err instanceof Error ? err.message : err),
        variant: "destructive",
      });
    }
    setSavingRes(false);
  };

  const deleteResource = async (id: string) => {
    try {
      await apiDelete(`/creator/resources/${id}`);
      await Promise.all([loadStudio(), refresh()]);
    } catch (err) {
      toast({ title: "Could not delete", description: String(err instanceof Error ? err.message : err), variant: "destructive" });
    }
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitle.trim() || !evDate.trim() || !evTime.trim()) return;
    setSavingEv(true);
    try {
      await apiPost("/creator/events", {
        title: evTitle.trim(),
        type: evType,
        date: evDate.trim(),
        time: evTime.trim(),
        description: evDesc.trim(),
        joinUrl: evJoinUrl.trim(),
      });
      toast({ title: "Event scheduled", description: "Your session is on the calendar." });
      setEvTitle(""); setEvDate(""); setEvTime(""); setEvDesc(""); setEvJoinUrl("");
      await loadStudio();
    } catch (err) {
      toast({
        title: "Could not schedule",
        description: String(err instanceof Error ? err.message : err),
        variant: "destructive",
      });
    }
    setSavingEv(false);
  };

  const toggleLive = async (event: CreatorEvent) => {
    setLiveBusy(event.id);
    try {
      await apiPost(`/creator/events/${event.id}/live${event.isLive ? "/end" : ""}`, {});
      await loadStudio();
      toast({
        title: event.isLive ? "Live session ended" : "You're live!",
        description: event.isLive
          ? "The room has been closed."
          : "Attendees can now join your session.",
      });
    } catch (err) {
      toast({ title: "Could not change live state", description: String(err instanceof Error ? err.message : err), variant: "destructive" });
    }
    setLiveBusy(null);
  };

  if (isCreator === null) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking your creator access…
        </CardContent>
      </Card>
    );
  }

  if (!isCreator) {
    return (
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-leap-purple/10">
          <Mic2 className="h-6 w-6 text-leap-purple" />
        </div>
        <h2 className="text-xl font-bold mb-2">Creator Studio</h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Pro members are creators: publish your own guides, courses, and workshops to the
          library, and go live to host career-focused webinars and sessions.
        </p>
        <a href="/upgrade">
          <Button className="mt-5 bg-leap-purple hover:bg-leap-purple/90">
            <Crown className="mr-2 h-4 w-4" /> Upgrade to become a creator
          </Button>
        </a>
      </div>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mic2 className="h-5 w-5 text-leap-purple" />
          <CardTitle className="text-lg">Creator Studio</CardTitle>
          <Badge className="bg-leap-purple text-white border-none">PRO</Badge>
        </div>
        <CardDescription>
          Publish resources to the library and go live to host workshops, webinars, courses,
          and guides.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="resources">
          <TabsList className="mb-4">
            <TabsTrigger value="resources" className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> My resources
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> Live events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resources">
            <form onSubmit={createResource} className="mb-5 rounded-md border p-4 space-y-3">
              <p className="text-sm font-medium">Publish a resource</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cr-title">Title</Label>
                  <Input id="cr-title" value={resTitle} onChange={(e) => setResTitle(e.target.value)} placeholder="e.g. Staff Engineer Case Studies" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cr-type">Type</Label>
                  <select
                    id="cr-type"
                    value={resType}
                    onChange={(e) => setResType(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cr-url">Link</Label>
                <Input id="cr-url" value={resUrl} onChange={(e) => setResUrl(e.target.value)} placeholder="https://…" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cr-desc">Description</Label>
                <Input id="cr-desc" value={resDesc} onChange={(e) => setResDesc(e.target.value)} placeholder="What will people learn?" />
              </div>
              <Button type="submit" size="sm" disabled={savingRes}>
                {savingRes ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Plus className="mr-2 h-3 w-3" />}
                Publish
              </Button>
            </form>

            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading your resources…
              </div>
            ) : myResources.length === 0 ? (
              <p className="text-sm text-muted-foreground">You haven't published anything yet.</p>
            ) : (
              <div className="space-y-2">
                {myResources.map((r) => (
                  <div key={r.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.type} ·{" "}
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-leap-purple hover:underline inline-flex items-center gap-0.5 break-all">
                          {r.url} <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => deleteResource(r.id)} className="shrink-0 text-muted-foreground hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events">
            <form onSubmit={createEvent} className="mb-5 rounded-md border p-4 space-y-3">
              <p className="text-sm font-medium">Schedule a live event</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ce-title">Title</Label>
                  <Input id="ce-title" value={evTitle} onChange={(e) => setEvTitle(e.target.value)} placeholder="e.g. System Design Office Hours" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ce-type">Type</Label>
                  <select
                    id="ce-type"
                    value={evType}
                    onChange={(e) => setEvType(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ce-date">Date</Label>
                  <Input id="ce-date" value={evDate} onChange={(e) => setEvDate(e.target.value)} placeholder="September 5, 2026" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ce-time">Time</Label>
                  <Input id="ce-time" value={evTime} onChange={(e) => setEvTime(e.target.value)} placeholder="6:00 PM WAT" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ce-desc">Description</Label>
                <Input id="ce-desc" value={evDesc} onChange={(e) => setEvDesc(e.target.value)} placeholder="What will attendees get?" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ce-url">Join link (optional — we generate a free Jitsi room if left blank)</Label>
                <Input id="ce-url" value={evJoinUrl} onChange={(e) => setEvJoinUrl(e.target.value)} placeholder="https://meet.jit.si/…" />
              </div>
              <Button type="submit" size="sm" disabled={savingEv}>
                {savingEv ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Plus className="mr-2 h-3 w-3" />}
                Schedule
              </Button>
            </form>

            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading your events…
              </div>
            ) : myEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">You haven't scheduled any events yet.</p>
            ) : (
              <div className="space-y-2">
                {myEvents.map((ev) => (
                  <div key={ev.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {ev.isLive && (
                          <Badge className="bg-red-600 text-white border-none gap-1 animate-pulse">
                            <Radio className="h-3 w-3" /> LIVE
                          </Badge>
                        )}
                        <p className="text-sm font-medium">{ev.title}</p>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">{ev.type}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {ev.date} · {ev.time}
                        {ev.joinUrl && (
                          <>
                            {" · "}
                            <a href={ev.joinUrl} target="_blank" rel="noopener noreferrer" className="text-leap-purple hover:underline inline-flex items-center gap-0.5">
                              room <ExternalLink className="h-3 w-3" />
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={ev.isLive ? "outline" : "default"}
                      className={cn("shrink-0", !ev.isLive && "bg-red-600 hover:bg-red-700")}
                      disabled={liveBusy === ev.id}
                      onClick={() => toggleLive(ev)}
                    >
                      {liveBusy === ev.id ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : ev.isLive ? (
                        <Square className="mr-1 h-3 w-3" />
                      ) : (
                        <Radio className="mr-1 h-3 w-3" />
                      )}
                      {ev.isLive ? "End live" : "Go live"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
