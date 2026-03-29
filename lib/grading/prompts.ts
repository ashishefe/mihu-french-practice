import type { GradeRequest } from "../types";

export function buildGradingPrompt(req: GradeRequest): string {
  const base = `You are a French language tutor evaluating a Grade 7 student's answer.

Question: ${req.prompt}
Expected answer: ${req.expectedAnswer}
Student's answer: ${req.studentAnswer}

`;

  switch (req.questionType) {
    case "grammar":
      return (
        base +
        `This is a GRAMMAR exercise (passé composé conjugation). Evaluate strictly:
- Is the helper verb correct (avoir vs être)?
- Is the past participle form correct?
- Does the participle agree in gender/number with the subject (for être verbs)?
${req.accentSensitive ? "- Missing accents on past participles (e.g., 'mange' instead of 'mangé') IS a meaningful error. Flag it specifically." : "- Minor accent differences can be noted but are not critical errors."}
- The student's answer does NOT need to match word-for-word. If the grammatical form requested is correct, mark it correct.
- If the student wrote just the verb form (e.g., "a perdu") and the expected answer includes the full sentence, the verb form alone is correct.

Respond in EXACTLY this JSON format:
{"correct": true/false, "feedback": "brief explanation in English", "accentNote": "note about accents if relevant, or null"}`
      );

    case "correction":
      return (
        base +
        `This is a CORRECTION exercise. The student must fix an intentionally wrong French sentence.
- Check if the student corrected the helper verb (avoir ↔ être) when needed.
- Check if the past participle is now correct.
- Check if agreement is now correct.
${req.accentSensitive ? "- Missing accents on corrected forms IS a meaningful error." : ""}
- A partial fix (e.g., right helper but wrong agreement) is WRONG, but give credit for what they got right in the feedback.
- Minor word order differences or extra spaces are acceptable.

Respond in EXACTLY this JSON format:
{"correct": true/false, "feedback": "brief explanation in English", "accentNote": "note about accents if relevant, or null"}`
      );

    case "comprehension":
      return (
        base +
        `This is a READING COMPREHENSION answer. Evaluate for meaning, not exact wording.
- The student's answer should convey the same essential meaning as the expected answer.
- Minor spelling errors, missing articles, or slightly different phrasing are acceptable.
- Mixing English and French words is acceptable if the meaning is clear.
- The answer does NOT need to be a complete sentence if the meaning is clear.

Respond in EXACTLY this JSON format:
{"correct": true/false, "feedback": "brief explanation in English", "accentNote": null}`
      );

    case "writing":
      return (
        base +
        `This is a GUIDED WRITING response (Ma sortie récente). Evaluate holistically:
- Does the response use passé composé correctly (at least 2-3 instances)?
- Does it address the prompt question?
- Is it coherent French (not just random words)?
- Word count should be at least 35 words total across all prompts.
- Give partial credit for good effort with some errors.
- Be encouraging — this is a learning exercise, not an exam.

Respond in EXACTLY this JSON format:
{"correct": true/false, "feedback": "brief encouraging explanation in English", "partialCredit": true/false, "accentNote": null}`
      );

    default:
      return (
        base +
        `Evaluate whether the student's answer matches the expected answer in meaning.

Respond in EXACTLY this JSON format:
{"correct": true/false, "feedback": "brief explanation", "accentNote": null}`
      );
  }
}
