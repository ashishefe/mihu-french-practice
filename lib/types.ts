// ─── Content Model (subject-agnostic) ─────────────────────────

export interface Subject {
  id: string;
  slug: string;
  title: string;
  description: string;
  iconEmoji: string;
  stages: Stage[];
  questions: Question[];
  reviewCards: ReviewCard[];
  listeningStrategies?: ListeningStrategy[];
  writingPrompts?: WritingPrompt[];
  pedagogyNotes?: PedagogyNote[];
  sourceFiles?: string[];
}

export interface Stage {
  id: string;
  subjectId: string;
  level: number;
  title: string;
  skill: string;
  whyItMatters: string;
  mnemonic: string;
  source: string;
  demo: WorkedExample;
}

export interface WorkedExample {
  prompt: string;
  answer: string;
  explanation: string;
}

export interface Question {
  id: string;
  subjectId: string;
  stageId: string;
  type: "mcq" | "text" | "correction";
  prompt: string;
  answer: string;
  acceptableAnswers?: string[];
  options?: string[];
  hint: string;
  explanation: string;
  reviewPrompt: string;
  gradingStrategy: "exact" | "gemini" | "keywords";
  accentSensitive?: boolean;
  generated?: boolean;
}

export interface ReviewCard {
  id: string;
  subjectId: string;
  front: string;
  back: string;
  anchor: string;
  keywords: string[];
}

export interface ListeningStrategy {
  title: string;
  description: string;
  action: string;
}

export interface WritingPrompt {
  id: string;
  question: string;
  placeholder: string;
}

export interface PedagogyNote {
  title: string;
  body: string;
}

// ─── Progress Model (persisted to localStorage + Drive) ──────

export interface UserProgress {
  version: 2;
  userId: string;
  subjects: Record<string, SubjectProgress>;
  lastSyncedAt: string | null;
}

export interface SubjectProgress {
  subjectId: string;
  health: number;
  lives: number;
  streak: number;
  xp: number;
  completedWriting: boolean;
  questions: Record<string, QuestionProgress>;
  review: Record<string, ReviewProgress>;
}

export interface QuestionProgress {
  correct: number;
  wrong: number;
  lastAttemptAt: string | null;
}

export interface ReviewProgress {
  ease: number;
  dueAt: string;
  lastSeen: string | null;
}

// ─── Auth Model ──────────────────────────────────────────────

export interface AuthState {
  status: "signed-out" | "signing-in" | "signed-in" | "error";
  user: GoogleUser | null;
  accessToken: string | null;
  error: string | null;
}

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

// ─── Grading Model ──────────────────────────────────────────

export interface GradeRequest {
  questionId: string;
  questionType: "grammar" | "comprehension" | "correction" | "writing";
  prompt: string;
  expectedAnswer: string;
  studentAnswer: string;
  accentSensitive: boolean;
}

export interface GradeResponse {
  correct: boolean;
  feedback: string;
  accentNote?: string;
  partialCredit?: boolean;
}

// ─── UI State ────────────────────────────────────────────────

export type FeedbackTone = "idle" | "correct" | "wrong" | "loading";

export interface FeedbackState {
  tone: FeedbackTone;
  message: string;
}

export type AttieMood = "happy" | "thinking" | "sympathetic" | "celebrating";

// ─── Progress Actions ────────────────────────────────────────

export type ProgressAction =
  | { type: "SCORE_QUESTION"; questionId: string; correct: boolean; firstWin: boolean }
  | { type: "SCORE_REVIEW"; cardId: string; success: boolean }
  | { type: "SCORE_WRITING"; wordCount: number; allFieldsFilled: boolean }
  | { type: "RECOVER_RUN" }
  | { type: "SKIP_QUESTION" }
  | { type: "LOAD"; progress: SubjectProgress };
