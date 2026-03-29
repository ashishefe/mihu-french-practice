import type { Subject } from "./types";
import {
  stages as rawStages,
  practiceQuestions as rawQuestions,
  reviewCards as rawReviewCards,
  listeningStrategies as rawListening,
  pedagogyNotes as rawPedagogy,
  sourceFiles as rawSources,
} from "./mihika-data";
import { WRITING_FIELDS } from "./utils";

export const frenchSubject: Subject = {
  id: "french",
  slug: "french",
  title: "French",
  description:
    "Grade 7 French exam prep — passé composé, present tense, reading, writing, and listening strategies.",
  iconEmoji: "🇫🇷",

  stages: rawStages.map((s, i) => ({
    id: s.id,
    subjectId: "french",
    level: i + 1,
    title: s.title,
    skill: s.skill,
    whyItMatters: s.whyItMatters,
    mnemonic: s.mnemonic,
    source: s.source,
    demo: s.demo,
  })),

  questions: rawQuestions.map((q) => {
    // Passé composé and correction questions benefit from Gemini grading
    const isGeminiCandidate =
      q.stageId === "passe-compose-core" ||
      q.stageId === "etre-movers" ||
      q.stageId === "repair-station";

    return {
      id: q.id,
      subjectId: "french",
      stageId: q.stageId,
      type: q.stageId === "repair-station" ? ("correction" as const) : q.type,
      prompt: q.prompt,
      answer: q.answer,
      options: q.options,
      hint: q.hint,
      explanation: q.explanation,
      reviewPrompt: q.reviewPrompt,
      gradingStrategy:
        q.type === "mcq"
          ? ("exact" as const)
          : isGeminiCandidate
            ? ("gemini" as const)
            : ("exact" as const),
      accentSensitive: isGeminiCandidate,
    };
  }),

  reviewCards: rawReviewCards.map((r) => ({
    ...r,
    subjectId: "french",
  })),

  listeningStrategies: rawListening,

  writingPrompts: WRITING_FIELDS,

  pedagogyNotes: rawPedagogy,

  sourceFiles: rawSources,
};
