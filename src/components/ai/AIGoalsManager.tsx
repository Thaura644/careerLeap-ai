
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Calendar 
} from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { 
  CalendarIcon, 
  ChevronRight, 
  CheckCircle2, 
  CircleDashed, 
  CircleEllipsis,
  PlusCircle,
  Flag,
  Trash2,
  Pencil,
  Brain
} from "lucide-react";
import { format } from "date-fns";
import { useAI } from "@/context/AIContext";
import { CareerGoal } from "@/types/ai";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";

interface AIGoalsManagerProps {
  className?: string;
}

const goalFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500),
  priority: z.enum(["low", "medium", "high"]),
  targetDate: z.date({
    required_error: "Target date is required",
  }),
  status: z.enum(["not-started", "in-progress", "completed"]),
  progress: z.number().min(0).max(100)
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

export const AIGoalsManager: React.FC<AIGoalsManagerProps> = ({ className }) => {
  const { profile, setGoal, updateGoal, deleteGoal, isProcessing } = useAI();
  const [isEditing, setIsEditing] = useState(false);
  const [currentGoalId, setCurrentGoalId] = useState<string | null>(null);
  
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      targetDate: new Date(),
      status: "not-started",
      progress: 0
    }
  });

  const onSubmit = async (values: GoalFormValues) => {
    if (isEditing && currentGoalId) {
      await updateGoal(currentGoalId, values);
    } else {
      await setGoal(values);
    }
    form.reset();
    setIsEditing(false);
    setCurrentGoalId(null);
  };

  const handleEditGoal = (goal: CareerGoal) => {
    setIsEditing(true);
    setCurrentGoalId(goal.id);
    form.reset({
      title: goal.title,
      description: goal.description,
      priority: goal.priority,
      targetDate: new Date(goal.targetDate),
      status: goal.status,
      progress: goal.progress
    });
  };

  const handleDeleteGoal = async (id: string) => {
    await deleteGoal(id);
  };

  const getStatusIcon = (status: CareerGoal["status"]) => {
    switch (status) {
      case "not-started":
        return <CircleDashed className="h-5 w-5 text-muted-foreground" />;
      case "in-progress":
        return <CircleEllipsis className="h-5 w-5 text-amber-500" />;
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: CareerGoal["priority"]) => {
    switch (priority) {
      case "low":
        return "text-blue-500 bg-blue-500/10";
      case "medium":
        return "text-amber-500 bg-amber-500/10";
      case "high":
        return "text-rose-500 bg-rose-500/10";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return "bg-rose-500";
    if (progress < 70) return "bg-amber-500";
    return "bg-green-500";
  };

  const resetForm = () => {
    form.reset();
    setIsEditing(false);
    setCurrentGoalId(null);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Career Goals</CardTitle>
            <CardDescription>Track and manage your professional goals</CardDescription>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={resetForm}>
                <PlusCircle className="h-4 w-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Goal" : "Create a New Goal"}</DialogTitle>
                <DialogDescription>
                  {isEditing 
                    ? "Make changes to your existing goal" 
                    : "Define a clear career objective to track your progress"}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Learn React Advanced Patterns" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what you want to achieve"
                            className="min-h-[80px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="targetDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Target Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Auto-set progress based on status
                              if (value === "completed") {
                                form.setValue("progress", 100);
                              } else if (value === "not-started") {
                                form.setValue("progress", 0);
                              }
                            }} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="not-started">Not Started</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="progress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Progress: {field.value}%</FormLabel>
                          <FormControl>
                            <Input 
                              type="range" 
                              min="0" 
                              max="100" 
                              step="5"
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                field.onChange(value);
                                
                                // Auto-update status based on progress
                                if (value === 100) {
                                  form.setValue("status", "completed");
                                } else if (value === 0) {
                                  form.setValue("status", "not-started");
                                } else {
                                  form.setValue("status", "in-progress");
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isProcessing} className="bg-leap-purple">
                      {isProcessing ? "Saving..." : isEditing ? "Update Goal" : "Create Goal"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!profile || profile.goals.length === 0 ? (
          <div className="text-center py-6">
            <div className="bg-muted rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-3">
              <Flag className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium">No goals yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Create your first career goal to start tracking your progress
            </p>
          </div>
        ) : (
          profile.goals.map((goal) => (
            <Card key={goal.id} className="border overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(goal.status)}
                      <h3 className="font-medium">{goal.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditGoal(goal)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {goal.description && (
                    <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                  )}
                  
                  <div className="flex flex-col xs:flex-row justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1 text-xs">
                      <CalendarIcon className="h-3 w-3" />
                      <span>Target: {format(new Date(goal.targetDate), "MMM d, yyyy")}</span>
                    </div>
                    <div 
                      className={cn(
                        "text-xs px-2 py-1 rounded-full w-fit",
                        getPriorityColor(goal.priority)
                      )}
                    >
                      {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress 
                      value={goal.progress} 
                      className={cn("h-2", getProgressColor(goal.progress))} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
          <Brain className="h-3 w-3" />
          Get AI recommendations
        </Button>
        <Button variant="link" size="sm" className="text-xs text-leap-purple flex items-center">
          View all goals <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};
