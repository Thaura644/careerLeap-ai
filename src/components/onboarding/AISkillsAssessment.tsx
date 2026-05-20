
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Brain, CheckCheck } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";

interface AISkillsAssessmentProps {
  onComplete: (skills: any[]) => void;
  className?: string;
}

const skillFormSchema = z.object({
  skills: z.array(
    z.object({
      name: z.string().min(1, "Skill name is required"),
      level: z.number().min(0).max(100)
    })
  ).min(1, "At least one skill is required"),
});

const defaultSkills = [
  { name: "JavaScript", level: 50 },
  { name: "React", level: 25 },
  { name: "Node.js", level: 35 },
  { name: "System Design", level: 15 },
  { name: "Leadership", level: 20 },
];

const skillSuggestions = [
  "TypeScript", "Python", "Java", "C#", "SQL", "MongoDB", 
  "AWS", "Docker", "Kubernetes", "Git", "CI/CD", "TDD",
  "UX/UI Design", "Agile Methodologies", "DevOps", "Microservices",
  "Cloud Architecture", "Data Structures", "Algorithms", "Machine Learning"
];

export const AISkillsAssessment: React.FC<AISkillsAssessmentProps> = ({ 
  onComplete,
  className 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const form = useForm<z.infer<typeof skillFormSchema>>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      skills: defaultSkills,
    },
  });

  const skills = form.watch("skills");
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }
    
    // Filter skill suggestions
    const existingSkillNames = skills.map(skill => skill.name.toLowerCase());
    const filtered = skillSuggestions
      .filter(skill => 
        skill.toLowerCase().includes(query.toLowerCase()) && 
        !existingSkillNames.includes(skill.toLowerCase())
      )
      .slice(0, 5);
      
    setSuggestions(filtered);
  };
  
  const addSkill = (skillName: string) => {
    const existingSkillNames = skills.map(skill => skill.name.toLowerCase());
    
    // Check if skill already exists
    if (existingSkillNames.includes(skillName.toLowerCase())) {
      return;
    }
    
    const updatedSkills = [...skills, { name: skillName, level: 50 }];
    form.setValue("skills", updatedSkills);
    setSearchQuery("");
    setSuggestions([]);
  };
  
  const removeSkill = (index: number) => {
    const updatedSkills = [...skills];
    updatedSkills.splice(index, 1);
    form.setValue("skills", updatedSkills);
  };
  
  const handleAddCustomSkill = () => {
    if (!searchQuery.trim()) return;
    addSkill(searchQuery);
  };
  
  const getLevelLabel = (level: number) => {
    if (level < 20) return "Beginner";
    if (level < 40) return "Basic";
    if (level < 60) return "Intermediate";
    if (level < 80) return "Advanced";
    return "Expert";
  };
  
  const getProgressColor = (level: number) => {
    if (level < 20) return "bg-red-500";
    if (level < 40) return "bg-orange-500";
    if (level < 60) return "bg-yellow-500";
    if (level < 80) return "bg-green-500";
    return "bg-emerald-500";
  };
  
  const onSubmit = (data: z.infer<typeof skillFormSchema>) => {
    onComplete(data.skills);
  };
  
  const handleGenerateAI = () => {
    form.setValue("skills", [
      { name: "JavaScript", level: 65 },
      { name: "React", level: 75 },
      { name: "Node.js", level: 40 },
      { name: "TypeScript", level: 55 },
      { name: "System Design", level: 35 },
      { name: "Leadership", level: 30 },
      { name: "Git", level: 80 },
      { name: "CI/CD", level: 45 },
    ]);
  };

  return (
    <div className={className}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Assess Your Skills</h1>
        <p className="text-gray-600">
          Rate your proficiency in each skill to help us create your personalized roadmap
        </p>
      </div>
      
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold mb-4">Your Skills</h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleGenerateAI}
            >
              <Brain className="h-4 w-4" />
              <span>AI Analyze Resume</span>
            </Button>
          </div>
          
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search or add a skill..."
                className="pl-9"
                value={searchQuery}
                onChange={handleSearch}
              />
              
              {suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-md">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion}
                      className="px-3 py-2 hover:bg-muted cursor-pointer"
                      onClick={() => addSkill(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button type="button" onClick={handleAddCustomSkill}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <FormField
                    key={index}
                    control={form.control}
                    name={`skills.${index}.level`}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <div className="flex justify-between items-center">
                          <FormLabel>{skill.name}</FormLabel>
                          <Badge 
                            variant="outline" 
                            className="cursor-pointer"
                            onClick={() => removeSkill(index)}
                          >
                            Remove
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <FormControl className="flex-1">
                            <Slider
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              max={100}
                              step={5}
                            />
                          </FormControl>
                          <div className="flex items-center gap-2 w-36">
                            <Progress 
                              value={field.value} 
                              className={cn("h-2 w-16", getProgressColor(field.value))} 
                            />
                            <span className="text-sm whitespace-nowrap">
                              {getLevelLabel(field.value)} ({field.value}%)
                            </span>
                          </div>
                        </div>
                        <FormDescription>
                          {field.value < 20 && "Familiar with basic concepts"}
                          {field.value >= 20 && field.value < 40 && "Can work with guidance"}
                          {field.value >= 40 && field.value < 60 && "Can work independently"}
                          {field.value >= 60 && field.value < 80 && "Can teach others"}
                          {field.value >= 80 && "Expert level knowledge"}
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline">
                  Back
                </Button>
                <Button type="submit" className="bg-leap-purple">
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Complete Assessment
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
};
