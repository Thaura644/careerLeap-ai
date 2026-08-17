
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Bookmark, 
  Lock,
  FileText,
  Globe,
  Play,
  Star,
  ExternalLink,
  UserRound
} from "lucide-react";
import { Link } from "react-router-dom";
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
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 bg-muted/50"
          >
            {getTypeIcon(type)}
            {type}
          </Badge>
          {resource.domain && resource.domain !== "General" && (
            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
              {resource.domain}
            </Badge>
          )}
          <div className="flex items-center gap-2">
            {resource.source === "open" && (
              <Badge variant="outline" className="text-[10px] text-green-600 dark:text-green-400 border-green-300 dark:border-green-800">
                <Globe className="h-3 w-3 mr-0.5" /> Open source
              </Badge>
            )}
            {resource.source === "creator" && (
              <Badge variant="outline" className="text-[10px] text-leap-purple border-leap-purple/40">
                <UserRound className="h-3 w-3 mr-0.5" /> Creator
              </Badge>
            )}
            <div className="flex items-center text-sm">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span>{rating}</span>
              <span className="text-muted-foreground ml-1">({reviews})</span>
            </div>
          </div>
        </div>
        <CardTitle className="text-lg mt-2">{title}</CardTitle>
        {resource.createdByName && (
          <CardDescription className="text-xs">by {resource.createdByName}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          <span>{duration}</span>
        </div>
      </CardContent>
      <CardFooter>
        {isPro ? (
          <Link to="/upgrade" className="w-full">
            <Button className="w-full bg-leap-purple hover:bg-opacity-90 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Unlock with Pro
            </Button>
          </Link>
        ) : resource.url ? (
          // The resource engine cataloged a real destination — open it.
          <Button
            className="w-full"
            variant={isCompleted ? "outline" : "default"}
            asChild
          >
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              {isCompleted ? "Completed — open again" : "Open resource"}
            </a>
          </Button>
        ) : (
          // No fabricated "Start Learning": the linked content pages aren't
          // built yet, so the card says so instead of sending users nowhere.
          <Button
            className="w-full"
            variant={isCompleted ? "outline" : "default"}
            disabled
            title="Learning content for this entry is being added to the library"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {isCompleted ? "Completed" : "Content coming soon"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
