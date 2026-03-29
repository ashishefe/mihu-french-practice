"use client";

import type { StageCompletion } from "@/lib/progress/engine";

interface StageMapProps {
  stages: StageCompletion[];
}

export function StageMap({ stages }: StageMapProps) {
  return (
    <div className="route-track" aria-label="Learning path progress">
      {stages.map((stage, index) => {
        const href =
          index < 2 ? "#arena" : index < 4 ? "#memory" : "#writing";
        return (
          <a
            key={stage.id}
            href={href}
            className={`route-node ${stage.mastered === stage.total && stage.total > 0 ? "complete" : ""}`}
          >
            <span>{index + 1}</span>
            <strong>{stage.title}</strong>
          </a>
        );
      })}
    </div>
  );
}
