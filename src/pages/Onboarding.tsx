import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AISkillsAssessment } from "@/components/onboarding/AISkillsAssessment";
import type { ResumeSkill } from "@/components/onboarding/AISkillsAssessment";
import ResumeAnalysis from "@/components/onboarding/ResumeAnalysis";
import { PrivacyConsentDialog } from "@/components/auth/PrivacyConsentDialog";
import { apiPut } from "@/lib/api";
import { clearAuthSession, getAuthToken } from "@/lib/authSession";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ArrowRight, Sparkles, Wand2 } from "lucide-react";

interface AssessedSkill {
  name: string;
  level: number;
}

const TOTAL_STEPS = 8;
const GOAL_MAX = 2000;

/* ---------------------------------------------------------------------------
 * Draft persistence — the goal + anything parsed from it survive the sign-in
 * round-trip. localStorage (not sessionStorage) so opening signup in a new
 * tab still finds it; cleared the moment it's applied so it never leaks a
 * stale profile into a future visit.
 * ------------------------------------------------------------------------- */
const DRAFT_KEY = "leap_onboarding_draft";

type Draft = {
  goal?: string;
  currentRole?: string;
  targetRole?: string;
  location?: string;
  yearsExperience?: string;
  industry?: string;
  timeframe?: string;
  challenges?: string[];
  motivation?: string;
};

const loadDraft = (): Draft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
};

const saveDraft = (d: Draft) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* private mode — the draft just won't survive the round-trip */
  }
};

const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
};

/* ---------------------------------------------------------------------------
 * Intent parsing — pull whatever structure we can out of the visitor's own
 * words. High-precision patterns only: anything we're not confident about
 * stays empty for the user to fill on the next steps. Every field it fills
 * remains editable; we never overwrite what the user typed themselves.
 * ------------------------------------------------------------------------- */
const cleanPhrase = (s: string) =>
  s
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^(a|an|the)\s+/i, "")
    .replace(/[.,;:!?]+$/, "")
    .trim();

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const detectTimeframe = (text: string): string => {
  const patterns: [RegExp, string][] = [
    [/\b(?:three|3)\s*\+?\s*years?\b/i, "3+ years"],
    [/\b(?:two|2)\s*(?:to|-|–)?\s*(?:three|3)?\s*years?\b/i, "2 years"],
    [/\b(?:within\s+)?(?:a|one|1)\s+year\b/i, "12 months"],
    [/\b12\s*months?\b/i, "12 months"],
    [/\b(?:six|6)\s*(?:to|-|–)?\s*(?:twelve|12)?\s*months?\b/i, "12 months"],
    [/\b(?:six|6)\s*months?\b/i, "6 months"],
  ];
  for (const [re, value] of patterns) {
    if (re.test(text)) return value;
  }
  return "";
};

const detectIndustry = (text: string): string => {
  const t = text.toLowerCase();
  const rules: [RegExp, string][] = [
    [/nurse|nursing|health|hospital|clinic|medical|pharma|doctor|care\b/, "Healthcare"],
    [/financ|bank|account|invest|fintech|insurance|audit/, "Finance"],
    [/teach|school|educat|professor|tutor/, "Education"],
    [/market|brand|seo|growth|social media/, "Marketing"],
    [/data|analytic|bi\b|scientist|statistic/, "Data & Analytics"],
    [/design|ux\b|ui\b|figma/, "Design"],
    [/sales|account executive|business development|crm\b/, "Sales"],
    [/operations|logistic|supply chain|procure/, "Operations"],
    [/software|engineer|developer|\bdev\b|program|code|cloud|devops|product manage/, "Technology"],
  ];
  for (const [re, value] of rules) {
    if (re.test(t)) return value;
  }
  return "";
};

