"use client";

import { useState } from "react";
import { frenchSubject } from "@/lib/french-content";
import { useProgress, ProgressProvider } from "@/components/providers/ProgressProvider";
import { AuthProvider, useAuth } from "@/components/providers/AuthProvider";
import { QuestBar } from "@/components/shell/QuestBar";
import { HeroSection } from "@/components/shell/HeroSection";
import { StageGrid } from "@/components/shell/StageGrid";
import { StatCard } from "@/components/shared/StatCard";
import { MemoryGarden } from "@/components/memory/MemoryGarden";
import { PracticeArena } from "@/components/practice/PracticeArena";
import { WritingQuest } from "@/components/writing/WritingQuest";
import { ListeningPrep } from "@/components/listening/ListeningPrep";
import { ParentView } from "@/components/parent/ParentView";

function FrenchContent() {
  const { totalCorrect, totalWrong, dueReviewCards, masteryPercent, mounted } =
    useProgress();
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  if (!mounted) {
    return <main className="shell loading">Loading Mihika&apos;s quest...</main>;
  }

  return (
    <main className="shell">
      <QuestBar />

      <HeroSection subjectTitle="French" />

      <section className="stats-strip">
        <StatCard label="Mastery" value={`${masteryPercent}%`} />
        <StatCard label="Questions solved" value={totalCorrect} />
        <StatCard label="Corrections needed" value={totalWrong} />
        <StatCard label="Memory reviews due" value={dueReviewCards.length} />
      </section>

      <StageGrid
        stages={frenchSubject.stages}
        selectedStageId={selectedStageId}
        onSelectStage={setSelectedStageId}
      />

      <PracticeArena
        questions={frenchSubject.questions}
        stages={frenchSubject.stages}
        selectedStageId={selectedStageId}
      />

      <MemoryGarden allCards={frenchSubject.reviewCards} />

      {frenchSubject.writingPrompts && (
        <WritingQuest prompts={frenchSubject.writingPrompts} />
      )}

      {frenchSubject.listeningStrategies && (
        <ListeningPrep strategies={frenchSubject.listeningStrategies} />
      )}

      {frenchSubject.pedagogyNotes && frenchSubject.sourceFiles && (
        <ParentView
          notes={frenchSubject.pedagogyNotes}
          sourceFiles={frenchSubject.sourceFiles}
        />
      )}
    </main>
  );
}

function FrenchWithProgress() {
  const { auth } = useAuth();

  return (
    <ProgressProvider
      subject={frenchSubject}
      accessToken={auth.accessToken}
    >
      <FrenchContent />
    </ProgressProvider>
  );
}

export default function FrenchPage() {
  return (
    <AuthProvider>
      <FrenchWithProgress />
    </AuthProvider>
  );
}
