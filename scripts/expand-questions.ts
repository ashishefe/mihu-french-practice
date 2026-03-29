/**
 * Question expansion pipeline
 * Takes existing questions and generates variations using Gemini.
 *
 * Usage: GEMINI_API_KEY=xxx npx tsx scripts/expand-questions.ts
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const GEMINI_MODEL = "gemini-3-flash-preview";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is required.");
  process.exit(1);
}

const QUESTIONS_PATH = "content/french/questions.json";

interface Question {
  id: string;
  stageId: string;
  type: string;
  prompt: string;
  answer: string;
  options?: string[];
  hint: string;
  explanation: string;
  reviewPrompt: string;
  gradingStrategy: string;
  accentSensitive: boolean;
  generated?: boolean;
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

function extractJson(text: string): unknown {
  const match =
    text.match(/```json\s*([\s\S]*?)```/) ??
    text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (!match) throw new Error("No JSON found in response");
  return JSON.parse(match[1] ?? match[0]);
}

async function main() {
  if (!existsSync(QUESTIONS_PATH)) {
    console.error(`Questions file not found: ${QUESTIONS_PATH}`);
    console.error("Run extract-content.ts first, or use the existing mihika-data.ts questions.");
    process.exit(1);
  }

  const questions: Question[] = JSON.parse(readFileSync(QUESTIONS_PATH, "utf-8"));
  const originalCount = questions.length;

  // Group by stage for batch expansion
  const stageGroups = new Map<string, Question[]>();
  for (const q of questions) {
    if (q.generated) continue; // Don't expand already-generated questions
    const group = stageGroups.get(q.stageId) ?? [];
    group.push(q);
    stageGroups.set(q.stageId, group);
  }

  const newQuestions: Question[] = [];

  for (const [stageId, stageQuestions] of stageGroups) {
    console.log(`Expanding ${stageQuestions.length} questions for stage: ${stageId}...`);

    const examples = stageQuestions
      .slice(0, 3)
      .map((q) => JSON.stringify(q, null, 2))
      .join(",\n");

    const prompt = `You are creating practice questions for a Grade 7 French student.

Here are existing questions for the "${stageId}" stage:
[${examples}]

Generate 3 NEW questions that:
- Test the same grammar concepts at the same difficulty level
- Use different sentences/vocabulary than the originals
- Follow the exact same JSON format
- Have unique IDs (prefix with "gen-")
- Include "generated": true
- Keep the same type, gradingStrategy, and accentSensitive values

Output ONLY valid JSON (an array of 3 question objects). No explanation.`;

    try {
      const response = await callGemini(prompt);
      const generated = extractJson(response) as Question[];
      newQuestions.push(...generated.map((q) => ({ ...q, generated: true })));
    } catch (err) {
      console.error(`  Error expanding ${stageId}:`, err);
    }

    // Rate limit: wait 1 second between calls
    await new Promise((r) => setTimeout(r, 1000));
  }

  // Merge and write
  const merged = [...questions, ...newQuestions];
  writeFileSync(QUESTIONS_PATH, JSON.stringify(merged, null, 2));

  console.log(
    `\nDone! ${originalCount} original + ${newQuestions.length} generated = ${merged.length} total questions.`
  );
  console.log("Review the generated questions and remove any that are incorrect.");
}

main().catch(console.error);
