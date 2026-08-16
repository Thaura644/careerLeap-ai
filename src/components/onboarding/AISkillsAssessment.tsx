import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, CheckCheck, Loader2, X, Sparkles } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface AssessedSkill {
  name: string;
  level: number;
}

export interface ResumeSkill {
  name: string;
  category: string;
  inCatalog?: boolean;
}

interface CatalogSkill {
  id?: number;
  name: string;
  category: string;
  usageCount?: number;
}

interface AISkillsAssessmentProps {
  onComplete: (skills: AssessedSkill[]) => void;
  /** Skills the AI found in the user's resume (from the Resume step). */
  resumeSkills?: ResumeSkill[];
  className?: string;
}

const getLevelLabel = (level: number) => {
  if (level < 20) return "Beginner";
  if (level < 40) return "Basic";
  if (level < 60) return "Intermediate";
  if (level < 80) return "Advanced";
  return "Expert";
};

const getLevelHint = (level: number) => {
  if (level < 20) return "Familiar with basic concepts";
  if (level < 40) return "Can work with guidance";
  if (level < 60) return "Can work independently";
  if (level < 80) return "Can teach others";
  return "Expert level knowledge";
};

const getProgressColor = (level: number) => {
  if (level < 20) return "bg-red-500";
  if (level < 40) return "bg-orange-500";
  if (level < 60) return "bg-yellow-500";
  if (level < 80) return "bg-green-500";
  return "bg-emerald-500";
};

