"use client";

import type { ListeningStrategy } from "@/lib/types";

interface ListeningPrepProps {
  strategies: ListeningStrategy[];
}

export function ListeningPrep({ strategies }: ListeningPrepProps) {
  return (
    <section className="panel listening-panel">
      <div className="section-head">
        <p className="eyebrow">Listening Prep</p>
        <h2>Train the ear honestly</h2>
      </div>
      <div className="listening-layout">
        <article className="listening-card listening-note">
          <h3>What we do know</h3>
          <p>
            The uploaded .docx gives the structure of the listening paper, but
            not the audio script or sound files. So this section teaches strategy
            for picture-based listening without pretending we know the missing
            answers.
          </p>
          <p className="starter-note">
            Mihika should learn to preview, predict, eliminate, and confirm on
            the second hearing.
          </p>
        </article>
        {strategies.map((strategy) => (
          <article className="listening-card" key={strategy.title}>
            <h3>{strategy.title}</h3>
            <p>{strategy.description}</p>
            <div className="memory-box">
              <span>Mini mission</span>
              <strong>{strategy.action}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
