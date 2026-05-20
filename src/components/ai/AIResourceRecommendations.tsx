
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, RefreshCw, ExternalLink, Youtube, BookOpen, Layers, Clock } from "lucide-react";
import { useAI } from "@/context/AIContext";
import { RecommendedResource } from "@/types/ai";
import { cn } from "@/lib/utils";

interface AIResourceRecommendationsProps {
  className?: string;
  maxItems?: number;
  showTabs?: boolean;
  showHeader?: boolean;
  compact?: boolean;
}

export const AIResourceRecommendations: React.FC<AIResourceRecommendationsProps> = ({
  className,
  maxItems = 4,
  showTabs = true,
  showHeader = true,
  compact = false
}) => {
  const { recommendedResources, generateRecommendations, isProcessing } = useAI();
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const getSourceIcon = (source: RecommendedResource["source"]) => {
    switch (source) {
      case "youtube":
        return <Youtube className="h-4 w-4 text-red-500" />;
      case "coursera":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "udemy":
        return <Layers className="h-4 w-4 text-purple-500" />;
      case "datacamp":
        return <Layers className="h-4 w-4 text-green-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getDifficultyColor = (difficulty: RecommendedResource["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-500 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900";
      case "intermediate":
        return "text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-900";
      case "advanced":
        return "text-rose-500 border-rose-200 bg-rose-50 dark:bg-rose-950 dark:border-rose-900";
    }
  };
  
  const filteredResources = activeTab === "all" 
    ? recommendedResources 
    : recommendedResources.filter(r => r.source === activeTab);
  
  const displayedResources = filteredResources.slice(0, maxItems);
  
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className={cn(compact ? "p-3" : "")}>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className={cn(compact ? "text-lg" : "")}>Learning Resources</CardTitle>
              <CardDescription>AI-recommended content for your goals</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateRecommendations}
              disabled={isProcessing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={cn("h-3 w-3", isProcessing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      )}
      
      <CardContent className={cn("px-0", compact ? "pt-0" : "")}>
        {showTabs && (
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="px-6"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
              <TabsTrigger value="coursera">Coursera</TabsTrigger>
              <TabsTrigger value="udemy">Udemy</TabsTrigger>
              <TabsTrigger value="datacamp">DataCamp</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
        <ScrollArea className={cn(!compact && "pl-6 pr-4", "pb-2")} type="always">
          <div className={cn("space-y-3", compact ? "px-3" : "")}>
            {displayedResources.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No resources found. Try refreshing or changing filters.
                </p>
              </div>
            ) : (
              displayedResources.map((resource) => (
                <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex">
                    {resource.thumbnail ? (
                      <div className="w-24 h-24 flex-shrink-0">
                        <img 
                          src={resource.thumbnail} 
                          alt={resource.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 flex-shrink-0 bg-muted flex items-center justify-center">
                        {getSourceIcon(resource.source)}
                      </div>
                    )}
                    
                    <div className="flex-1 p-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-sm line-clamp-2">{resource.title}</h3>
                        <Badge variant="outline" className="ml-2">
                          {resource.source.charAt(0).toUpperCase() + resource.source.slice(1)}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {resource.description}
                      </p>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{resource.estimatedTime}</span>
                        </div>
                        
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getDifficultyColor(resource.difficulty))}
                        >
                          {resource.difficulty.charAt(0).toUpperCase() + resource.difficulty.slice(1)}
                        </Badge>
                      </div>
                      
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-xs text-leap-purple px-0 mt-1 flex items-center"
                        asChild
                      >
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          View Resource <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className={cn(compact ? "p-3" : "")}>
        <Button variant="link" className="text-leap-purple ml-auto flex items-center">
          View all resources <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};
