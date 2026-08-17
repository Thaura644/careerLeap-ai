import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Brain, BookOpen, Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PracticeProgress {
  total?: number;
  solved?: number;
}

interface FlashcardStats {
  stats?: { total: number; due: number; learned: number };
}

/** The actual learning features, presented as launch cards with real counts —
 *  practice problems solved, flashcards due, and the library. This is what the
 *  dashboard should lead with: things you can do, not placeholder widgets. */
export const LearningTools: React.FC = () => {
  const [practice, setPractice] = useState<PracticeProgress | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardStats["stats"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiGet<PracticeProgress>("/practice/progress").catch(() => null),
      apiGet<FlashcardStats>("/flashcards").catch(() => null),
    ]).then(([p, f]) => {
      if (cancelled) return;
      setPractice(p);
      setFlashcards(f?.stats || null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const tools = [
    {
      to: "/practice",
      icon: Code2,
      accent: "bg-blue-500/10 text-blue-500",
      title: "Practice",
      description: "Real coding problems judged against hidden test cases.",
      stat: loading ? null : practice ? `${practice.solved ?? 0}/${practice.total ?? 0} solved` : "Solved counts live here",
      cta: practice && (practice.total ?? 0) > 0 ? "Keep solving" : "Start practicing",
    },
    {
      to: "/flashcards",
      icon: Brain,
      accent: "bg-amber-500/10 text-amber-500",
      title: "Flashcards",
      description: "Spaced-repetition cards generated from your roadmap.",
      stat: loading ? null : flashcards ? `${flashcards.due ?? 0} due today · ${flashcards.total ?? 0} in deck` : "Deck stats live here",
      cta: flashcards && (flashcards.due ?? 0) > 0 ? "Review now" : "Generate my deck",
    },
    {
      to: "/resources",
      icon: BookOpen,
      accent: "bg-leap-purple/10 text-leap-purple",
      title: "Resources",
      description: "Courses, guides, podcasts — matched to your profile.",
      stat: loading ? null : "The learning library",
      cta: "Explore the library",
    },
  ];

  return (
    <div className="mb-8">
      <div className="mb-3">
        <h2 className="text-lg font-semibold">Continue learning</h2>
        <p className="text-sm text-muted-foreground">Your real tools — pick up where you left off.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link key={tool.title} to={tool.to} className="group">
            <Card className="h-full transition-all hover:border-leap-purple/60 hover:shadow-md">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", tool.accent)}>
                    <tool.icon className="h-5 w-5" />
                  </div>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground">{tool.stat}</span>
                  )}
                </div>
                <h3 className="font-semibold mb-1">{tool.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{tool.description}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-leap-purple px-0 w-fit group-hover:gap-1.5 transition-all flex items-center"
                >
                  {tool.cta} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
