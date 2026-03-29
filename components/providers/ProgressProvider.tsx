"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Subject,
  SubjectProgress,
  ProgressAction,
  ReviewCard,
} from "@/lib/types";
import {
  progressReducer,
  createDefaultProgress,
  computeStageCompletion,
  computeMasteryPercent,
  getDueReviewCards,
  type StageCompletion,
} from "@/lib/progress/engine";
import {
  loadProgress,
  saveProgress,
  createFreshUserProgress,
} from "@/lib/progress/local-store";
import { loadFromDrive, saveToDrive } from "@/lib/progress/drive-store";

// ─── Context shape ───────────────────────────────────────────

interface ProgressContextValue {
  progress: SubjectProgress;
  dispatch: (action: ProgressAction) => void;
  stageCompletion: StageCompletion[];
  masteryPercent: number;
  totalCorrect: number;
  totalWrong: number;
  dueReviewCards: ReviewCard[];
  nextReviewDate: string | null;
  mounted: boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

// ─── Hook ────────────────────────────────────────────────────

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used inside <ProgressProvider>");
  }
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────

interface ProgressProviderProps {
  subject: Subject;
  accessToken?: string | null;
  children: ReactNode;
}

export function ProgressProvider({
  subject,
  accessToken,
  children,
}: ProgressProviderProps) {
  const [mounted, setMounted] = useState(false);
  const defaultProgress = useRef(createDefaultProgress(subject));
  const driveSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [progress, dispatch] = useReducer(
    progressReducer,
    defaultProgress.current
  );

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadProgress();
    const subjectProgress = saved?.subjects[subject.id];

    if (subjectProgress) {
      const merged: SubjectProgress = {
        ...defaultProgress.current,
        ...subjectProgress,
        review: {
          ...defaultProgress.current.review,
          ...subjectProgress.review,
        },
        questions: {
          ...defaultProgress.current.questions,
          ...subjectProgress.questions,
        },
      };
      dispatch({ type: "LOAD", progress: merged });
    }

    setMounted(true);
  }, [subject.id]);

  // Sync from Drive when accessToken becomes available
  useEffect(() => {
    if (!mounted || !accessToken) return;

    loadFromDrive(accessToken).then((driveData) => {
      if (!driveData) return;

      const driveSubject = driveData.subjects[subject.id];
      if (!driveSubject) return;

      // Compare: use whichever has more XP (rough heuristic for "more progress")
      const localXp = progress.xp;
      const driveXp = driveSubject.xp;

      if (driveXp > localXp) {
        const merged: SubjectProgress = {
          ...defaultProgress.current,
          ...driveSubject,
          review: {
            ...defaultProgress.current.review,
            ...driveSubject.review,
          },
          questions: {
            ...defaultProgress.current.questions,
            ...driveSubject.questions,
          },
        };
        dispatch({ type: "LOAD", progress: merged });
      }
    });
    // Only run when accessToken changes, not on every progress update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, mounted, subject.id]);

  // Persist on every change
  useEffect(() => {
    if (!mounted) return;

    // Always save to localStorage immediately
    const existing = loadProgress();
    const userProgress = existing ?? createFreshUserProgress("local");
    userProgress.subjects[subject.id] = progress;
    userProgress.lastSyncedAt = new Date().toISOString();
    saveProgress(userProgress);

    // Debounced save to Drive (5 seconds)
    if (accessToken) {
      if (driveSaveTimer.current) clearTimeout(driveSaveTimer.current);
      driveSaveTimer.current = setTimeout(() => {
        const fresh = loadProgress();
        if (fresh) {
          saveToDrive(accessToken, fresh);
        }
      }, 5000);
    }
  }, [mounted, progress, subject.id, accessToken]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (driveSaveTimer.current) clearTimeout(driveSaveTimer.current);
    };
  }, []);

  // Computed values
  const stageCompletion = useMemo(
    () =>
      computeStageCompletion(
        subject.stages,
        subject.questions,
        progress.questions
      ),
    [subject.stages, subject.questions, progress.questions]
  );

  const masteryPercent = useMemo(
    () => computeMasteryPercent(stageCompletion, subject.questions.length),
    [stageCompletion, subject.questions.length]
  );

  const totalCorrect = useMemo(
    () =>
      Object.values(progress.questions).reduce(
        (sum, q) => sum + q.correct,
        0
      ),
    [progress.questions]
  );

  const totalWrong = useMemo(
    () =>
      Object.values(progress.questions).reduce((sum, q) => sum + q.wrong, 0),
    [progress.questions]
  );

  const dueReviewCards = useMemo(
    () => getDueReviewCards(subject.reviewCards, progress.review),
    [subject.reviewCards, progress.review]
  );

  const nextReviewDate = useMemo(() => {
    const dates = Object.values(progress.review)
      .map((r) => r.dueAt)
      .sort();
    return dates[0] ?? null;
  }, [progress.review]);

  const stableDispatch = useCallback(
    (action: ProgressAction) => dispatch(action),
    []
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      dispatch: stableDispatch,
      stageCompletion,
      masteryPercent,
      totalCorrect,
      totalWrong,
      dueReviewCards,
      nextReviewDate,
      mounted,
    }),
    [
      progress,
      stableDispatch,
      stageCompletion,
      masteryPercent,
      totalCorrect,
      totalWrong,
      dueReviewCards,
      nextReviewDate,
      mounted,
    ]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}
