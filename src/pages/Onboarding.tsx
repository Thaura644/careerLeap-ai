
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, ArrowRight, FileText, ChevronRight } from "lucide-react";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(16.6);
  const navigate = useNavigate();
  const { toast } = useToast();

  const nextStep = () => {
    const nextStepNum = step + 1;
    if (nextStepNum > 6) {
      // Onboarding complete
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

  const handleSkillsComplete = (skills: any[]) => {
    console.log("Skills assessment completed:", skills);
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
              This information helps us personalize your experience
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
                  <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="e.g. John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="e.g. Doe" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="e.g. john.doe@example.com" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentRole">Current Role</Label>
                        <Input id="currentRole" placeholder="e.g. Frontend Developer" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yearsExperience">Years of Experience</Label>
                        <Select defaultValue="0-2">
                          <SelectTrigger>
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
                    </div>

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
                      <Input id="location" placeholder="e.g. San Francisco, CA" />
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
                      <Input id="targetRole" placeholder="e.g. Senior Developer" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="careerGoals">What are your main career goals?</Label>
                      <Textarea 
                        id="careerGoals" 
                        placeholder="Describe your professional aspirations in detail"
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Timeline for Next Career Move</Label>
                      <RadioGroup defaultValue="6-12">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="0-6" id="timeline-1" />
                          <Label htmlFor="timeline-1">0-6 months</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="6-12" id="timeline-2" />
                          <Label htmlFor="timeline-2">6-12 months</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1-2" id="timeline-3" />
                          <Label htmlFor="timeline-3">1-2 years</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2+" id="timeline-4" />
                          <Label htmlFor="timeline-4">2+ years</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label>Top Career Priorities</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="priority-1" />
                          <Label htmlFor="priority-1">Higher Salary</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="priority-2" />
                          <Label htmlFor="priority-2">Work-Life Balance</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="priority-3" />
                          <Label htmlFor="priority-3">Leadership Position</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="priority-4" />
                          <Label htmlFor="priority-4">Technical Growth</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="priority-5" />
                          <Label htmlFor="priority-5">Job Security</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="priority-6" />
                          <Label htmlFor="priority-6">Remote Work</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <AISkillsAssessment onComplete={handleSkillsComplete} />
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Resume Upload</h2>
                  
                  <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">Upload your resume</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Our AI will analyze your experience and skills to personalize your career recommendations
                      </p>
                      <Input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        className="max-w-xs mx-auto"
                      />
                    </div>
                    
                    <div className="border rounded-lg p-4 mt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Checkbox id="skip-resume" />
                        <Label htmlFor="skip-resume" className="font-medium">Skip this step</Label>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        You can always upload your resume later in your profile settings
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Learning Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Preferred Learning Formats</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="format-1" defaultChecked />
                          <Label htmlFor="format-1">Video Courses</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="format-2" defaultChecked />
                          <Label htmlFor="format-2">Interactive Tutorials</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="format-3" />
                          <Label htmlFor="format-3">Books & Documentation</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="format-4" />
                          <Label htmlFor="format-4">Articles & Blog Posts</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="format-5" />
                          <Label htmlFor="format-5">Podcasts</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="format-6" />
                          <Label htmlFor="format-6">Live Workshops</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Weekly Learning Time</Label>
                      <RadioGroup defaultValue="5-10">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="0-5" id="time-1" />
                          <Label htmlFor="time-1">0-5 hours</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="5-10" id="time-2" />
                          <Label htmlFor="time-2">5-10 hours</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="10-20" id="time-3" />
                          <Label htmlFor="time-3">10-20 hours</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="20+" id="time-4" />
                          <Label htmlFor="time-4">20+ hours</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Learning Difficulty Preference</Label>
                      <Select defaultValue="intermediate">
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner - Fundamentals & Basics</SelectItem>
                          <SelectItem value="intermediate">Intermediate - Building on Basics</SelectItem>
                          <SelectItem value="advanced">Advanced - Complex Concepts</SelectItem>
                          <SelectItem value="mixed">Mixed - Variety of Levels</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Favorite Learning Platforms</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="platform-1" defaultChecked />
                          <Label htmlFor="platform-1">YouTube</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="platform-2" defaultChecked />
                          <Label htmlFor="platform-2">Udemy</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="platform-3" />
                          <Label htmlFor="platform-3">Coursera</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="platform-4" />
                          <Label htmlFor="platform-4">DataCamp</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="platform-5" />
                          <Label htmlFor="platform-5">Pluralsight</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="platform-6" />
                          <Label htmlFor="platform-6">LinkedIn Learning</Label>
                        </div>
                      </div>
                    </div>
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
                      We've created your personalized career roadmap based on your profile.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg border">
                    <h3 className="font-semibold mb-3">Your AI-generated career path:</h3>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-6 w-6 rounded-full bg-leap-purple"></div>
                          <div className="w-0.5 h-full bg-leap-purple/30"></div>
                        </div>
                        <div className="pb-4">
                          <h4 className="font-medium">Advanced JavaScript Concepts</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            First, strengthen your core JavaScript skills with focus on closures,
                            promises, and asynchronous patterns
                          </p>
                          <Button variant="link" size="sm" className="text-leap-purple mt-1 h-auto p-0 flex items-center">
                            View resources <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                          <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-800"></div>
                        </div>
                        <div className="pb-4">
                          <h4 className="font-medium">System Design Fundamentals</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Learn scalable architecture patterns and best practices for large applications
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                          <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-800"></div>
                        </div>
                        <div className="pb-4">
                          <h4 className="font-medium">Team Leadership Skills</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Develop mentoring abilities and technical leadership to prepare for senior roles
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                        </div>
                        <div>
                          <h4 className="font-medium">Advanced React Patterns</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Master component composition, performance optimization, and state management
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <Button className="bg-leap-purple group">
                        Start your journey 
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
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
                  
                  {step !== 3 && (
                    <Button className="bg-leap-purple hover:bg-opacity-90" onClick={nextStep}>
                      Continue
                    </Button>
                  )}
                </div>
              )}
              
              {step === 6 && (
                <div className="flex justify-center mt-8">
                  <Button 
                    className="bg-leap-purple hover:bg-opacity-90" 
                    onClick={nextStep}
                    size="lg"
                  >
                    Go to Dashboard
                  </Button>
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
