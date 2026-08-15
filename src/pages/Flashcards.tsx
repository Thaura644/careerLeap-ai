import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Check,
  Clock,
  Loader2,
  RotateCcw,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Flashcard = {
  id: number;
  front: string;
  back: string;
  topic: string;
  box: number;
  intervalDays: number;
  easeFactor: number;
  dueAt: string;
  due: boolean;
  reviewCount: number;
  lapses: number;
};

type DeckStats = {
  total: number;
  due: number;
  learned: number;
};

const Flashcards = () => {
  const { toast } = useToast();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [stats, setStats] = useState<DeckStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const loadDeck = () => {
    apiGet<{ cards: Flashcard[]; stats: DeckStats }>("/flashcards")
      .then((d) => {
        setCards(d.cards);
        setStats(d.stats);
        setIndex(0);
        setFlipped(false);
      })
      .catch(() => {
        toast({ title: "Could not load your deck", description: "Try again in a moment.", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDeck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await apiPost<{ generated: number; source: string }>("/flashcards/generate", {});
      toast({
        title: "Deck generated",
        description: `${res.generated} cards from your roadmap${
          res.source === "llm" ? " (AI-written)" : ""
        }. They're due now — start reviewing.`,
      });
      loadDeck();
    } catch {
      toast({ title: "Could not generate the deck", description: "The server may be waking up. Try again.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleRate = async (rating: number) => {
    const card = cards[index];
    if (!card || reviewing) return;
    setReviewing(true);
    try {
      await apiPost(`/flashcards/${card.id}/review`, { rating });
      const next = cards.filter((_, i) => i !== index);
      setCards(next);
      setFlipped(false);
      if (index >= next.length) setIndex(Math.max(0, next.length - 1));
      setStats((prev) => (prev ? { ...prev, due: Math.max(0, prev.due - 1) } : prev));
    } catch {
      toast({ title: "Could not save your review", description: "Try again.", variant: "destructive" });
    } finally {
      setReviewing(false);
    }
  };

  const dueCards = cards.filter((c) => c.due);
  const current = cards[index];
  const sessionProgress = stats?.due ? Math.round(((stats.due - dueCards.length) / stats.due) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Flashcards</h1>
            <p className="text-muted-foreground">
              Spaced-repetition cards generated from your roadmap and skills.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-leap-purple" />
            )}
            {stats?.total ? "Regenerate deck" : "Generate my deck"}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading your deck…
          </div>
        ) : stats && stats.total === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-leap-purple/10 text-leap-purple">
                <Brain className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold mb-2">No cards yet</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Generate a deck from your roadmap and assessed skills. Every card is real
                content from your plan — questions you'll need to answer from memory on the
                way to your target role.
              </p>
              <Button className="bg-leap-purple hover:bg-leap-purple/90" onClick={handleGenerate} disabled={generating}>
                {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate my deck
              </Button>
            </CardContent>
          </Card>
        ) : dueCards.length === 0 && cards.length > 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300">
                <Check className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold mb-2">All caught up</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                No cards due right now. {stats?.learned ?? 0} of {stats?.total ?? 0} cards are
                in long-term rotation. Come back later — spaced repetition works best when you
                trust the schedule.
              </p>
            </CardContent>
          </Card>
        ) : current ? (
          <>
            {/* Session progress */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>
                  {dueCards.length} card{dueCards.length === 1 ? "" : "s"} left this session
                </span>
                <span>{Math.round(((stats?.due ?? 0) - dueCards.length) / (stats?.due ?? 1) * 100)}% done</span>
              </div>
              <Progress value={sessionProgress} className="h-1.5" />
            </div>

            <div className="flex justify-center mb-4">
              <Badge variant="outline" className="text-xs">
                {current.topic || "General"}
              </Badge>
            </div>

            {/* The card */}
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="block w-full text-left"
              aria-label={flipped ? "Show question" : "Show answer"}
            >
              <div className={cn(
                "min-h-[280px] w-full rounded-2xl border p-8 transition-all duration-300 cursor-pointer",
                flipped
                  ? "border-leap-purple bg-leap-purple/5 shadow-lg"
                  : "border bg-card hover:border-leap-purple/50 hover:shadow-md"
              )}>
                {flipped ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-leap-purple mb-3">
                      Answer
                    </p>
                    <p className="text-lg leading-relaxed whitespace-pre-wrap">{current.back}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[216px] text-center">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-4">
                      Question — tap to reveal
                    </p>
                    <p className="text-xl font-medium">{current.front}</p>
                  </div>
                )}
              </div>
            </button>

            {/* Rating controls */}
            {flipped ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-3 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950 dark:border-red-900"
                  onClick={() => handleRate(0)}
                  disabled={reviewing}
                >
                  <X className="h-4 w-4" />
                  <span className="text-xs font-medium">Again</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-3 text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950 dark:border-amber-900"
                  onClick={() => handleRate(1)}
                  disabled={reviewing}
                >
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium">Hard</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-3 text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950 dark:border-green-900"
                  onClick={() => handleRate(2)}
                  disabled={reviewing}
                >
                  <Check className="h-4 w-4" />
                  <span className="text-xs font-medium">Good</span>
                </Button>
                <Button
                  className="flex flex-col items-center gap-1 h-auto py-3 bg-leap-purple hover:bg-leap-purple/90"
                  onClick={() => handleRate(3)}
                  disabled={reviewing}
                >
                  <Zap className="h-4 w-4" />
                  <span className="text-xs font-medium">Easy</span>
                </Button>
              </div>
            ) : (
              <div className="mt-6 flex justify-center">
                <Button variant="ghost" onClick={() => setFlipped(true)} className="text-leap-purple">
                  <RotateCcw className="mr-2 h-4 w-4" /> Show answer
                </Button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default Flashcards;
