
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  ArrowUpRight, 
  Bookmark, 
  Lock,
  FileText,
  Globe,
  Play,
  Star
} from "lucide-react";
import { ResourceType } from "@/context/ResourcesContext";
import { useResources } from "@/context/ResourcesContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ResourceCardProps {
  resource: ResourceType;
}

const hashCode = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const { toggleBookmark } = useResources();
  const { toast } = useToast();
  
  const {
    id,
    title,
    type,
    rating,
    reviews,
    duration,
    isPro,
    isBookmarked,
    isCompleted = false,
  } = resource;
  
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleBookmark(id);
    
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: `"${title}" has been ${isBookmarked ? "removed from" : "added to"} your bookmarks.`,
      duration: 3000,
    });
  };
  
  const handleResourceClick = (e: React.MouseEvent) => {
    if (isPro) {
      e.preventDefault();
      toast({
        title: "Pro Content Locked",
        description: "Upgrade to Pro to access this resource.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Course":
        return <BookOpen className="h-4 w-4" />;
      case "Workshop":
        return <Calendar className="h-4 w-4" />;
      case "Guide":
        return <FileText className="h-4 w-4" />;
      case "Webinar":
        return <Play className="h-4 w-4" />;
      case "Podcast":
        return <Play className="h-4 w-4" />;
      case "eBook":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  // Deterministic gradient per title — no placeholder assets, ever.
  // Literal class strings so Tailwind's JIT can see them.
  const GRADIENTS = [
    "from-cyan-500 to-indigo-700",
    "from-violet-500 to-purple-700",
    "from-rose-500 to-orange-600",
    "from-amber-500 to-teal-700",
    "from-emerald-500 to-sky-700",
    "from-blue-500 to-fuchsia-700",
  ];
  const gradientClass = GRADIENTS[Math.abs(hashCode(title)) % GRADIENTS.length];

  return (
    <Card className={cn(
      "overflow-hidden hover:shadow-md transition-shadow", 
      isCompleted ? "border-green-300 dark:border-green-800" : ""
    )}>
      <div className={`relative h-40 bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
        <span className="text-5xl font-bold text-white/90 drop-shadow">
          {title.trim().charAt(0).toUpperCase()}
        </span>
        {isPro && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-leap-purple text-white border-none">PRO</Badge>
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-0 left-0 w-full h-full bg-black/30 flex items-center justify-center">
            <Badge className="bg-green-500 text-white border-none px-3 py-1">COMPLETED</Badge>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "absolute top-2 left-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background",
            isBookmarked ? "text-yellow-500" : ""
          )}
          onClick={handleBookmarkClick}
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 bg-muted/50"
          >
            {getTypeIcon(type)}
            {type}
          </Badge>
          <div className="flex items-center text-sm">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span>{rating}</span>
            <span className="text-muted-foreground ml-1">({reviews})</span>
          </div>
        </div>
        <CardTitle className="text-lg mt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          <span>{duration}</span>
        </div>
      </CardContent>
      <CardFooter>
        <a 
          href={isPro ? "/upgrade" : "#"} 
          className="w-full"
          onClick={handleResourceClick}
        >
          {isPro ? (
            <Button className="w-full bg-leap-purple hover:bg-opacity-90 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Unlock with Pro
            </Button>
          ) : (
            <Button className="w-full flex items-center gap-2" variant={isCompleted ? "outline" : "default"}>
              {isCompleted ? "View Again" : "Start Learning"}
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          )}
        </a>
      </CardFooter>
    </Card>
  );
};
