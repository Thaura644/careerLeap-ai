import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Plus, Globe, ExternalLink, BookOpen, Sparkles } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { useResources } from "@/context/ResourcesContext";
import { useToast } from "@/hooks/use-toast";

interface OpenResult {
  title: string;
  type: string;
  url: string;
  source: string;
  difficulty: string;
  description: string;
  topics: string[];
}

/** The resource engine: find real open-source learning materials (YouTube,
 *  freeCodeCamp, official docs, open books, free practice platforms) and add
 *  them to the library. Everything returned is a real, openable link. */
export const ResourceEnginePanel: React.FC = () => {
  const { refresh } = useResources();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OpenResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      const data = await apiGet<{ results: OpenResult[] }>(
        `/resources/engine/search?q=${encodeURIComponent(query.trim())}`
      );
      setResults(data.results || []);
    } catch {
      setResults([]);
      toast({ title: "Search failed", description: "The engine did not respond. Try again.", variant: "destructive" });
    }
    setSearching(false);
  };

  const importItem = async (item: OpenResult) => {
    setImporting(item.url);
    try {
      await apiPost("/resources/engine/import", {
        title: item.title,
        type: item.type,
        url: item.url,
        source: item.source,
        description: item.description,
      });
      toast({
        title: "Added to your library",
        description: `"${item.title}" is now in the learning library.`,
      });
      refresh();
    } catch {
      toast({ title: "Import failed", description: "Could not add this resource.", variant: "destructive" });
    }
    setImporting(null);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-leap-purple" />
          <CardTitle className="text-lg">Resource engine</CardTitle>
        </div>
        <CardDescription>
          Search real open-source learning materials — YouTube courses, freeCodeCamp, official
          docs, open books, and free practice platforms — and add them to your library.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="e.g. system design, sql, machine learning, leadership…"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={searching || !query.trim()}>
            {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Search
          </Button>
        </form>

        {searching && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Searching the open catalog…
          </div>
        )}

        {!searching && results && results.length === 0 && searched && (
          <p className="mt-4 text-sm text-muted-foreground">
            No matches in the open catalog. Try a broader term — the catalog covers system
            design, algorithms, frontend, backend, devops, data, leadership, and interview prep.
          </p>
        )}

        {!searching && results && results.length > 0 && (
          <div className="mt-4 space-y-2">
            {results.map((item) => (
              <div
                key={item.url}
                className="flex items-start justify-between gap-3 rounded-md border p-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-medium">{item.title}</span>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      {item.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-0.5 text-[10px] text-green-600 dark:text-green-400 border-green-300 dark:border-green-800"
                    >
                      <Globe className="h-3 w-3" /> {item.source}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                  )}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-leap-purple hover:underline break-all"
                  >
                    {item.url} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  disabled={importing === item.url}
                  onClick={() => importItem(item)}
                >
                  {importing === item.url ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Plus className="mr-1 h-3 w-3" />
                  )}
                  Add
                </Button>
              </div>
            ))}
          </div>
        )}

        {!searched && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            The catalog is curated in code — every link is known-good, so nothing here is a dead end.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
