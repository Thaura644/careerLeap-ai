import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { AISkillsAssessment } from "@/components/onboarding/AISkillsAssessment";
import type { ResumeSkill } from "@/components/onboarding/AISkillsAssessment";
import ResumeAnalysis from "@/components/onboarding/ResumeAnalysis";
import { apiPut } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface AssessedSkill {
  name: string;
  level: number;
}

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(16.6);
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
  const navigate = useNavigate();
  const { toast } = useToast();

  const saveProfile = () => {
    return apiPut("/auth/profile", {
      currentRole: currentRole.trim() || undefined,
      targetRole: targetRole.trim() || undefined,
      location: location.trim() || undefined,
      aspirations: aspirations.trim() || undefined,
      yearsExperience,
      industry,
      timeframe,
      interests: assessedSkills.join(", "),
      learningFormats: learningFormats.join(", "),
      weeklyCommitment,
      learningStyle,
    });
  };

  const nextStep = () => {
    const nextStepNum = step + 1;
    if (nextStepNum > 6) {
      // Onboarding complete — persist the collected profile so the roadmap
      // engine (and everything else) works from real data, then continue.
      saveProfile().catch(() => {
        // Profile save is best-effort on completion; the app still proceeds.
      });
      toast({
        title: "Onboarding complete!",
        description: "Welcome to Leap.ai. Redirecting to your dashboard...",
      });
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
      return;
    }
    setStep(nextStepNum);
    setProgress(nextStepNum * 16.6);
  };

  const prevStep = () => {
    const prevStepNum = step - 1;
    if (prevStepNum < 1) return;
    setStep(prevStepNum);
    setProgress(prevStepNum * 16.6);
  };

  const handleSkillsComplete = (skills: AssessedSkill[]) => {
    setAssessedSkills(skills.map((s) => s.name));
    nextStep();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col">
      <header className="bg-white dark:bg-background shadow-sm py-4 dark:border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-leap-navy to-leap-purple bg-clip-text text-transparent">
              Leap.ai
            </span>

            <Button
              variant="ghost"
              onClick={() => {
                navigate("/dashboard");
              }}
            >
              Skip for now
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Let's set up your career profile</h1>
            <p className="text-gray-600 dark:text-gray-400">
              This shapes the roadmap we generate for you
            </p>
          </div>

          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Step {step} of 6</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              {step === 1 && (
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

              {step === 2 && (
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

              {step === 3 && (
                <ResumeAnalysis
                  onComplete={(skills) => {
                    setResumeSkills(skills);
                    nextStep();
                  }}
                />
              )}

              {step === 4 && (
                <AISkillsAssessment
                  resumeSkills={resumeSkills}
                  onComplete={handleSkillsComplete}
                />
              )}

              {step === 5 && (
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
                                ? "border-leap-purple bg-leap-purple/5"
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

              {step === 6 && (
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
                      className="bg-leap-purple hover:bg-opacity-90 group"
                      onClick={nextStep}
                      size="lg"
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              )}

              {step < 6 && (
                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <Button variant="outline" onClick={prevStep}>
                      Back
                    </Button>
                  ) : (
                    <div></div>
                  )}

                  {step !== 3 && step !== 4 && (
                    <Button className="bg-leap-purple hover:bg-opacity-90" onClick={nextStep}>
                      Continue
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