const detectCurrentRole = (text: string): string => {
  const patterns = [
    /(?:i'?m|i am|currently)\s+(?:a|an)\s+([^.,;!?()\n]{3,50}?)(?=\s+(?:with|who|and|but|looking|want|wanting|hoping|aiming|trying|interested|transition|switch|moving|that|which)\b|[.,;!?()]|\n|$)/i,
    /(?:working|works?|worked)\s+as\s+(?:a|an)?\s*([^.,;!?()\n]{3,50}?)(?=\s+(?:with|who|and|but|looking|want|hoping|aiming|trying|interested|transition|switch|moving|that|which)\b|[.,;!?()]|\n|$)/i,
    /\d+\+?\s*years?[^.,;!?()\n]*?\bas\s+(?:a|an)?\s*([^.,;!?()\n]{3,50}?)(?=\s+(?:with|who|and|but|looking|want|hoping|aiming|trying|interested|transition|switch|moving|that|which)\b|[.,;!?()]|\n|$)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    const raw = (m?.[1] || "").trim();
    if (raw) return cap(cleanPhrase(raw));
  }
  return "";
};

const detectTargetRole = (text: string): string => {
  const end = "(?=\\s+(?:within|in)\\s+(?:a|one|\\d+)\\s*(?:year|years|month|months)\\b|[.,;!?()]|\\n|$)";
  const patterns = [
    new RegExp(`(?:become|becoming)\\s+(?:a|an|the)?\\s*([^.,;!?()\\n]{3,60}?)${end}`, "i"),
    new RegExp(`(?:moving|move|transitioning|transition|switching|switch|shifting|shift|breaking|break)\\s+(?:in)?to\\s+(?:a|an|the)?\\s*([^.,;!?()\\n]{3,60}?)${end}`, "i"),
    new RegExp(`(?:want|wanted|wanting|hope|hoping|aim|aiming|plan|planning|looking)\\s+(?:to\\s+)?(?:become|be|work)\\s+(?:as\\s+)?(?:a|an)?\\s*([^.,;!?()\\n]{3,60}?)${end}`, "i"),
  ];
  for (const re of patterns) {
    const m = text.match(re);
    const raw = (m?.[1] || "").trim();
    if (raw) return cap(cleanPhrase(raw));
  }
  return "";
};

const detectChallenges = (text: string): string[] => {
  const t = text.toLowerCase();
  const rules: [RegExp, string][] = [
    [/(don'?t|do not|not sure|no idea|unclear|confused)[^.,;!?()]*?(know|which|what|where|how)|unclear path/, "Unclear path"],
    [/imposter|self[- ]doubt|not good enough|doubt (?:my|myself)/, "Imposter syndrome"],
    [/(no|without|lack(?:ing)?)\s+(?:of\s+)?(?:real\s+|professional\s+|hands-?on\s+)?experience/, "No real experience"],
    [/interview/, "Interview anxiety"],
    [/(no|without|need)\s+(?:a\s+)?mentor/, "No mentorship"],
    [/(no|not enough|little|limited)\s+time|time\s+is|struggle[^.,;!?()]*?for time/, "Not enough time"],
    [/outdated|behind|stale|keep up|fall(?:ing)? behind/, "Outdated skills"],
    [/switch|transition|moving|new field|new to|changing|change/, "Career switch"],
  ];
  const found: string[] = [];
  for (const [re, name] of rules) {
    if (re.test(t) && !found.includes(name)) found.push(name);
    if (found.length >= 3) break;
  }
  return found;
};

/** Derive profile fields from the goal text — fills only what it's confident about. */
const parseIntent = (goal: string) => {
  const text = goal.trim();
  if (!text) return null;
  return {
    currentRole: detectCurrentRole(text),
    targetRole: detectTargetRole(text),
    timeframe: detectTimeframe(text),
    industry: detectIndustry(text),
    challenges: detectChallenges(text),
  };
};

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(100 / TOTAL_STEPS);

  // Step 1 — the goal, in the visitor's own words.
  const [goal, setGoal] = useState("");

  // All fields live in state — the step DOM unmounts as the user advances, so
  // reading inputs at the end would silently lose them.
  const [currentRole, setCurrentRole] = useState("");
  const [location, setLocation] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [aspirations, setAspirations] = useState("");
  const [yearsExperience, setYearsExperience] = useState("3-5");
  const [industry, setIndustry] = useState("technology");
  const [timeframe, setTimeframe] = useState("12 months");
  const [assessedSkills, setAssessedSkills] = useState<string[]>([]);
  const [resumeSkills, setResumeSkills] = useState<ResumeSkill[]>([]);
  const [learningFormats, setLearningFormats] = useState<string[]>([
    "Video Courses",
    "Hands-on Projects & Coding Practice",
  ]);
  const [weeklyCommitment, setWeeklyCommitment] = useState("3–6 hours");
  const [learningStyle, setLearningStyle] = useState("Project-driven");
  // Deeper context — employment situation, work setup, blockers, motivation.
  const [employmentStatus, setEmploymentStatus] = useState("Employed");
  const [workMode, setWorkMode] = useState("Hybrid");
  const [challenges, setChallenges] = useState<string[]>(["Not enough time"]);
  const [motivation, setMotivation] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  // The plan this signup flow was started from (?plan= from the landing/signup).
  // Paid plans route the user to the pay prompt after onboarding; if they skip
  // payment the account simply stays on Free.
  const plan = searchParams.get("plan");
  const paidPlan = plan === "pro-monthly" || plan === "pro-annual" || plan === "roadmap-report";
  const afterOnboarding = paidPlan ? `/upgrade?plan=${encodeURIComponent(plan || "")}` : "/dashboard";
  // Consent is asked once, right after onboarding completes (or when the user
  // skips the flow), and remembered — it must never block the very first step
  // of onboarding, so it starts closed.
  const [showConsent, setShowConsent] = useState(false);
  // Sign-in prompt shown after "Build my plan" for visitors without an account.
  const [showSignin, setShowSignin] = useState(false);

  const leaveApp = () => {
    setShowConsent(false);
    clearAuthSession();
    window.dispatchEvent(new Event("leap:auth-change"));
    navigate("/");
  };

  /** Save whatever profile data has been collected so far (best-effort). */
  const savePartialProfile = () => {
    // Only bother persisting if at least one real field was filled in.
    const hasData =
      currentRole.trim() || targetRole.trim() || location.trim() || aspirations.trim() ||
      assessedSkills.length > 0 || challenges.length > 0 || motivation.trim();
    if (!hasData) return;
    saveProfile().catch(() => {
      // Best-effort — the user chose to skip; the app still proceeds.
    });
  };

  const acceptConsent = () => {
    localStorage.setItem("leap_privacy_consent", new Date().toISOString());
    setShowConsent(false);
    navigate(afterOnboarding);
  };

  /**
   * "Skip for now" — abandon the guided flow and enter the app. The account
   * must already exist (or be created) so the dashboard is reachable: an
   * unauthenticated visitor is sent to sign up first; a signed-in user gets
   * their partial profile saved and lands on the dashboard.
   */
  const skipOnboarding = () => {
    if (!localStorage.getItem("leap_privacy_consent")) {
      // Entering the app is itself the consent — record it so the gate never
      // comes back, then take the user to the dashboard (never sign them out).
      localStorage.setItem("leap_privacy_consent", new Date().toISOString());
    }
    savePartialProfile();
    navigate("/dashboard");
  };

  const skipIfAccountExists = () => {
    if (getAuthToken()) {
      skipOnboarding();
    } else {
      // No account yet — create one first, then they reach the dashboard.
      // The state flag tells signup to skip onboarding on the way back, so
      // the user isn't bounced right back into this flow.
      navigate("/signup", { state: { skipOnboarding: true } });
    }
  };

  const saveProfile = () => {
    return apiPut("/auth/profile", {
      currentRole: currentRole.trim() || undefined,
      targetRole: targetRole.trim() || undefined,
      location: location.trim() || undefined,
      aspirations: aspirations.trim() || goal.trim() || undefined,
      yearsExperience,
      industry,
      timeframe,
      interests: assessedSkills.join(", "),
      learningFormats: learningFormats.join(", "),
      weeklyCommitment,
      learningStyle,
      employmentStatus,
      workMode,
      challenges: challenges.join(", "),
      motivation: motivation.trim() || undefined,
    });
  };

  /* ---------------------------------------------------------------------------
   * Draft restore — after the sign-in round-trip, put the visitor back where
   * they started: goal parsed, profile prefilled, straight into the details.
   * ------------------------------------------------------------------------- */
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    if (restored) return;
    setRestored(true);
    const draft = loadDraft();
    if (!draft) return;
    clearDraft();
    if (draft.goal) {
      setGoal(draft.goal);
      setAspirations(draft.goal);
    }
    if (draft.currentRole) setCurrentRole(draft.currentRole);
    if (draft.targetRole) setTargetRole(draft.targetRole);
    if (draft.location) setLocation(draft.location);
    if (draft.yearsExperience) setYearsExperience(draft.yearsExperience);
    if (draft.industry) setIndustry(draft.industry);
    if (draft.timeframe) setTimeframe(draft.timeframe);
    if (draft.challenges?.length) setChallenges(draft.challenges);
    if (draft.motivation) setMotivation(draft.motivation);
    if (draft.goal || draft.currentRole || draft.targetRole) {
      // The goal step is done — resume the flow at the details step.
      setStep(2);
      setProgress((2 / TOTAL_STEPS) * 100);
      if (getAuthToken()) {
        toast({
          title: "Welcome back!",
          description: "Your plan draft is right where you left it — keep going.",
        });
      }
    }
  }, [restored, toast]);

  /** Keep the draft in sync once the user has started typing a goal. */
  useEffect(() => {
    if (restored && (goal.trim() || currentRole.trim() || targetRole.trim())) {
      saveDraft({
        goal: goal.trim() || undefined,
        currentRole: currentRole.trim() || undefined,
        targetRole: targetRole.trim() || undefined,
        location: location.trim() || undefined,
        yearsExperience,
        industry,
        timeframe,
        challenges,
        motivation: motivation.trim() || undefined,
      });
    }
  }, [restored, goal, currentRole, targetRole, location, yearsExperience, industry, timeframe, challenges, motivation]);

  /**
   * "Build my plan" — the goal becomes the plan: parse what we can into the
   * profile, then hand the visitor to sign-in (with the draft saved) or
   * straight into the details steps.
   */
  const buildPlan = () => {
    if (!goal.trim()) {
      toast({
        title: "Tell us a little first",
        description: "Even one sentence — what you do now and where you want to go.",
        variant: "destructive",
      });
      return;
    }
    const parsed = parseIntent(goal);
    if (parsed) {
      // Parse fills only what it's confident about; manual edits always win.
      if (parsed.currentRole && !currentRole.trim()) setCurrentRole(parsed.currentRole);
      if (parsed.targetRole && !targetRole.trim()) setTargetRole(parsed.targetRole);
      if (parsed.timeframe) setTimeframe(parsed.timeframe);
      if (parsed.industry) setIndustry(parsed.industry);
      if (parsed.challenges.length) setChallenges(parsed.challenges);
    }
    // The goal doubles as the career-goals text on the later step.
    setAspirations(goal.trim());

    if (!getAuthToken()) {
      // Persist the draft, then ask them to sign in — signup/login comes
      // back here and the restore effect resumes the flow at step 2.
      saveDraft({
        goal: goal.trim(),
        currentRole: currentRole.trim() || parsed?.currentRole || undefined,
        targetRole: targetRole.trim() || parsed?.targetRole || undefined,
        location: location.trim() || undefined,
        yearsExperience,
        industry: parsed?.industry || industry,
        timeframe: parsed?.timeframe || timeframe,
        challenges: parsed?.challenges?.length ? parsed.challenges : challenges,
        motivation: motivation.trim() || undefined,
      });
      setShowSignin(true);
      return;
    }
    advanceToStep2();
  };

  const advanceToStep2 = () => {
    setStep(2);
    setProgress((2 / TOTAL_STEPS) * 100);
  };

  const nextStep = () => {
    const nextStepNum = step + 1;
    if (nextStepNum > TOTAL_STEPS) {
      // Onboarding complete — persist the collected profile so the roadmap
      // engine (and everything else) works from real data, then continue.
      saveProfile().catch(() => {
        // Profile save is best-effort on completion; the app still proceeds.
      });
      if (!localStorage.getItem("leap_privacy_consent")) {
        // Gate on privacy consent before entering the app (non-dismissible).
        setShowConsent(true);
        return;
      }
      toast({
        title: "Onboarding complete!",
        description: paidPlan
          ? "Your profile is ready. Now set up payment to unlock your plan."
          : "Welcome to Leap.ai. Redirecting to your dashboard...",
      });
      setTimeout(() => {
        navigate(afterOnboarding);
      }, 1500);
      return;
    }
    setStep(nextStepNum);
    setProgress(nextStepNum * (100 / TOTAL_STEPS));
  };

  const prevStep = () => {
    const prevStepNum = step - 1;
    if (prevStepNum < 1) return;
    setStep(prevStepNum);
    setProgress(prevStepNum * (100 / TOTAL_STEPS));
  };

  const handleSkillsComplete = (skills: AssessedSkill[]) => {
    setAssessedSkills(skills.map((s) => s.name));
    nextStep();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <span className="font-marketing text-[22px] font-extrabold tracking-tight text-foreground">
              Leap<span className="text-edu-coral">.ai</span>
            </span>

            <Button variant="ghost" onClick={skipIfAccountExists}>
              Skip for now
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {paidPlan && (
            <div className="mb-6 rounded-2xl border border-edu-indigo/20 bg-edu-lavender px-4 py-3 text-sm text-edu-lavender-fg">
              You're signing up for{" "}
              <span className="font-semibold">
                {plan === "roadmap-report" ? "Career Audit" : "Pro"}
              </span>
              . Complete your profile, then you'll set up payment to unlock it — skip it and
              your account stays on the free plan.
            </div>
          )}
          {step >= 2 && (
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">Let's set up your career profile</h1>
              <p className="text-gray-600 dark:text-gray-400">
                This shapes the roadmap we generate for you
              </p>
            </div>
          )}

          {step >= 2 && (
            <div className="mb-8">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Step {step} of {TOTAL_STEPS}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* Step 1 — the goal, in the visitor's own words                */}
          {/* ----------------------------------------------------------- */}
          {step === 1 && (
            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-edu-lavender px-4 py-1.5 text-xs font-semibold text-edu-lavender-fg">
                      <Sparkles className="h-3.5 w-3.5" /> Start with your goal
                    </span>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight">
                      What do you want to achieve?
                    </h1>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                      Tell Leap.ai what you're trying to do — your current situation, your
                      target role, what's in the way — in your own words. We'll build a plan
                      from it and fill in the details together.
                    </p>
                  </div>

                  <div className="relative">
                    <Textarea
                      id="goal"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value.slice(0, GOAL_MAX))}
                      maxLength={GOAL_MAX}
                      rows={5}
                      autoFocus
                      placeholder="e.g. I'm a nurse with 6 years of experience and I want to move into health-tech product management within a year, but I don't know which skills actually matter yet…"
                      className="min-h-[130px] resize-none bg-white pr-16 text-[15px]"
                    />
                    <span className="pointer-events-none absolute bottom-2.5 right-3 text-[11px] text-muted-foreground">
                      {goal.length}/{GOAL_MAX}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <Button
                      className="h-12 w-full rounded-full bg-edu-coral text-sm font-semibold shadow-lg shadow-edu-coral/25 hover:bg-edu-coral-dark group"
                      onClick={buildPlan}
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      Build my plan
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <button
                      type="button"
                      onClick={advanceToStep2}
                      className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                      Skip this — I'll fill in the form instead
                    </button>
                  </div>

                  <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                    No account needed to start — you'll be asked to save your plan when it's
                    built. We pick up exactly where you left off after you sign in.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step >= 2 && (
            <Card className="shadow-md">
              <CardContent className="pt-6">
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Career Details</h2>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentRole">Current Role</Label>
                      <Input
                        id="currentRole"
                        placeholder="e.g. Frontend Developer"
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yearsExperience">Years of Experience</Label>
                        <Select value={yearsExperience} onValueChange={setYearsExperience}>
                          <SelectTrigger id="yearsExperience">
                            <SelectValue placeholder="Select years" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-2">0-2 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="6-10">6-10 years</SelectItem>
                            <SelectItem value="10+">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select value={industry} onValueChange={setIndustry}>
                          <SelectTrigger id="industry">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Data & Analytics">Data & Analytics</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                            <SelectItem value="Government & Nonprofit">Government & Nonprofit</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Career Goals</h2>

                  <div className="space-y-4">
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
                      <Label htmlFor="careerGoals">What are your main career goals?</Label>
                      <Textarea
                        id="careerGoals"
                        placeholder="Describe your professional aspirations in detail"
                        className="min-h-[100px]"
                        value={aspirations}
                        onChange={(e) => setAspirations(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Timeline for Next Career Move</Label>
                      <RadioGroup value={timeframe} onValueChange={setTimeframe}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="6 months" id="timeline-1" />
                          <Label htmlFor="timeline-1">0-6 months</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="12 months" id="timeline-2" />
                          <Label htmlFor="timeline-2">6-12 months</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2 years" id="timeline-3" />
                          <Label htmlFor="timeline-3">1-2 years</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3+ years" id="timeline-4" />
                          <Label htmlFor="timeline-4">3+ years</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Your Situation</h2>
                  <p className="text-sm text-muted-foreground -mt-3">
                    The more the assistant knows about where you are now, the sharper its
                    advice — for your setup, your next move, and the best career path.
                  </p>

                  <div className="space-y-2">
                    <Label>Current Employment Status</Label>
                    <RadioGroup value={employmentStatus} onValueChange={setEmploymentStatus} className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {["Employed", "Unemployed", "Student", "Freelance", "Contract", "Other"].map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`emp-${option}`} />
                          <Label htmlFor={`emp-${option}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Work Setup</Label>
                    <RadioGroup value={workMode} onValueChange={setWorkMode} className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {["Remote", "Hybrid", "On-site", "Open to all"].map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`mode-${option}`} />
                          <Label htmlFor={`mode-${option}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>What's holding you back? (pick the big ones)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        { name: "Not enough time", desc: "Work and life leave little room" },
                        { name: "Imposter syndrome", desc: "Doubting your own abilities" },
                        { name: "No mentorship", desc: "Nobody to guide your growth" },
                        { name: "Unclear path", desc: "Don't know what to learn next" },
                        { name: "No real experience", desc: "Projects but no professional proof" },
                        { name: "Interview anxiety", desc: "Freeze up in interviews and tests" },
                        { name: "Career switch", desc: "Moving into a new field entirely" },
                        { name: "Outdated skills", desc: "Falling behind the market" },
                      ].map((c) => {
                        const checked = challenges.includes(c.name);
                        return (
                          <div
                            key={c.name}
                            className={`flex items-start gap-2 rounded-md border p-2.5 cursor-pointer transition-colors ${
                              checked
                                ? "border-edu-indigo bg-edu-indigo/5"
                                : "border-gray-200 hover:border-gray-300 dark:border-border"
                            }`}
                            onClick={() =>
                              setChallenges((prev) =>
                                checked ? prev.filter((x) => x !== c.name) : [...prev, c.name]
                              )
                            }
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              readOnly
                              className="h-4 w-4 rounded border mt-0.5"
                            />
                            <div>
                              <Label className="cursor-pointer font-medium">{c.name}</Label>
                              <p className="text-xs text-muted-foreground">{c.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motivation">What's driving this career move?</Label>
                    <Textarea
                      id="motivation"
                      placeholder="e.g. I want to lead teams, earn more, and build things that matter — and I'm tired of feeling stuck."
                      className="min-h-[90px]"
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 5 && (
                <ResumeAnalysis
                  onComplete={(skills) => {
                    setResumeSkills(skills);
                    nextStep();
                  }}
                />
              )}

              {step === 6 && (
                <AISkillsAssessment
                  resumeSkills={resumeSkills}
                  onComplete={handleSkillsComplete}
                />
              )}

              {step === 7 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Learning Preferences</h2>
                  <p className="text-sm text-muted-foreground -mt-3">
                    These are used for real — they shape your roadmap's pace, the resources the
                    library surfaces, and what the roadmap recommends.
                  </p>

                  <div className="space-y-2">
                    <Label>Preferred Learning Formats</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        { name: "Video Courses", desc: "Library courses and video series" },
                        { name: "Books & Documentation", desc: "eBooks, docs, and reference guides" },
                        { name: "Articles & Blog Posts", desc: "Concise guides and deep dives" },
                        { name: "Podcasts", desc: "Podcast series from the library" },
                        { name: "Live Workshops & Webinars", desc: "Live sessions and recorded talks" },
                        { name: "Hands-on Projects & Coding Practice", desc: "Practice problems with a real judge" },
                        { name: "Community & Discussion", desc: "Community groups and peer exchange" },
                      ].map((format) => {
                        const checked = learningFormats.includes(format.name);
                        return (
                          <div
                            key={format.name}
                            className={`flex items-start gap-2 rounded-md border p-2.5 cursor-pointer transition-colors ${
                              checked
                                ? "border-edu-indigo bg-edu-indigo/5"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() =>
                              setLearningFormats((prev) =>
                                checked ? prev.filter((f) => f !== format.name) : [...prev, format.name]
                              )
                            }
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              readOnly
                              className="h-4 w-4 rounded border mt-0.5"
                            />
                            <div>
                              <Label className="cursor-pointer font-medium">{format.name}</Label>
                              <p className="text-xs text-muted-foreground">{format.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Weekly Time You Can Commit</Label>
                    <RadioGroup value={weeklyCommitment} onValueChange={setWeeklyCommitment} className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {["<3 hours", "3–6 hours", "6–10 hours", "10+ hours"].map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`commitment-${option}`} />
                          <Label htmlFor={`commitment-${option}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>How You Learn Best</Label>
                    <RadioGroup value={learningStyle} onValueChange={setLearningStyle} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {[
                        { name: "Self-paced", desc: "Work through material at your own speed" },
                        { name: "Structured curriculum", desc: "Follow a sequenced, step-by-step plan" },
                        { name: "Project-driven", desc: "Learn by building real things" },
                      ].map((option) => (
                        <div key={option.name} className="flex items-start space-x-2">
                          <RadioGroupItem value={option.name} id={`style-${option.name}`} className="mt-1" />
                          <div>
                            <Label htmlFor={`style-${option.name}`} className="font-medium">{option.name}</Label>
                            <p className="text-xs text-muted-foreground">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              )}

              {step === 8 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">You're all set!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Your profile is saved. Your personalized roadmap is generated from it on your
                      dashboard.
                    </p>
                    <Button
                      className="bg-edu-indigo hover:bg-opacity-90 group"
                      onClick={nextStep}
                      size="lg"
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              )}

              {step >= 2 && step < 8 && (
                <div className="flex justify-between mt-8">
                  {step > 2 ? (
                    <Button variant="outline" onClick={prevStep}>
                      Back
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={prevStep}>
                      Back
                    </Button>
                  )}

                  {step !== 5 && step !== 6 && (
                    <Button className="bg-edu-indigo hover:bg-opacity-90" onClick={nextStep}>
                      Continue
                    </Button>
                  )}
                </div>
              )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* Sign-in prompt — shown right after "Build my plan" for visitors */}
      {/* without an account. The draft is already saved; signup/login    */}
      {/* returns to /onboarding and the flow resumes mid-plan.           */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={showSignin} onOpenChange={setShowSignin}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Your plan is built — save it
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              Create a free account (or log in) and your goal plus everything we parsed from it
              is waiting for you — you'll pick up exactly where you left off.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Button
              asChild
              className="h-11 w-full rounded-full bg-edu-coral text-sm font-semibold shadow-lg shadow-edu-coral/25 hover:bg-edu-coral-dark"
            >
              <a href={`/signup?next=${encodeURIComponent(`/onboarding${plan ? `?plan=${encodeURIComponent(plan)}` : ""}`)}`}>
                Create free account
              </a>
            </Button>
            <Button asChild variant="outline" className="h-11 w-full rounded-full text-sm font-semibold">
              <a href={`/login?next=${encodeURIComponent(`/onboarding${plan ? `?plan=${encodeURIComponent(plan)}` : ""}`)}`}>
                I already have an account
              </a>
            </Button>
            <button
              type="button"
              onClick={() => {
                setShowSignin(false);
                advanceToStep2();
              }}
              className="w-full pt-1 text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Continue without an account (your plan won't be saved)
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy-policy consent — asked once after onboarding. Decline signs
          the user out; accepting remembers the choice for next time. */}
      <PrivacyConsentDialog
        open={showConsent}
        onAccept={acceptConsent}
        onDecline={leaveApp}
      />
    </div>
  );
};

export default Onboarding;
