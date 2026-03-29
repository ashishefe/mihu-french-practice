"use client";

import { useState } from "react";
import type { ReviewCard as ReviewCardType } from "@/lib/types";
import { useProgress } from "@/components/providers/ProgressProvider";
import { containsKeywords, addDays, formatDate, REVIEW_INTERVALS_IN_DAYS } from "@/lib/utils";
import { Button } from "@/components/shared/Button";

interface MemoryGardenProps {
  allCards: ReviewCardType[];
}

export function MemoryGarden({ allCards }: MemoryGardenProps) {
  const { progress, dispatch, dueReviewCards, nextReviewDate } = useProgress();

  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewInput, setReviewInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [feedback, setFeedback] = useState("Ready for a quick memory check.");

  const currentCard =
    dueReviewCards[reviewIndex % Math.max(dueReviewCards.length, 1)] ??
    allCards[0];

  function submitRecall() {
    if (!reviewInput.trim()) {
      setFeedback("Type the idea from memory first. No reward for instant reveal.");
      return;
    }

    if (containsKeywords(reviewInput, currentCard.keywords)) {
      dispatch({ type: "SCORE_REVIEW", cardId: currentCard.id, success: true });
      setResolved(true);

      const currentEase = progress.review[currentCard.id]?.ease ?? 0;
      const nextEase = Math.min(REVIEW_INTERVALS_IN_DAYS.length - 1, currentEase + 1);
      const nextDate = addDays(new Date(), REVIEW_INTERVALS_IN_DAYS[nextEase]);
      setFeedback(`Locked in. This card returns on ${formatDate(nextDate.toISOString())}.`);
      return;
    }

    setRevealed(true);
    dispatch({ type: "SCORE_REVIEW", cardId: currentCard.id, success: false });
    setResolved(true);
    setFeedback("Not secure yet. Read the answer, then move to the next review card.");
  }

  function revealAnswer() {
    setRevealed(true);
    dispatch({ type: "SCORE_REVIEW", cardId: currentCard.id, success: false });
    setResolved(true);
    setFeedback("Answer revealed. No reward given; this card will return sooner.");
  }

  function nextCard() {
    setReviewIndex((v) => v + 1);
    setReviewInput("");
    setRevealed(false);
    setResolved(false);
    setFeedback("Ready for a quick memory check.");
  }

  return (
    <section className="panel memory-panel" id="memory">
      <div className="section-head">
        <p className="eyebrow">Spaced Repetition</p>
        <h2>Memory Garden</h2>
      </div>
      <div className="memory-layout">
        <article className="review-card">
          <span className="review-count">{dueReviewCards.length} due now</span>
          <h3>{currentCard.front}</h3>
          <label className="text-answer">
            <span>Type the rule from memory</span>
            <input
              value={reviewInput}
              onChange={(e) => setReviewInput(e.target.value)}
              placeholder="Write the key idea before revealing the answer"
            />
          </label>
          {revealed && <p className="review-answer">{currentCard.back}</p>}
          <p className="review-anchor">{currentCard.anchor}</p>
          <div className="review-actions">
            {resolved ? (
              <Button variant="primary" onClick={nextCard}>
                Next Review Card
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={revealAnswer}>
                  Reveal And Relearn
                </Button>
                <Button variant="primary" onClick={submitRecall}>
                  Check Recall
                </Button>
              </>
            )}
          </div>
          <p className="feedback neutral">{feedback}</p>
        </article>
        <article className="memory-rules">
          <h3>How the memory loop works</h3>
          <ul>
            <li>New rules return immediately, then after 1, 3, 7, and 14 days.</li>
            <li>Weak recall lowers health and brings the card back sooner.</li>
            <li>Strong recall raises health and stretches the review gap.</li>
            <li>
              Next scheduled review:{" "}
              {nextReviewDate ? formatDate(nextReviewDate) : "Today"}
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
}
