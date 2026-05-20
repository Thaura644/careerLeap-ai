import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { AIUserProfile, AIMessage, RecommendedResource, CareerGoal } from "@/types/ai";
import { uuid } from "@/lib/ai-utils";

interface AIContextType {
  isProcessing: boolean;
  profile: AIUserProfile | null;
  currentConversation: string | null;
  setCurrentConversation: (id: string | null) => void;
  sendMessage: (content: string) => Promise<void>;
  generateRecommendations: () => Promise<void>;
  setGoal: (goal: Partial<CareerGoal>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<CareerGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  recommendedResources: RecommendedResource[];
  updateUserProfile: (profile: Partial<AIUserProfile>) => Promise<void>;
  messages: AIMessage[];
  clearMessages: () => void;
}

// Mock function to simulate AI processing
const simulateAIProcessing = async (prompt: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Different responses based on input
  if (prompt.toLowerCase().includes("goal")) {
    return "I'd be happy to help you set a new career goal. What specific skill or milestone would you like to achieve?";
  } else if (prompt.toLowerCase().includes("recommend") || prompt.toLowerCase().includes("resource")) {
    return "Based on your profile and goals, I recommend focusing on advanced React patterns and system design principles. Would you like me to find specific resources on these topics?";
  } else if (prompt.toLowerCase().includes("hello") || prompt.toLowerCase().includes("hi")) {
    return "Hello! I'm your AI career assistant. How can I help you with your professional development today?";
  } else {
    return "I understand you're interested in advancing your career. Based on your profile, I suggest focusing on leadership skills and system design. Would you like specific resources on these topics?";
  }
};

// Mock function to generate resource recommendations
const generateMockRecommendations = (): RecommendedResource[] => {
  return [
    {
      id: uuid(),
      title: "Advanced React Patterns",
      source: "youtube",
      url: "https://youtube.com/watch?v=example1",
      description: "Learn advanced React patterns like compound components, render props, and hooks.",
      difficulty: "intermediate",
      estimatedTime: "1 hour 20 min",
      thumbnail: "https://i.ytimg.com/vi/example/hqdefault.jpg",
      relevanceScore: 0.92
    },
    {
      id: uuid(),
      title: "System Design for Tech Interviews",
      source: "coursera",
      url: "https://coursera.org/learn/systemdesign",
      description: "Master system design concepts required for senior engineering roles.",
      difficulty: "advanced",
      estimatedTime: "10 hours",
      relevanceScore: 0.89
    },
    {
      id: uuid(),
      title: "Leadership Skills for Engineers",
      source: "udemy",
      url: "https://udemy.com/course/leadership-for-engineers",
      description: "Essential leadership skills for engineers transitioning to management roles.",
      difficulty: "intermediate",
      estimatedTime: "5 hours",
      thumbnail: "https://img-c.udemycdn.com/course/240x135/example.jpg",
      relevanceScore: 0.85
    },
    {
      id: uuid(),
      title: "Python for Data Science",
      source: "datacamp",
      url: "https://datacamp.com/courses/python-data-science",
      description: "Learn Python fundamentals for data analysis and visualization.",
      difficulty: "beginner",
      estimatedTime: "8 hours",
      relevanceScore: 0.78
    }
  ];
};

// Create the mock user profile
const createMockProfile = (): AIUserProfile => {
  const conversationId = uuid();
  
  return {
    id: uuid(),
    userId: "user123",
    interests: ["Web Development", "System Design", "Data Science", "Leadership"],
    goals: [
      {
        id: uuid(),
        title: "Master Advanced React Patterns",
        description: "Learn and implement advanced React patterns in a project",
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "in-progress",
        progress: 45,
        priority: "high",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuid(),
        title: "Obtain AWS Certification",
        description: "Study and pass the AWS Solutions Architect exam",
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: "not-started",
        progress: 0,
        priority: "medium",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    skillAssessments: [
      {
        id: uuid(),
        name: "React",
        currentLevel: 75,
        targetLevel: 90,
        recommendations: ["Advanced hooks", "State management", "Performance optimization"],
        lastUpdated: new Date()
      },
      {
        id: uuid(),
        name: "System Design",
        currentLevel: 60,
        targetLevel: 85,
        recommendations: ["Distributed systems", "Scalability patterns", "Database design"],
        lastUpdated: new Date()
      },
      {
        id: uuid(),
        name: "Leadership",
        currentLevel: 40,
        targetLevel: 70,
        recommendations: ["Team management", "Communication", "Project planning"],
        lastUpdated: new Date()
      }
    ],
    conversations: [
      {
        id: conversationId,
        title: "Career Planning",
        messages: [
          {
            id: uuid(),
            role: "system",
            content: "I'm your career assistant. How can I help you today?",
            timestamp: new Date(Date.now() - 86400000)
          }
        ],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000)
      }
    ],
    learningHistory: [],
    recommendedResources: generateMockRecommendations()
  };
};

export const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [profile, setProfile] = useState<AIUserProfile | null>(null);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [recommendedResources, setRecommendedResources] = useState<RecommendedResource[]>([]);
  const [messages, setMessages] = useState<AIMessage[]>([]);

  // Initialize with mock data
  useEffect(() => {
    const mockProfile = createMockProfile();
    setProfile(mockProfile);
    
    if (mockProfile.conversations.length > 0) {
      setCurrentConversation(mockProfile.conversations[0].id);
      setMessages(mockProfile.conversations[0].messages);
    }
    
    setRecommendedResources(mockProfile.recommendedResources);
  }, []);

  // Send a message to the AI
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !profile || !currentConversation) return;
    
