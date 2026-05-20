
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { EventType } from "@/context/ResourcesContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface EventCardProps {
  event: EventType;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { toast } = useToast();
  const { title, description, type, isPro, date, time, color } = event;

  const getEventColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return {
          bg: "bg-leap-purple/10 dark:bg-leap-purple/20",
          text: "text-leap-purple",
          badge: {
            bg: "bg-blue-50 dark:bg-blue-900/50",
            text: "text-blue-700 dark:text-blue-300",
            border: "border-blue-200 dark:border-blue-800"
          }
        };
      case "purple":
        return {
          bg: "bg-leap-teal/10 dark:bg-leap-teal/20",
          text: "text-leap-teal",
          badge: {
            bg: "bg-purple-50 dark:bg-purple-900/50",
            text: "text-purple-700 dark:text-purple-300",
            border: "border-purple-200 dark:border-purple-800"
          }
        };
      case "green":
        return {
          bg: "bg-green-100 dark:bg-green-900/20",
          text: "text-green-600 dark:text-green-400",
          badge: {
            bg: "bg-green-50 dark:bg-green-900/50",
            text: "text-green-700 dark:text-green-300",
            border: "border-green-200 dark:border-green-800"
          }
        };
      default:
        return {
          bg: "bg-leap-purple/10 dark:bg-leap-purple/20",
          text: "text-leap-purple",
          badge: {
            bg: "bg-blue-50 dark:bg-blue-900/50",
            text: "text-blue-700 dark:text-blue-300",
            border: "border-blue-200 dark:border-blue-800"
          }
        };
    }
  };

  const colorClasses = getEventColorClasses(color);
  
  const handleRegisterClick = () => {
    if (isPro) {
      toast({
        title: "Pro Event Registration",
        description: "This is a premium event. Please upgrade to Pro to register.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registration Successful",
        description: `You have successfully registered for "${title}".`,
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className={cn("p-3 rounded-lg h-fit", colorClasses.bg)}>
            <Calendar className={cn("h-5 w-5", colorClasses.text)} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge 
                variant="outline" 
                className={cn(
                  colorClasses.badge.bg, 
                  colorClasses.badge.text,
                  colorClasses.badge.border
                )}
              >
                {type}
              </Badge>
              {isPro ? (
                <Badge 
                  variant="outline" 
                  className="bg-amber-50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                >
                  Pro
                </Badge>
              ) : (
                <Badge 
                  variant="outline" 
                  className="bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                >
                  Free
                </Badge>
              )}
            </div>
            <h3 className="font-bold text-lg mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {date}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {time}
              </div>
            </div>
            <Button 
              size="sm" 
              className={isPro ? "bg-leap-purple hover:bg-opacity-90" : ""}
              onClick={handleRegisterClick}
            >
              Register Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
