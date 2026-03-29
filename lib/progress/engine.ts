import type {
  Subject,
  Stage,
  Question,
  ReviewCard,
  SubjectProgress,
  QuestionProgress,
  ReviewProgress,
  ProgressAction,
} from "../types";
import { REVIEW_INTERVALS_IN_DAYS, addDays } from "../utils";

// ─── Factory ─────────────────────────────────────────────────

export function createDefaultProgress(subject: Subject): SubjectProgress {
  return {
    subjectId: subject.id,
    health: 86,
    lives: 4,
    streak: 0,
    xp: 0,
    completedWriting: false,
    review: Object.fromEntries(
      subject.reviewCards.map((card) => [
        card.id,
        { ease: 0, dueAt: new Date().toISOString(), lastSeen: null },
      ])
    ),
    questions: Object.fromEntries(
      subject.questions.map((q) => [
        q.id,
        { correct: 0, wrong: 0, lastAttemptAt: null },
      ])
    ),
  };
}

// ─── Scoring ─────────────────────────────────────────────────

export function scoreQuestionResult(
  progress: SubjectProgress,
  questionId: string,
  correct: boolean,
  firstWin: boolean
): SubjectProgress {
  const existing = progress.questions[questionId] ?? {
    correct: 0,
    wrong: 0,
    lastAttemptAt: null,
  };

  const nextStreak = correct ? progress.streak + 1 : 0;
  const earnedLife =
    correct && firstWin && nextStreak > 0 && nextStreak % 4 === 0;

  return {
    ...progress,
    questions: {
      ...progress.questions,
      [questionId]: {
        correct: existing.correct + (correct ? 1 : 0),
        wrong: existing.wrong + (correct ? 0 : 1),
        lastAttemptAt: new Date().toISOString(),
      },
    },
    streak: nextStreak,
    lives: correct
      ? Math.min(5, progress.lives + (earnedLife ? 1 : 0))
      : Math.max(0, progress.lives - 1),
    health: correct
      ? Math.min(100, progress.health + (firstWin ? 6 : 2))
      : Math.max(0, progress.health - 12),
    xp: progress.xp + (correct ? (firstWin ? 14 : 4) : 3),
  };
}

export function scoreReviewResult(
  progress: SubjectProgress,
  cardId: string,
  success: boolean,
  now: Date = new Date()
): SubjectProgress {
  const current = progress.review[cardId] ?? {
    ease: 0,
    dueAt: now.toISOString(),
    lastSeen: null,
  };

  const nextEase = success
    ? Math.min(REVIEW_INTERVALS_IN_DAYS.length - 1, current.ease + 1)
    : 0;
  const interval = REVIEW_INTERVALS_IN_DAYS[nextEase];

  return {
    ...progress,
    health: success
      ? Math.min(100, progress.health + 4)
      : Math.max(0, progress.health - 8),
    lives: success ? progress.lives : Math.max(0, progress.lives - 1),
    xp: progress.xp + (success ? 10 : 2),
    review: {
      ...progress.review,
      [cardId]: {
        ease: nextEase,
        lastSeen: now.toISOString(),
        dueAt: addDays(now, interval).toISOString(),
      },
    },
  };
}

export function scoreWritingSubmit(
  progress: SubjectProgress,
  wordCount: number,
  allFieldsFilled: boolean
): SubjectProgress {
  if (!allFieldsFilled || wordCount < 35 || progress.completedWriting) {
    return progress;
  }

  return {
    ...progress,
    completedWriting: true,
    health: Math.min(100, progress.health + 8),
    lives: Math.min(5, progress.lives + 1),
    xp: progress.xp + 25,
  };
}

export function skipQuestion(progress: SubjectProgress): SubjectProgress {
  return {
    ...progress,
    streak: 0,
    health: Math.max(0, progress.health - 4),
  };
}

export function recoverRun(progress: SubjectProgress): SubjectProgress {
  return {
    ...progress,
    health: Math.max(progress.health, 64),
    lives: Math.max(progress.lives, 2),
    streak: 0,
  };
}

// ─── Computed values ─────────────────────────────────────────

export interface StageCompletion extends Stage {
  mastered: number;
  total: number;
}

export function computeStageCompletion(
  stages: Stage[],
  questions: Question[],
  questionProgress: Record<string, QuestionProgress>
): StageCompletion[] {
  return stages.map((stage) => {
    const stageQuestions = questions.filter((q) => q.stageId === stage.id);
    const mastered = stageQuestions.filter((q) => {
      const p = questionProgress[q.id];
      return p && p.correct > p.wrong && p.correct > 0;
    }).length;

    return { ...stage, mastered, total: stageQuestions.length };
  });
}

export function getDueReviewCards(
  cards: ReviewCard[],
  reviewProgress: Record<string, ReviewProgress>,
  now: Date = new Date()
): ReviewCard[] {
  return cards.filter((card) => {
    const p = reviewProgress[card.id];
    return new Date(p?.dueAt ?? 0).getTime() <= now.getTime();
  });
}

export function computeMasteryPercent(
  stageCompletion: StageCompletion[],
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0;
  const mastered = stageCompletion.reduce((sum, s) => sum + s.mastered, 0);
  return Math.round((mastered / totalQuestions) * 100);
}

// ─── Reducer ─────────────────────────────────────────────────

export function progressReducer(
  state: SubjectProgress,
  action: ProgressAction
): SubjectProgress {
  switch (action.type) {
    case "SCORE_QUESTION":
      return scoreQuestionResult(
        state,
        action.questionId,
        action.correct,
        action.firstWin
      );
    case "SCORE_REVIEW":
      return scoreReviewResult(state, action.cardId, action.success);
    case "SCORE_WRITING":
      return scoreWritingSubmit(
        state,
        action.wordCount,
        action.allFieldsFilled
      );
    case "RECOVER_RUN":
      return recoverRun(state);
    case "SKIP_QUESTION":
      return skipQuestion(state);
    case "LOAD":
      return action.progress;
    default:
      return state;
  }
}