    setIsProcessing(true);
    
    // Add user message
    const userMessage: AIMessage = {
      id: uuid(),
      role: "user",
      content,
      timestamp: new Date()
    };
    
    // Optimistically update UI
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Simulate AI processing
      const response = await simulateAIProcessing(content);
      
      // Add AI response
      const aiMessage: AIMessage = {
        id: uuid(),
        role: "assistant",
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update conversation in profile
      if (profile) {
        const updatedProfile = { ...profile };
        const conversationIndex = updatedProfile.conversations.findIndex(
          c => c.id === currentConversation
        );
        
        if (conversationIndex !== -1) {
          updatedProfile.conversations[conversationIndex].messages = [
            ...updatedProfile.conversations[conversationIndex].messages,
            userMessage,
            aiMessage
          ];
          updatedProfile.conversations[conversationIndex].updatedAt = new Date();
          setProfile(updatedProfile);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive"
      });
      console.error("AI processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [profile, currentConversation, toast]);

  // Generate recommendations based on user profile
  const generateRecommendations = useCallback(async () => {
    if (!profile) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate AI generating recommendations
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newRecommendations = generateMockRecommendations();
      setRecommendedResources(newRecommendations);
      
      toast({
        title: "Success",
        description: "New learning resources have been recommended for you.",
      });
      
      // Update profile with new recommendations
      if (profile) {
        const updatedProfile = { ...profile };
        updatedProfile.recommendedResources = newRecommendations;
        setProfile(updatedProfile);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive"
      });
      console.error("Recommendation generation error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [profile, toast]);

  // Add or update a career goal
  const setGoal = useCallback(async (goal: Partial<CareerGoal>) => {
    if (!profile) return;
    
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newGoal: CareerGoal = {
        id: uuid(),
        title: goal.title || "New Goal",
        description: goal.description || "",
        targetDate: goal.targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: goal.status || "not-started",
        progress: goal.progress || 0,
        priority: goal.priority || "medium",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updatedProfile = { ...profile };
      updatedProfile.goals = [...updatedProfile.goals, newGoal];
      setProfile(updatedProfile);
      
      toast({
        title: "Goal Created",
        description: `Your new goal "${newGoal.title}" has been created.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive"
      });
      console.error("Goal creation error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [profile, toast]);

  // Update an existing goal
  const updateGoal = useCallback(async (id: string, goalUpdates: Partial<CareerGoal>) => {
    if (!profile) return;
    
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedProfile = { ...profile };
      const goalIndex = updatedProfile.goals.findIndex(g => g.id === id);
      
      if (goalIndex !== -1) {
        updatedProfile.goals[goalIndex] = {
          ...updatedProfile.goals[goalIndex],
          ...goalUpdates,
          updatedAt: new Date()
        };
        
        setProfile(updatedProfile);
        
        toast({
          title: "Goal Updated",
          description: `Your goal "${updatedProfile.goals[goalIndex].title}" has been updated.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive"
      });
      console.error("Goal update error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [profile, toast]);

  // Delete a goal
  const deleteGoal = useCallback(async (id: string) => {
    if (!profile) return;
    
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedProfile = { ...profile };
      const goalIndex = updatedProfile.goals.findIndex(g => g.id === id);
      
      if (goalIndex !== -1) {
        const goalTitle = updatedProfile.goals[goalIndex].title;
        updatedProfile.goals = updatedProfile.goals.filter(g => g.id !== id);
        setProfile(updatedProfile);
        
        toast({
          title: "Goal Deleted",
          description: `Your goal "${goalTitle}" has been deleted.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive"
      });
      console.error("Goal deletion error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [profile, toast]);

  // Update user profile
  const updateUserProfile = useCallback(async (profileUpdates: Partial<AIUserProfile>) => {
    if (!profile) return;
    
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedProfile = { ...profile, ...profileUpdates };
      setProfile(updatedProfile);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
      console.error("Profile update error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [profile, toast]);

  // Clear current conversation messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    
    if (profile && currentConversation) {
      const updatedProfile = { ...profile };
      const conversationIndex = updatedProfile.conversations.findIndex(
        c => c.id === currentConversation
      );
      
      if (conversationIndex !== -1) {
        updatedProfile.conversations[conversationIndex].messages = [];
        updatedProfile.conversations[conversationIndex].updatedAt = new Date();
        setProfile(updatedProfile);
      }
    }
  }, [profile, currentConversation]);

  const value = {
    isProcessing,
    profile,
    currentConversation,
    setCurrentConversation,
    sendMessage,
    generateRecommendations,
    setGoal,
    updateGoal,
    deleteGoal,
    recommendedResources,
    updateUserProfile,
    messages,
    clearMessages
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
};
