"use client";

import { useState } from "react";
import type { WritingPrompt, FeedbackState } from "@/lib/types";
import { useProgress } from "@/components/providers/ProgressProvider";
import { Button } from "@/components/shared/Button";
import { FeedbackBanner } from "@/components/shared/FeedbackBanner";

interface WritingQuestProps {
  prompts: WritingPrompt[];
}

export function WritingQuest({ prompts }: WritingQuestProps) {
  const { dispatch } = useProgress();

  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(prompts.map((p) => [p.id, ""]))
  );
  const [feedback, setFeedback] = useState<FeedbackState>({
    tone: "idle",
    message:
      "Write each part first. Rewards only unlock after the full response is there.",
  });

  const combinedWriting = prompts
    .map((p) => answers[p.id].trim())
    .filter(Boolean)
    .join(" ");
  const wordCount = combinedWriting
    ? combinedWriting.split(/\s+/).filter(Boolean).length
    : 0;

  function updateAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function submit() {
    const missingFields = prompts.filter((p) => !answers[p.id].trim());

    if (missingFields.length > 0) {
      setFeedback({
        tone: "wrong",
        message: `Still incomplete. Finish all ${prompts.length} exam prompts before claiming the writing reward.`,
      });
      return;
    }

    if (wordCount < 35) {
      setFeedback({
        tone: "wrong",
        message:
          "This is too thin to be useful revision. Expand the answer so it becomes a real exam-style paragraph.",
      });
      return;
    }

    dispatch({
      type: "SCORE_WRITING",
      wordCount,
      allFieldsFilled: missingFields.length === 0,
    });

    setFeedback({
      tone: "correct",
      message:
        "Writing quest accepted. Mihika earned the reward by completing the full scaffolded response.",
    });
  }

  return (
    <section className="panel writing-panel" id="writing">
      <div className="section-head">
        <p className="eyebrow">Writing Quest</p>
        <h2>Ma sortie r&#233;cente</h2>
      </div>
      <div className="writing-layout">
        <article className="writing-card">
          <h3>Use this exam-ready frame</h3>
          <div className="writing-fields">
            {prompts.map((prompt, i) => (
              <label className="writing-input" key={prompt.id}>
                <span>
                  {i + 1}. {prompt.question}
                </span>
                <textarea
                  value={answers[prompt.id]}
                  onChange={(e) => updateAnswer(prompt.id, e.target.value)}
                  placeholder={prompt.placeholder}
                  rows={3}
                />
              </label>
            ))}
          </div>
          <p>
            The reward now depends on actual output: all five prompts answered,
            then a full response of at least 35 words.
          </p>
          <div className="writing-meta">
            <span>Word count</span>
            <strong>{wordCount}</strong>
          </div>
          <Button variant="primary" onClick={submit}>
            Check Writing Quest
          </Button>
          <FeedbackBanner tone={feedback.tone} message={feedback.message} />
        </article>
        <article className="writing-card">
          <h3>Starter model</h3>
          <p>
            Samedi dernier, je suis all&#233;e au mus&#233;e avec ma famille.
            L&#224;-bas, nous avons regard&#233; des peintures et j&apos;ai pris
            beaucoup de photos. J&apos;ai port&#233; une robe bleue et des
            baskets blanches. Apr&#232;s la visite, j&apos;ai mang&#233; un
            sandwich au fromage et une glace au chocolat. J&apos;ai beaucoup
            aim&#233; la nourriture parce qu&apos;elle &#233;tait d&#233;licieuse.
          </p>
          <p className="starter-note">
            Notice the mix: one &#234;tre verb for movement, then several avoir
            verbs for completed actions.
          </p>
          <div className="memory-box">
            <span>Build your final paragraph from your answers</span>
            <strong>
              {combinedWriting || "Your completed paragraph preview will appear here."}
            </strong>
          </div>
        </article>
      </div>
    </section>
  );
}
