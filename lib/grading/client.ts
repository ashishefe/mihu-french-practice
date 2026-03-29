import type { GradeRequest, GradeResponse } from "../types";
import { sameAnswer } from "../utils";
import { getCachedGrade, setCachedGrade } from "./cache";

function clientFallback(req: GradeRequest): GradeResponse {
  const correct = sameAnswer(req.studentAnswer, req.expectedAnswer);
  return {
    correct,
    feedback: correct
      ? "Correct! (Attie used quick-check mode.)"
      : `Not quite — the expected answer was: ${req.expectedAnswer}. (Attie used quick-check mode.)`,
  };
}

export async function gradeAnswer(
  req: GradeRequest
): Promise<GradeResponse> {
  // 1. Check cache
  const cached = getCachedGrade(req.questionId, req.studentAnswer);
  if (cached) return cached;

  // 2. Call API with timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.ok) {
      const result = (await res.json()) as GradeResponse;

      // Check for fallback signal from server
      if (result.feedback === "FALLBACK_TO_CLIENT") {
        return clientFallback(req);
      }

      setCachedGrade(req.questionId, req.studentAnswer, result);
      return result;
    }

    // Non-OK response — check if it's a fallback signal
    try {
      const errResult = (await res.json()) as GradeResponse;
      if (errResult.feedback === "FALLBACK_TO_CLIENT") {
        return clientFallback(req);
      }
    } catch {
      // couldn't parse error response
    }
  } catch {
    // timeout or network error
  }

  // 3. Fallback: client-side exact match
  return clientFallback(req);
}
