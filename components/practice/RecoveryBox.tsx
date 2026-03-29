"use client";

import { Button } from "@/components/shared/Button";
import { Attie } from "@/components/shared/Attie";

interface RecoveryBoxProps {
  onRecover: () => void;
}

export function RecoveryBox({ onRecover }: RecoveryBoxProps) {
  return (
    <article className="recovery-box recovery-box-layout">
      <Attie mood="sympathetic" size="md" />
      <div>
        <h3>Recovery Camp</h3>
        <p>
          Mihika has pushed hard enough for now. Restore the run, then return
          through one worked example and one memory card.
        </p>
        <Button variant="primary" onClick={onRecover}>
          Recover Health And Lives
        </Button>
      </div>
    </article>
  );
}
