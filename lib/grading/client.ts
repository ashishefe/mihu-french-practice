import type { GradeRequest, GradeResponse } from "../types";
import { sameAnswer } from "../utils";
import { getCachedGrade, setCachedGrade } from "./cache";

export async function gradeAnswer(
  req: GradeRequest
): Promise<GradeResponse> {
  // 1. Check cache
  const cached = getCachedGrade(req.questionId, req.studentAnswer);
  if (cached) return cached;

  // 2. Call API with timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.ok) {
      const result = (await res.json()) as GradeResponse;
      setCachedGrade(req.questionId, req.studentAnswer, result);
      return result;
    }
  } catch {
    // timeout or network error — fall through to fallback
  }

  // 3. Fallback: client-side exact match
  const correct = sameAnswer(req.studentAnswer, req.expectedAnswer);
  return {
    correct,
    feedback: correct
      ? "Correct! (Grading was approximate — Attie couldn't reach the server.)"
      : `Not quite. The expected answer was: ${req.expectedAnswer}. (Approximate grading — Attie couldn't reach the server.)`,
  };
}
