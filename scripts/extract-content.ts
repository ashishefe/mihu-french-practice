/**
 * Content extraction pipeline
 * Reads source PDFs and DOCX, sends to Gemini, outputs typed JSON.
 *
 * Usage: GEMINI_API_KEY=xxx npx tsx scripts/extract-content.ts
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const GEMINI_MODEL = "gemini-3-flash-preview";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is required.");
  console.error("Usage: GEMINI_API_KEY=xxx npx tsx scripts/extract-content.ts");
  process.exit(1);
}

const OUT_DIR = "content/french";

async function extractTextFromPdf(filePath: string): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const buffer = readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractTextFromDocx(filePath: string): Promise<string> {
  const mammoth = await import("mammoth");
  const buffer = readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

function extractJson(text: string): unknown {
  const match = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (!match) throw new Error("No JSON found in response");
  return JSON.parse(match[1] ?? match[0]);
}

async function extractQuestions(sourceTexts: Record<string, string>) {
  const combined = Object.entries(sourceTexts)
    .map(([name, text]) => `=== ${name} ===\n${text}`)
    .join("\n\n");

  const prompt = `You are analyzing Grade 7 French worksheets and practice papers. Extract ALL practice questions from the following source materials.

For each question, output a JSON array of objects with these fields:
- id: unique kebab-case string (e.g., "q-hotel-reception")
- stageId: one of "hotel-and-place-language", "present-tense-helpers", "passe-compose-core", "etre-movers", "repair-station", "reading-and-writing"
- type: "mcq" | "text" | "correction"
- prompt: the question as shown to the student
- answer: the correct answer
- options: array of 4 options (for MCQ only, null for others)
- hint: a helpful hint in English
- explanation: why this answer is correct (English)
- reviewPrompt: a follow-up question for spaced repetition (English)
- gradingStrategy: "exact" for MCQ, "gemini" for passé composé/correction, "exact" for simple present tense
- accentSensitive: true for passé composé and correction questions, false otherwise

Source materials:
${combined}

Output ONLY valid JSON (an array of question objects). No explanation, just the JSON array.`;

  console.log("Extracting questions from source materials...");
  const response = await callGemini(prompt);
  return extractJson(response);
}

async function extractReviewCards(sourceTexts: Record<string, string>) {
  const combined = Object.entries(sourceTexts)
    .map(([name, text]) => `=== ${name} ===\n${text}`)
    .join("\n\n");

  const prompt = `From these Grade 7 French worksheets, extract the key grammar rules and concepts that a student needs to memorize for spaced repetition.

Create 8-12 review cards. Each card should have:
- id: unique kebab-case string (e.g., "r-default-avoir")
- subjectId: "french"
- front: the question/prompt (English)
- back: the answer/explanation (English)
- anchor: a memorable one-line mnemonic
- keywords: 3-5 keywords the student should include when recalling from memory

Source materials:
${combined}

Output ONLY valid JSON (an array of card objects). No explanation.`;

  console.log("Extracting review cards...");
  const response = await callGemini(prompt);
  return extractJson(response);
}

async function main() {
  const sourceFiles: Record<string, string> = {};

  // Extract text from all source files
  const files = [
    { name: "French PP 2.pdf", path: "French PP 2.pdf" },
    { name: "French WS 3.pdf", path: "French WS 3.pdf" },
    { name: "French Wks 2.pdf", path: "French Wks 2.pdf" },
    { name: "Grade 7 Practice Paper", path: "Grade_7_French_Term_2-PP-P1.docx" },
  ];

  for (const file of files) {
    const fullPath = join(process.cwd(), file.path);
    if (!existsSync(fullPath)) {
      console.warn(`Skipping ${file.name}: file not found`);
      continue;
    }

    console.log(`Reading ${file.name}...`);
    if (file.path.endsWith(".pdf")) {
      sourceTexts[file.name] = await extractTextFromPdf(fullPath);
    } else if (file.path.endsWith(".docx")) {
      sourceTexts[file.name] = await extractTextFromDocx(fullPath);
    }
  }

  // Also include OCR text descriptions for image-based PDFs
  const ocrDir = join(process.cwd(), "ocr");
  if (existsSync(ocrDir)) {
    console.log("Note: OCR images found. For image-based PDFs, the extracted text may be limited.");
    console.log("The existing mihika-data.ts content will be used as a baseline.");
  }

  // Extract content
  const questions = await extractQuestions(sourceTexts);
  const reviewCards = await extractReviewCards(sourceTexts);

  // Write output
  writeFileSync(
    join(OUT_DIR, "questions.json"),
    JSON.stringify(questions, null, 2)
  );
  console.log(`Wrote ${(questions as unknown[]).length} questions to ${OUT_DIR}/questions.json`);

  writeFileSync(
    join(OUT_DIR, "review-cards.json"),
    JSON.stringify(reviewCards, null, 2)
  );
  console.log(`Wrote review cards to ${OUT_DIR}/review-cards.json`);

  console.log("\nDone! Review the JSON files and curate before committing.");
}

// Fix: declare sourceTexts properly
const sourceTexts: Record<string, string> = {};
main().catch(console.error);
