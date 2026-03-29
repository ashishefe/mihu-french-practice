import type { GradeResponse } from "../types";
import { normalizeText } from "../utils";

const MAX_ENTRIES = 500;
const CACHE_KEY = "mihu-grade-cache";

type CacheMap = Record<string, GradeResponse>;

function makeCacheKey(questionId: string, answer: string): string {
  return `${questionId}::${normalizeText(answer)}`;
}

let memoryCache: CacheMap = {};
let loaded = false;

function loadCache(): CacheMap {
  if (loaded) return memoryCache;

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) memoryCache = JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  loaded = true;
  return memoryCache;
}

function persistCache(): void {
  if (typeof window === "undefined") return;

  // LRU: keep only the most recent MAX_ENTRIES
  const entries = Object.entries(memoryCache);
  if (entries.length > MAX_ENTRIES) {
    memoryCache = Object.fromEntries(entries.slice(-MAX_ENTRIES));
  }

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
  } catch {
    // storage full — clear and retry
    localStorage.removeItem(CACHE_KEY);
  }
}

export function getCachedGrade(
  questionId: string,
  answer: string
): GradeResponse | null {
  const cache = loadCache();
  return cache[makeCacheKey(questionId, answer)] ?? null;
}

export function setCachedGrade(
  questionId: string,
  answer: string,
  result: GradeResponse
): void {
  loadCache();
  memoryCache[makeCacheKey(questionId, answer)] = result;
  persistCache();
}
