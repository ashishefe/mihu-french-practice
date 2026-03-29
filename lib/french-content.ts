import type { Subject } from "./types";
import stagesData from "@/content/french/stages.json";
import questionsData from "@/content/french/questions.json";
import reviewCardsData from "@/content/french/review-cards.json";
import { WRITING_FIELDS } from "./utils";
import {
  listeningStrategies as rawListening,
  pedagogyNotes as rawPedagogy,
  sourceFiles as rawSources,
} from "./mihika-data";

export const frenchSubject: Subject = {
  id: "french",
  slug: "french",
  title: "French",
  description:
    "Grade 7 French exam prep — Tricolore 2 units 3C-3E and 4A-4D, plus worksheets and practice papers.",
  iconEmoji: "🇫🇷",

  stages: stagesData as Subject["stages"],
  questions: questionsData as Subject["questions"],
  reviewCards: reviewCardsData as Subject["reviewCards"],

  listeningStrategies: rawListening,
  writingPrompts: WRITING_FIELDS,
  pedagogyNotes: rawPedagogy,
  sourceFiles: [...rawSources, "Tricolore 2 (5th edition) — Units 3C, 3D, 3E, 4A, 4C, 4D"],
};
