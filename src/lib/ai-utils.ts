
import { v4 as uuidv4 } from 'uuid';
import { AIMessage, RecommendedResource, CareerGoal } from '@/types/ai';

// Generate a unique ID
export const uuid = () => {
  return uuidv4();
};

// Mock AI response generation - in a real app this would call an API
export const generateAIResponse = async (prompt: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Common responses based on input patterns
  if (prompt.toLowerCase().includes('hello') || prompt.toLowerCase().includes('hi')) {
    return "Hello! I'm your AI career assistant. How can I help you today?";
  }

  if (prompt.toLowerCase().includes('goal')) {
    return "Setting career goals is important for professional growth. What specific goals are you thinking about? I can help you create a structured plan.";
  }

  if (prompt.toLowerCase().includes('recommend') || prompt.toLowerCase().includes('resource')) {
    return "I can recommend resources based on your career goals and skills. Are you looking for technical content or leadership resources? I can provide tailored recommendations in either area.";
  }

  if (prompt.toLowerCase().includes('skill')) {
    return "Skills development is crucial for career advancement. Based on your profile, I suggest focusing on system design and advanced JavaScript patterns. Would you like me to recommend specific learning resources?";
  }

  if (prompt.toLowerCase().includes('interview') || prompt.toLowerCase().includes('job')) {
    return "Job interviews can be challenging. To prepare well, research the company thoroughly, practice common questions, and prepare examples of your past work. Would you like me to suggest some interview preparation resources?";
  }

  // Default response
  return "I understand you're interested in advancing your career. Based on your profile, I suggest focusing on both technical skills and soft skills like communication and leadership. Would you like more specific recommendations?";
};

// Generate resource recommendations based on interests
export const generateResourceRecommendations = (
  interests: string[], 
  skillLevels: Record<string, number>
): RecommendedResource[] => {
  // This would typically be an API call to a recommendation engine
  // Here we'll just generate mock data
  
  const resources: RecommendedResource[] = [
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
  
  return resources.sort((a, b) => b.relevanceScore - a.relevanceScore);
};

// Generate career goals based on user interests and experience
export const generateCareerGoals = (
  role: string,
  interests: string[],
  experience: number
): CareerGoal[] => {
  // This would typically integrate with an LLM API
  // Here we'll generate mock data
  
  const now = new Date();
  const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const threeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const sixMonths = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
  
  return [
    {
      id: uuid(),
      title: `Master Advanced ${role} Skills`,
      description: `Enhance your skills in ${interests[0]} through practical projects and courses`,
      targetDate: threeMonths,
      status: "in-progress",
      progress: 35,
      priority: "high",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: uuid(),
      title: "Complete System Design Fundamentals",
      description: "Learn scalable architecture patterns through online courses and projects",
      targetDate: oneMonth,
      status: "not-started",
      progress: 0,
      priority: "medium",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: uuid(),
      title: "Develop Leadership Skills",
      description: "Take on a mentoring role and lead a small project team",
      targetDate: sixMonths,
      status: "not-started",
      progress: 0,
      priority: "low",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
};

// Process conversation history for context
export const processConversationHistory = (messages: AIMessage[]): string => {
  if (messages.length === 0) return "";
  
  // Extract key themes from conversation history
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
  const combinedContent = userMessages.join(" ");
  
  const themes = [];
  if (combinedContent.toLowerCase().includes('system design')) themes.push('system design');
  if (combinedContent.toLowerCase().includes('react')) themes.push('React development');
  if (combinedContent.toLowerCase().includes('career') || 
      combinedContent.toLowerCase().includes('job')) themes.push('career advancement');
  
  return themes.length > 0 
    ? `Based on our conversation about ${themes.join(', ')}, `
    : "";
};
