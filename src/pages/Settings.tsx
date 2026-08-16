import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Bell, Globe, Shield, Mail, Save, AlertTriangle, Receipt } from "lucide-react";
import BillingTab from "@/components/settings/BillingTab";
import { apiGet, apiPut, ApiError, ApiTimeoutError } from "@/lib/api";
import { clearAuthSession } from "@/lib/authSession";
import { useToast } from "@/hooks/use-toast";

interface MeUser {
  id: number;
  fullName: string;
  email: string;
  plan: string;
  currentRole?: string | null;
  targetRole?: string | null;
  timeframe?: string | null;
  industry?: string | null;
  yearsExperience?: string | null;
  location?: string | null;
  aspirations?: string | null;
}

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  // "session" = the token was rejected (stale/expired) — send to login.
  // "unavailable" = transient failure (cold start / network) — offer retry.
  const [loadError, setLoadError] = useState<"session" | "unavailable" | null>(null);
  const [loadRetrying, setLoadRetrying] = useState(false);

  // Editable profile fields (the only ones the backend accepts).
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [aspirations, setAspirations] = useState("");
  const [saving, setSaving] = useState(false);

  const loadAccount = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    return apiGet<{ user: MeUser }>("/auth/me")
      .then(({ user }) => {
        setUser(user);
        setCurrentRole(user.currentRole || "");
        setTargetRole(user.targetRole || "");
        setYearsExperience(user.yearsExperience || "");
        setIndustry(user.industry || "");
        setLocation(user.location || "");
        setTimeframe(user.timeframe || "");
        setAspirations(user.aspirations || "");
      })
      .catch((err) => {
        setUser(null);
        // A rejected token means the stored session is stale — clear it and
        // take the user to login so they can actually sign in again instead of
        // hitting a dead end. Transient failures get a retry instead.
        if (err instanceof ApiError && err.status === 401) {
          clearAuthSession();
          window.dispatchEvent(new Event("leap:auth-change"));
          navigate("/login?next=/settings", { replace: true });
          return;
        }
        setLoadError(err instanceof ApiTimeoutError ? "unavailable" : "unavailable");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await apiPut("/auth/profile", {
        currentRole,
        targetRole,
        yearsExperience,
        industry,
        location,
        timeframe,
        aspirations,
      });
      toast({
        title: "Profile updated",
        description: "Your career profile has been saved.",
      });
    } catch {
      toast({
        title: "Could not save",
        description: "The server may be waking up. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AL";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading your settings…
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto py-16 text-center">
          <p className="text-muted-foreground">Could not load your account.</p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={loadRetrying}
              onClick={() => {
                setLoadRetrying(true);
                loadAccount().finally(() => setLoadRetrying(false));
              }}
            >
              {loadRetrying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Try again
            </Button>
            <Link to="/login?next=/settings" className="text-sm font-medium text-stone-900 underline underline-offset-4 hover:text-stone-600">
              Sign in again
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and career profile
          </p>
        </div>

        <Tabs defaultValue="profile" className="mb-8">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
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
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Your sign-in details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-24 w-24">
                        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-muted-foreground text-center max-w-[180px]">
                        Profile photos aren't supported yet.
                      </p>
                    </div>
                    <div className="flex-1 grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" defaultValue={user.fullName} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex items-center gap-2">
                          <Input id="email" type="email" defaultValue={user.email} disabled />
                          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Changing your email or name isn't available yet.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Plan</Label>
                        <div>
                          <span className="inline-flex items-center rounded-full bg-leap-purple/10 px-3 py-1 text-sm font-medium text-leap-purple capitalize">
                            {user.plan}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Career Profile</CardTitle>
                  <CardDescription>
                    These fields drive your personalized roadmap. Saved changes apply the next time
                    a roadmap is generated.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentRole">Current Role</Label>
                      <Input
                        id="currentRole"
                        placeholder="e.g. Backend Developer"
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetRole">Target Role</Label>
                      <Input
                        id="targetRole"
                        placeholder="e.g. Staff Engineer"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearsExperience">Years of Experience</Label>
                      <Input
                        id="yearsExperience"
                        placeholder="e.g. 6"
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        placeholder="e.g. Fintech"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g. Lagos, Nigeria"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeframe">Timeline for Next Career Move</Label>
                      <Select value={timeframe || undefined} onValueChange={setTimeframe}>
                        <SelectTrigger id="timeframe">
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6 months">0–6 months</SelectItem>
                          <SelectItem value="12 months">6–12 months</SelectItem>
                          <SelectItem value="2 years">1–2 years</SelectItem>
                          <SelectItem value="3+ years">3+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aspirations">Long-term Career Aspirations</Label>
                    <Textarea
                      id="aspirations"
                      rows={3}
                      placeholder="What do you want your career to look like in 5 years?"
                      value={aspirations}
                      onChange={(e) => setAspirations(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <BillingTab />
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Not built yet — this page will never pretend otherwise</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Email and in-app notifications are on the roadmap but aren't wired up yet. The
                  toggles you see on other apps would be fake here, so there are none. When
                  notifications exist, you'll control them from this page.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections">
            <Card>
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>Third-party account connections are not available yet</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Account connections (LinkedIn, Twitter, GitHub, learning platforms) are on the
                  roadmap but not built yet. You'll see them here once they exist — this page will
                  never claim a connection that isn't real.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>Password and session management are not built yet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Password changes, two-factor authentication, and device management are on the
                    roadmap. Until then, your account is protected by your sign-in password and
                    signed session tokens.
                  </p>
                  <div className="flex items-start gap-3 p-4 border rounded-md bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-500">Data Export & Deletion</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                        You can request a copy of your data or delete your account at any time
                        through the contact page. Account deletion permanently removes your data.
                      </p>
                    </div>
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
