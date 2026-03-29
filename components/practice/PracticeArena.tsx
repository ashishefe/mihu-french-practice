"use client";

import { useState, useMemo } from "react";
import type { Question, Stage, FeedbackState } from "@/lib/types";
import { sameAnswer } from "@/lib/utils";
import { gradeAnswer } from "@/lib/grading/client";
import { useProgress } from "@/components/providers/ProgressProvider";
import { Button } from "@/components/shared/Button";
import { FeedbackBanner } from "@/components/shared/FeedbackBanner";
import { McqOptions } from "./McqOptions";
import { TextInput } from "./TextInput";
import { RecoveryBox } from "./RecoveryBox";

interface PracticeArenaProps {
  questions: Question[];
  stages: Stage[];
  selectedStageId?: string | null;
}

export function PracticeArena({ questions, stages, selectedStageId }: PracticeArenaProps) {
  const { progress, dispatch } = useProgress();

  const filteredQuestions = useMemo(
    () =>
      selectedStageId
        ? questions.filter((q) => q.stageId === selectedStageId)
        : questions,
    [questions, selectedStageId]
  );

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    tone: "idle",
    message: "Warm up with one careful answer.",
  });

  const activeQuestions = filteredQuestions.length > 0 ? filteredQuestions : questions;
  const currentQuestion = activeQuestions[questionIndex % activeQuestions.length];
  const currentStage = stages.find((s) => s.id === currentQuestion.stageId);

  async function submitQuestion() {
    const rawAnswer =
      currentQuestion.type === "mcq"
        ? selectedOption
        : textAnswer.replace(/\s+/g, " ").trim();

    if (!rawAnswer) {
      setFeedback({
        tone: "wrong",
        message: `No guess yet. Hint: ${currentQuestion.hint}`,
      });
      return;
    }

    // MCQ or exact-strategy: grade client-side
    if (
      currentQuestion.type === "mcq" ||
      currentQuestion.gradingStrategy === "exact"
    ) {
      const correct = sameAnswer(rawAnswer, currentQuestion.answer);
      recordResult(correct, currentQuestion.explanation);
      return;
    }

    // Gemini grading for text/correction questions
    setGrading(true);
    setFeedback({ tone: "loading", message: "Attie is checking your answer..." });

    const questionType =
      currentQuestion.type === "correction"
        ? "correction"
        : currentQuestion.stageId === "reading-and-writing"
          ? "comprehension"
          : "grammar";

    const result = await gradeAnswer({
      questionId: currentQuestion.id,
      questionType,
      prompt: currentQuestion.prompt,
      expectedAnswer: currentQuestion.answer,
      studentAnswer: rawAnswer,
      accentSensitive: currentQuestion.accentSensitive ?? false,
    });

    setGrading(false);

    const feedbackParts = [result.feedback];
    if (result.accentNote) feedbackParts.push(result.accentNote);

    recordResult(result.correct, feedbackParts.join(" "));
  }

  function recordResult(correct: boolean, explanation: string) {
    const existing = progress.questions[currentQuestion.id];
    const firstWin = correct && (!existing || existing.correct === 0);

    dispatch({
      type: "SCORE_QUESTION",
      questionId: currentQuestion.id,
      correct,
      firstWin,
    });
    setAttempts((v) => v + 1);

    if (correct) {
      setFeedback({ tone: "correct", message: `Correct! ${explanation}` });
    } else {
      setFeedback({
        tone: "wrong",
        message:
          attempts === 0
            ? `Not yet. ${explanation} Try once more.`
            : `Not yet. ${explanation}`,
      });
    }
  }

  function nextQuestion() {
    if (feedback.tone !== "correct") {
      dispatch({ type: "SKIP_QUESTION" });
    }
    setQuestionIndex((v) => (v + 1) % activeQuestions.length);
    setSelectedOption("");
    setTextAnswer("");
    setAttempts(0);
    setGrading(false);
    setFeedback({
      tone: "idle",
      message: "New prompt loaded. Say it, think it, then answer it.",
    });
  }

  function handleRecover() {
    dispatch({ type: "RECOVER_RUN" });
    setFeedback({
      tone: "idle",
      message: "Recovery applied. Read one worked example, then continue.",
    });
  }

  const needsRecovery = progress.health === 0 || progress.lives === 0;

  return (
    <section className="panel" id="arena">
      <div className="section-head">
        <p className="eyebrow">Practice Arena</p>
        <h2>
          {selectedStageId
            ? `${currentStage?.title} — focused practice`
            : "Answer, check, repair, continue"}
        </h2>
      </div>

      <article className="arena-card">
        <div className="arena-meta">
          <span>Stage: {currentStage?.title}</span>
          <strong>
            Question {(questionIndex % activeQuestions.length) + 1} / {activeQuestions.length}
          </strong>
        </div>
        <h3>{currentQuestion.prompt}</h3>

        {currentQuestion.type === "mcq" && currentQuestion.options ? (
          <McqOptions
            options={currentQuestion.options}
            selected={selectedOption}
            onSelect={setSelectedOption}
          />
        ) : (
          <TextInput value={textAnswer} onChange={setTextAnswer} />
        )}

        <div className="arena-actions">
          <Button
            variant="primary"
            onClick={submitQuestion}
            disabled={grading}
          >
            {grading ? "Checking..." : "Check Answer"}
          </Button>
          <Button variant="secondary" onClick={nextQuestion} disabled={grading}>
            Skip With Penalty
          </Button>
        </div>

        <FeedbackBanner tone={feedback.tone} message={feedback.message} />
      </article>

      {needsRecovery && <RecoveryBox onRecover={handleRecover} />}
    </section>
  );
}
