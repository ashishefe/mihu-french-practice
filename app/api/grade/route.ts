import { NextRequest, NextResponse } from "next/server";
import type { GradeRequest, GradeResponse } from "@/lib/types";
import { buildGradingPrompt } from "@/lib/grading/prompts";

const GEMINI_MODEL = "gemini-3-flash-preview";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function POST(req: NextRequest): Promise<NextResponse<GradeResponse>> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          correct: false,
          feedback: "Grading service not configured. Using approximate matching.",
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
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      return NextResponse.json(
        {
          correct: false,
          feedback: "Grading service temporarily unavailable.",
        },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();
    const text =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Extract JSON from the response (Gemini sometimes wraps in markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        correct: false,
        feedback: "Could not parse grading response. Try again.",
      });
    }

    const parsed = JSON.parse(jsonMatch[0]) as GradeResponse;

    return NextResponse.json({
      correct: parsed.correct ?? false,
      feedback: parsed.feedback ?? "No feedback available.",
      accentNote: parsed.accentNote ?? undefined,
      partialCredit: parsed.partialCredit ?? undefined,
    });
  } catch (err) {
    console.error("Grade route error:", err);
    return NextResponse.json(
      {
        correct: false,
        feedback: "Grading error. Using approximate matching.",
      },
      { status: 500 }
    );
  }
}
