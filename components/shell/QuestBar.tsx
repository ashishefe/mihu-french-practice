"use client";

import Link from "next/link";
import { useProgress } from "@/components/providers/ProgressProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { SignInButton } from "@/components/auth/SignInButton";
import { UserMenu } from "@/components/auth/UserMenu";
import { ExamCountdown } from "@/components/shared/ExamCountdown";

export function QuestBar() {
  const { progress, masteryPercent } = useProgress();
  const { auth } = useAuth();

  return (
    <nav className="quest-bar">
      <strong className="quest-bar-title">Mihika&apos;s French Run</strong>
      <div className="quest-bar-stats">
        <span>❤️ {progress.health}</span>
        <span>🛡️ {progress.lives}</span>
        <span>🔥 {progress.streak}</span>
        <span>⭐ {progress.xp} XP</span>
        <span>📊 {masteryPercent}%</span>
      </div>
      <ExamCountdown />
      <div className="quest-bar-actions">
        <Link href="/help" className="quest-bar-help" aria-label="Help">
          ?
        </Link>
        {auth.status === "signed-in" ? <UserMenu /> : <SignInButton />}
      </div>
    </nav>
  );
}