export const AISkillsAssessment: React.FC<AISkillsAssessmentProps> = ({
  onComplete,
  resumeSkills = [],
  className,
}) => {
  const [skills, setSkills] = useState<AssessedSkill[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CatalogSkill[]>([]);
  const [searching, setSearching] = useState(false);
  const [popular, setPopular] = useState<CatalogSkill[]>([]);
  const [createError, setCreateError] = useState("");

  const hasSkill = (name: string) =>
    skills.some((s) => s.name.toLowerCase() === name.toLowerCase());

  const addSkill = (name: string, level = 50) => {
    if (hasSkill(name)) return;
    setSkills((prev) => [...prev, { name: name.trim(), level }]);
  };

  const removeSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const setLevel = (index: number, level: number) => {
    setSkills((prev) => prev.map((s, i) => (i === index ? { ...s, level } : s)));
  };

  // Popular catalog skills on mount.
  useEffect(() => {
    apiGet<CatalogSkill[]>("/skills?limit=20")
      .then((list) => setPopular(Array.isArray(list) ? list : []))
      .catch(() => setPopular([]));
  }, []);

  // Debounced catalog search as the user types.
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      apiGet<CatalogSkill[]>(`/skills?q=${encodeURIComponent(searchQuery.trim())}&limit=6`)
        .then((list) => setSearchResults(Array.isArray(list) ? list : []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const exactMatch = searchResults.find(
    (r) => r.name.toLowerCase() === searchQuery.trim().toLowerCase()
  );

  const handleAddFromSearch = (skill: CatalogSkill) => {
    addSkill(skill.name);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleCreateCustom = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreateError("");
    try {
      await apiPost<{ ok: boolean; skill: CatalogSkill }>("/skills", {
        name: trimmed,
        category: "Other",
      });
      addSkill(trimmed);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not add that skill.");
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    if (exactMatch) {
      handleAddFromSearch(exactMatch);
    } else {
      handleCreateCustom(q);
    }
  };

  const addAllResume = () => {
    resumeSkills.forEach((s) => addSkill(s.name));
  };

  const canComplete = skills.length >= 1;

  return (
    <div className={className}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Assess Your Skills</h1>
        <p className="text-muted-foreground">
          Select from the skill library, add your own, or use what your resume showed — then
          rate them honestly to shape your roadmap.
        </p>
      </div>

      <Card className="p-6">
        {/* From your resume */}
        {resumeSkills.length > 0 && (
          <div className="mb-6 rounded-md border border-leap-purple/20 bg-leap-purple/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-leap-purple" />
                From your resume — add the ones you actually have
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={addAllResume}
              >
                Add all
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {resumeSkills.map((s) => {
                const added = hasSkill(s.name);
                return (
                  <Badge
                    key={s.name}
                    variant={added ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer select-none",
                      !added && "hover:border-leap-purple hover:text-leap-purple"
                    )}
                    onClick={() => !added && addSkill(s.name)}
                  >
                    {s.name}
                    <span className="ml-1.5 text-[10px] text-muted-foreground">{s.category}</span>
                    {added ? " ✓" : " +"}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Search / create */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Your Skills</h2>
          <p className="text-sm text-muted-foreground -mt-2 mb-4">
            Search the library or type a new one and press Enter to create it. Rate each skill
            honestly — this shapes your roadmap's focus areas.
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search the skill library or create one…"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => handleCreateCustom(searchQuery)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-leap-purple p-1.5 text-white hover:opacity-90"
                aria-label={`Create skill ${searchQuery}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            )}

            {(searching || searchResults.length > 0 || (searchQuery.trim() && !exactMatch)) && (
              <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-md max-h-64 overflow-auto">
                {searching && (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
                  </div>
                )}
                {searchResults.map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center justify-between px-3 py-2 hover:bg-muted cursor-pointer"
                    onClick={() => handleAddFromSearch(r)}
                  >
                    <span className="text-sm">{r.name}</span>
                    <span className="text-[11px] text-muted-foreground">{r.category}</span>
                  </div>
                ))}
                {searchQuery.trim() && !exactMatch && (
                  <div
                    className="flex items-center justify-between px-3 py-2 hover:bg-muted cursor-pointer border-t"
                    onClick={() => handleCreateCustom(searchQuery)}
                  >
                    <span className="text-sm text-leap-purple">
                      Create &quot;{searchQuery.trim()}&quot;
                    </span>
                    <Plus className="h-3.5 w-3.5 text-leap-purple" />
                  </div>
                )}
              </div>
            )}
          </div>
          {createError && <p className="mt-2 text-xs text-red-600">{createError}</p>}
        </div>

        {/* Popular catalog */}
        {popular.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Popular skills — click to add
            </p>
            <div className="flex flex-wrap gap-1.5">
              {popular.map((s) => {
                const added = hasSkill(s.name);
                return (
                  <Badge
                    key={s.name}
                    variant={added ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer select-none",
                      !added && "hover:border-leap-purple hover:text-leap-purple"
                    )}
                    onClick={() => !added && addSkill(s.name)}
                  >
                    {s.name}
                    {added ? " ✓" : " +"}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Rated skills */}
        <div className="space-y-4">
          {skills.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No skills yet — search, create, or use what your resume found to get started.
            </p>
          )}
          {skills.map((skill, index) => (
            <div
              key={`${skill.name}-${index}`}
              className="space-y-2 border border-gray-100 dark:border-gray-800 rounded-md p-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{skill.name}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  value={[skill.level]}
                  onValueChange={(value) => setLevel(index, value[0])}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <div className="flex items-center gap-2 w-44">
                  <Progress
                    value={skill.level}
                    className={cn("h-2 w-16", getProgressColor(skill.level))}
                  />
                  <span className="text-xs whitespace-nowrap">
                    {getLevelLabel(skill.level)} ({skill.level}%)
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{getLevelHint(skill.level)}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-6">
          <Button type="button" variant="outline" onClick={() => onComplete([])}>
            Skip for now
          </Button>
          <div className="text-right">
            <Button
              type="button"
              className="bg-leap-purple"
              disabled={!canComplete}
              onClick={() => onComplete(skills)}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Complete Assessment
            </Button>
            {!canComplete && (
              <p className="text-xs text-muted-foreground mt-2">
                Add at least one skill, or skip — you can always add them later.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
