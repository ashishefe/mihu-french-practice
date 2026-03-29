"use client";

import { useProgress } from "@/components/providers/ProgressProvider";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/shared/Button";
import { Attie } from "@/components/shared/Attie";

interface HeroSectionProps {
  subjectTitle: string;
}

export function HeroSection({ subjectTitle }: HeroSectionProps) {
  const { progress } = useProgress();

  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Mihika&apos;s {subjectTitle} Quest</p>
        <h1>Learn the rule. Remember the rule. Use the rule under exam pressure.</h1>
        <p className="lede">
          This site turns Mihika&apos;s uploaded {subjectTitle} worksheets and
          practice paper into a calm game loop: teach, model, retrieve, review,
          and write. Points exist, but memory is the real boss battle.
        </p>
        <div className="hero-actions">
          <div className="hero-attie">
            <Attie mood="happy" size="lg" />
            <div className="hero-cta-group">
              <Button variant="primary" href="#arena">
                Start Today&apos;s Mission
              </Button>
              <Button variant="secondary" href="#memory">
                Review Memory Cards
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mission-card">
        <p className="mission-label">Today&apos;s balance</p>
        <div className="meter-grid">
          <StatCard label="Health" value={progress.health} />
          <StatCard label="Lives" value={progress.lives} />
          <StatCard label="Streak" value={progress.streak} />
          <StatCard label="XP" value={progress.xp} />
        </div>
        <p className="mission-note">
          Wrong answers cost energy, but every miss also triggers support. The
          goal is durable learning, not endless gaming.
        </p>
      </div>
    </section>
  );
}
