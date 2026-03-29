"use client";

import { useProgress } from "@/components/providers/ProgressProvider";
import type { Stage } from "@/lib/types";
import { Button } from "@/components/shared/Button";

interface StageGridProps {
  stages: Stage[];
  selectedStageId: string | null;
  onSelectStage: (stageId: string | null) => void;
}

export function StageGrid({ stages, selectedStageId, onSelectStage }: StageGridProps) {
  const { stageCompletion } = useProgress();

  return (
    <section className="panel">
      <div className="section-head">
        <p className="eyebrow">Route Map</p>
        <h2>Pick a stage to practice</h2>
      </div>

      {selectedStageId && (
        <div style={{ marginBottom: "0.75rem" }}>
          <Button variant="secondary" onClick={() => onSelectStage(null)}>
            ← Back to all stages
          </Button>
        </div>
      )}

      <div className="stage-grid">
        {stageCompletion.map((stage) => {
          const isSelected = selectedStageId === stage.id;
          return (
            <article
              className={`stage-card ${isSelected ? "stage-card-selected" : ""}`}
              key={stage.id}
            >
              <p className="stage-level">Level {stage.level}</p>
              <h3>{stage.title}</h3>
              <p className="stage-skill">{stage.skill}</p>
              <p>{stage.whyItMatters}</p>
              <div className="memory-box">
                <span>Mnemonic</span>
                <strong>{stage.mnemonic}</strong>
              </div>
              <div className="demo-box">
                <span>Worked example</span>
                <p>{stage.demo.prompt}</p>
                <strong>{stage.demo.answer}</strong>
                <p>{stage.demo.explanation}</p>
              </div>
              <footer>
                <span>{stage.source}</span>
                <strong>
                  {stage.mastered}/{stage.total} mastered
                </strong>
              </footer>
              <div className="stage-card-action">
                <Button
                  variant={isSelected ? "secondary" : "primary"}
                  onClick={() => onSelectStage(isSelected ? null : stage.id)}
                >
                  {isSelected ? "Practicing this stage" : `Practice ${stage.title}`}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
