import type { WritingPrompt } from "./types";

// ─── Constants ───────────────────────────────────────────────

export const REVIEW_INTERVALS_IN_DAYS = [0, 1, 3, 7, 14] as const;

export const WRITING_FIELDS: WritingPrompt[] = [
  {
    id: "where",
    question: "Où es-tu allé(e) ?",
    placeholder: "Je suis allé(e) au musée / au parc / au restaurant...",
  },
  {
    id: "withWhom",
    question: "Avec qui es-tu allé(e) ?",
    placeholder: "J'y suis allé(e) avec ma famille / mes amis...",
  },
  {
    id: "activities",
    question: "Qu'est-ce que tu as fait là-bas ?",
    placeholder: "Nous avons regardé..., j'ai joué..., j'ai acheté...",
  },
  {
    id: "clothes",
    question: "Qu'est-ce que tu as porté ?",
    placeholder: "J'ai porté une robe bleue / un t-shirt noir...",
  },
  {
    id: "food",
    question:
      "Qu'est-ce que tu as mangé ? As-tu aimé la nourriture ? Pourquoi ?",
    placeholder:
      "J'ai mangé... J'ai aimé / je n'ai pas aimé... parce que...",
  },
];

// ─── Text normalization ──────────────────────────────────────

export function normalizeText(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}

export function sameAnswer(input: string, expected: string): boolean {
  return normalizeText(input) === normalizeText(expected);
}

export function containsKeywords(
  input: string,
  keywords: string[]
): boolean {
  const normalizedInput = normalizeText(input);
  return keywords.every((keyword) =>
    normalizedInput.includes(normalizeText(keyword))
  );
}

// ─── Date helpers ────────────────────────────────────────────

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}
