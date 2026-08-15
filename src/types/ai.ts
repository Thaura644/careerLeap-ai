
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RecommendedResource {
  id: string;
  title: string;
  source: 'course' | 'workshop' | 'guide' | 'webinar' | 'podcast' | 'ebook' | 'article' | 'other';
  url: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  thumbnail?: string;
  relevanceScore: number;
  /** Human-readable "why this item" reasons from the scoring engine. */
  reasons?: string[];
}

export interface CareerGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillAssessment {
  id: string;
  name: string;
  currentLevel: number;
  targetLevel: number;
  recommendations: string[];
  lastUpdated: Date;
}

export interface AIUserProfile {
  id: string;
  userId: string;
  // Career profile — drives the roadmap engine.
  currentRole?: string;
  targetRole?: string;
  timeframe?: string;
  industry?: string;
  yearsExperience?: string;
  interests: string[];
  goals: CareerGoal[];
  skillAssessments: SkillAssessment[];
  conversations: AIConversation[];
  learningHistory: {
    resourceId: string;
    startedAt: Date;
    completedAt?: Date;
    progress: number;
  }[];
  recommendedResources: RecommendedResource[];
}
