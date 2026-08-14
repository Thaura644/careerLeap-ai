import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { AIUserProfile, AIMessage, RecommendedResource, CareerGoal, AIConversation } from "@/types/ai";
import { uuid } from "@/lib/ai-utils";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

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
  refreshProfile: () => Promise<void>;
}

// --- Backend DTO shapes ----------------------------------------------------

interface RawUser {
  id: number;
  fullName: string;
  email: string;
  plan: string;
  currentRole?: string | null;
  targetRole?: string | null;
  timeframe?: string | null;
  industry?: string | null;
  yearsExperience?: string | null;
}

interface RawGoal {
  id: number;
  title: string;
  description: string;
  targetDate: string;
  status: string;
  progress: number;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface RawConversation {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface RawMessage {
  id: string;
  role: string;
  content: string;
  timestamp: string;
}

interface RawRecommended {
  id: string;
  title: string;
  source: string;
  url: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  relevanceScore: number;
}

// --- Mappers ---------------------------------------------------------------

const mapGoal = (g: RawGoal): CareerGoal => ({
  id: String(g.id),
  title: g.title,
  description: g.description || "",
  targetDate: new Date(g.targetDate),
  status: (g.status as CareerGoal["status"]) || "not-started",
  progress: g.progress,
  priority: (g.priority as CareerGoal["priority"]) || "medium",
  createdAt: new Date(g.createdAt),
  updatedAt: new Date(g.updatedAt),
});

const mapRecommended = (r: RawRecommended): RecommendedResource => ({
  id: r.id,
  title: r.title,
  source: (r.source as RecommendedResource["source"]) || "other",
  url: r.url,
  description: r.description,
  difficulty: (r.difficulty as RecommendedResource["difficulty"]) || "intermediate",
  estimatedTime: r.estimatedTime,
  relevanceScore: r.relevanceScore,
});

export const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [profile, setProfile] = useState<AIUserProfile | null>(null);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [recommendedResources, setRecommendedResources] = useState<RecommendedResource[]>([]);
  const [messages, setMessages] = useState<AIMessage[]>([]);

  // Load the real profile: the authenticated user, their persisted goals, and
  // their persisted conversations. Nothing is invented when the account is new.
  const refreshProfile = useCallback(async () => {
    // Not logged in? Skip the protected calls entirely (they'd just 401).
    if (!localStorage.getItem("leap_token")) {
      setProfile(null);
      setMessages([]);
      setCurrentConversation(null);
      return;
    }
    try {
      const [me, rawGoals, rawConversations] = await Promise.all([
        apiGet<{ user: RawUser }>("/auth/me"),
        apiGet<RawGoal[]>("/goals"),
        apiGet<RawConversation[]>("/ai/conversations"),
      ]);

      const goals = (rawGoals || []).map(mapGoal);
      const conversations: AIConversation[] = (rawConversations || []).map((c) => ({
        id: String(c.id),
        title: c.title,
        messages: [],
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      }));

      setProfile({
        id: String(me.user.id),
        userId: String(me.user.id),
        currentRole: me.user.currentRole || undefined,
        targetRole: me.user.targetRole || undefined,
        timeframe: me.user.timeframe || undefined,
        industry: me.user.industry || undefined,
        yearsExperience: me.user.yearsExperience || undefined,
        interests: [],
        goals,
        skillAssessments: [],
        conversations,
        learningHistory: [],
        recommendedResources: [],
      });

      // Keep the active conversation in sync with the server's list.
      const active = currentConversation
        ? conversations.find((c) => c.id === currentConversation) ?? conversations[0] ?? null
        : conversations[0] ?? null;
      setCurrentConversation(active ? active.id : null);

      if (active) {
        const detail = await apiGet<{ messages: RawMessage[] }>(`/ai/conversations/${active.id}`);
        setMessages(
          (detail.messages || []).map((m) => ({
            id: m.id,
            role: m.role as AIMessage["role"],
            content: m.content,
            timestamp: new Date(m.timestamp),
          }))
        );
      } else {
        setMessages([]);
      }
    } catch {
      setProfile(null);
      setMessages([]);
    }
  }, [currentConversation]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isProcessing) return;

      // Ensure a conversation exists to persist into.
      let conversationId = currentConversation;
      if (!conversationId) {
        const created = await apiPost<{ id: number }>("/ai/conversations", {});
        conversationId = String(created.id);
        setCurrentConversation(conversationId);
        await refreshProfile();
      }

      setIsProcessing(true);
      const userMessage: AIMessage = { id: uuid(), role: "user", content, timestamp: new Date() };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const res = await apiPost<{ response: string; source: string }>("/ai/chat", {
          prompt: content,
          conversationId: Number(conversationId),
        });
        setMessages((prev) => [
          ...prev,
          { id: uuid(), role: "assistant", content: res.response, timestamp: new Date() },
        ]);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to get a response. Please try again.",
          variant: "destructive",
        });
        console.error("AI processing error:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [currentConversation, isProcessing, refreshProfile, toast]
  );

  // Real recommendations from the backend (scored against the user's profile).
  const generateRecommendations = useCallback(async () => {
    setIsProcessing(true);
    try {
      const res = await apiPost<{ recommendations: RawRecommended[] }>("/insights/recommendations", {});
      const mapped = (res.recommendations || []).map(mapRecommended);
      setRecommendedResources(mapped);
      setProfile((prev) => (prev ? { ...prev, recommendedResources: mapped } : prev));
      toast({
        title: "Success",
        description: "New learning resources have been recommended for you.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
      console.error("Recommendation generation error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const applyGoals = useCallback(
    (goals: CareerGoal[]) => {
      setProfile((prev) => (prev ? { ...prev, goals } : prev));
    },
    []
  );

  // Add or update a career goal — persisted server-side.
  const setGoal = useCallback(
    async (goal: Partial<CareerGoal>) => {
      setIsProcessing(true);
      try {
        const created = await apiPost<RawGoal>("/goals", {
          title: goal.title || "New Goal",
          description: goal.description || "",
          targetDate: (goal.targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).toISOString(),
          status: goal.status || "not-started",
          progress: goal.progress || 0,
          priority: goal.priority || "medium",
        });
        applyGoals([...(profile?.goals || []), mapGoal(created)]);
        toast({
          title: "Goal Created",
          description: `Your new goal "${created.title}" has been created.`,
        });
      } catch (error) {
        toast({ title: "Error", description: "Failed to create goal. Please try again.", variant: "destructive" });
        console.error("Goal creation error:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [profile, applyGoals, toast]
  );

  const updateGoal = useCallback(
    async (id: string, goalUpdates: Partial<CareerGoal>) => {
      setIsProcessing(true);
      try {
        const updated = await apiPut<RawGoal>(`/goals/${id}`, {
          title: goalUpdates.title,
          description: goalUpdates.description,
          targetDate: goalUpdates.targetDate ? goalUpdates.targetDate.toISOString() : undefined,
          status: goalUpdates.status,
          progress: goalUpdates.progress,
          priority: goalUpdates.priority,
        });
        applyGoals((profile?.goals || []).map((g) => (g.id === id ? mapGoal(updated) : g)));
        toast({
          title: "Goal Updated",
          description: `Your goal "${updated.title}" has been updated.`,
        });
      } catch (error) {
        toast({ title: "Error", description: "Failed to update goal. Please try again.", variant: "destructive" });
        console.error("Goal update error:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [profile, applyGoals, toast]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      setIsProcessing(true);
      try {
        await apiDelete(`/goals/${id}`);
        applyGoals((profile?.goals || []).filter((g) => g.id !== id));
        toast({ title: "Goal Deleted", description: "Your goal has been deleted." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete goal. Please try again.", variant: "destructive" });
        console.error("Goal deletion error:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [profile, applyGoals, toast]
  );

  // Save career profile fields to the backend (used by onboarding).
  const updateUserProfile = useCallback(
    async (updates: Partial<AIUserProfile>) => {
      setIsProcessing(true);
      try {
        const payload: Record<string, unknown> = {};
        if (updates.interests) payload.interests = updates.interests.join(", ");
        await apiPut("/auth/profile", payload);
        setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
        toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to update profile. Please try again.", variant: "destructive" });
        console.error("Profile update error:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [toast]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value: AIContextType = {
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
    clearMessages,
    refreshProfile,
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
