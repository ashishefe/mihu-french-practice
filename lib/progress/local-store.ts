import type { UserProgress, SubjectProgress } from "../types";

const STORAGE_KEY = "mihu-progress-v2";
const LEGACY_KEY = "mihika-french-quest-progress";

export function loadProgress(): UserProgress | null {
  if (typeof window === "undefined") return null;

  // Try v2 first
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as UserProgress;
    } catch {
      // Corrupted — fall through
    }
  }

  // Try migrating v1 (Codex format)
  const legacy = window.localStorage.getItem(LEGACY_KEY);
  if (legacy) {
    try {
      const v1 = JSON.parse(legacy);
      const migrated = migrateV1ToV2(v1);
      saveProgress(migrated);
      return migrated;
    } catch {
      // Corrupted — ignore
    }
  }

  return null;
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function createFreshUserProgress(
  userId: string,
  subjectProgress?: Record<string, SubjectProgress>
): UserProgress {
  return {
    version: 2,
    userId,
    subjects: subjectProgress ?? {},
    lastSyncedAt: null,
  };
}

// ─── V1 → V2 migration ──────────────────────────────────────

interface V1SaveState {
  health: number;
  lives: number;
  streak: number;
  xp: number;
  completedWriting: boolean;
  review: Record<string, { ease: number; dueAt: string; lastSeen: string | null }>;
  questions: Record<string, { correct: number; wrong: number }>;
}

function migrateV1ToV2(v1: V1SaveState): UserProgress {
  const frenchProgress: SubjectProgress = {
    subjectId: "french",
    health: v1.health ?? 86,
    lives: v1.lives ?? 4,
    streak: v1.streak ?? 0,
    xp: v1.xp ?? 0,
    completedWriting: v1.completedWriting ?? false,
    review: Object.fromEntries(
      Object.entries(v1.review ?? {}).map(([id, r]) => [
        id,
        { ease: r.ease, dueAt: r.dueAt, lastSeen: r.lastSeen },
      ])
    ),
    questions: Object.fromEntries(
      Object.entries(v1.questions ?? {}).map(([id, q]) => [
        id,
        { correct: q.correct, wrong: q.wrong, lastAttemptAt: null },
      ])
    ),
  };

  return {
    version: 2,
    userId: "local",
    subjects: { french: frenchProgress },
    lastSyncedAt: null,
  };
}
