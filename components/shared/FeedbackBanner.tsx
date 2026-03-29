"use client";

import type { FeedbackTone, AttieMood } from "@/lib/types";
import { Attie } from "./Attie";

interface FeedbackBannerProps {
  tone: FeedbackTone;
  message: string;
  showAttie?: boolean;
}

const toneToMood: Record<FeedbackTone, AttieMood> = {
  idle: "thinking",
  correct: "celebrating",
  wrong: "sympathetic",
  loading: "thinking",
};

export function FeedbackBanner({
  tone,
  message,
  showAttie = true,
}: FeedbackBannerProps) {
  return (
    <p className={`feedback ${tone}`}>
      {showAttie && <Attie mood={toneToMood[tone]} size="sm" />}
      {message}
    </p>
  );
}
