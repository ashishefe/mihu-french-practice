import { NextRequest, NextResponse } from "next/server";
import type { GradeRequest, GradeResponse } from "@/lib/types";
import { buildGradingPrompt } from "@/lib/grading/prompts";

const GEMINI_MODEL = "gemini-3-flash-preview";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function tryParseGradeResponse(text: string): GradeResponse | null {
  // Try extracting JSON from markdown code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // fall through
    }
  }

  // Try finding a JSON object anywhere in the text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // fall through
    }
  }

  // Try parsing the entire text as JSON
  try {
    return JSON.parse(text.trim());
  } catch {
    // fall through
  }

  // Last resort: try to infer from natural language
  const lower = text.toLowerCase();
  const looksCorrect =
    lower.includes('"correct": true') ||
    lower.includes('"correct":true') ||
    (lower.includes("correct") && !lower.includes("not correct") && !lower.includes("incorrect"));

  // Extract feedback from the text (take first sentence-like chunk)
  const feedbackMatch = text.match(/feedback["\s:]+["']?([^"'\n]+)/i);
  const feedback = feedbackMatch?.[1]?.trim() || text.slice(0, 200).trim();

  if (feedback) {
    return {
      correct: looksCorrect,
      feedback,
    };
  }

  return null;
}

export async function POST(req: NextRequest): Promise<NextResponse<GradeResponse>> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          correct: false,
          feedback: "Grading service not configured.",
        },
        { status: 503 }
      );
    }

    const body = (await req.json()) as GradeRequest;

    if (!body.studentAnswer || !body.expectedAnswer || !body.prompt) {
      return NextResponse.json(
        { correct: false, feedback: "Missing required fields." },
        { status: 400 }
      );
    }

    const prompt = buildGradingPrompt(body);

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 256,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      // Return a "try offline" signal so client falls back to string matching
      return NextResponse.json(
        {
          correct: false,
          feedback: "FALLBACK_TO_CLIENT",
        },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();
    const text =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!text) {
      console.error("Gemini returned empty text. Full response:", JSON.stringify(geminiData));
      return NextResponse.json(
        { correct: false, feedback: "FALLBACK_TO_CLIENT" },
        { status: 502 }
      );
    }

    const parsed = tryParseGradeResponse(text);

    if (!parsed) {
      console.error("Could not parse Gemini response:", text);
      return NextResponse.json(
        { correct: false, feedback: "FALLBACK_TO_CLIENT" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      correct: parsed.correct ?? false,
      feedback: parsed.feedback ?? "Good effort!",
      accentNote: parsed.accentNote ?? undefined,
      partialCredit: parsed.partialCredit ?? undefined,
    });
  } catch (err) {
    console.error("Grade route error:", err);
    return NextResponse.json(
      { correct: false, feedback: "FALLBACK_TO_CLIENT" },
      { status: 500 }
    );
  }
}
