/**
 * Topic resource catalog — client types + fetchers for the server-maintained
 * catalog (the map from skills/topics to learning resources and tools,
 * roadmap.sh style).
 *
 * The catalog data and the matching logic live on the backend
 * (TopicCatalogService) so every client shares one source of truth: editing
 * the catalog server-side updates all platforms. This module only carries the
 * response types and the API calls used by the roadmap panel and the
 * /resources topic browser.
 */

import { apiGet } from "@/lib/api";

export interface CatalogLink {
  title: string;
  url: string;
  /** Display grouping: Course / Guide / Article / Video / Book / Practice / Tool / Community */
  kind: "Course" | "Guide" | "Article" | "Video" | "Book" | "Practice" | "Tool" | "Community";
  /** Short note on what it is or why it helps. */
  note?: string;
}

export interface TopicCatalogEntry {
  /** Canonical topic name shown in the UI. */
  topic: string;
  /** Lowercase keywords used to match roadmap segments to this topic. */
  keywords: string[];
  /** Learning materials for the topic. */
  resources: CatalogLink[];
  /** Hands-on tools, platforms, and practice environments. */
  tools: CatalogLink[];
}

export interface MatchedTopic {
  topic: string;
  matchCount: number;
}

export interface CatalogMatch {
  matches: MatchedTopic[];
  resources: CatalogLink[];
  tools: CatalogLink[];
}

/** The full maintained catalog, straight from the server. */
export async function fetchTopicCatalog(): Promise<TopicCatalogEntry[]> {
  const res = await apiGet<{ topics: TopicCatalogEntry[] }>("/resources/catalog");
  return res.topics || [];
}

/**
 * Match a phrase (a roadmap segment's title + focus + skills) against the
 * server-side catalog. Returns the matched topics plus the deduped resources
 * and tools collected across them.
 */
export async function fetchCatalogMatch(text: string): Promise<CatalogMatch> {
  const res = await apiGet<CatalogMatch>(
    `/resources/catalog/match?text=${encodeURIComponent(text)}`
  );
  return {
    matches: res.matches || [],
    resources: res.resources || [],
    tools: res.tools || [],
  };
}
