"use client";

import type { PedagogyNote } from "@/lib/types";

interface ParentViewProps {
  notes: PedagogyNote[];
  sourceFiles: string[];
}

export function ParentView({ notes, sourceFiles }: ParentViewProps) {
  return (
    <section className="panel parent-panel">
      <div className="section-head">
        <p className="eyebrow">Parent View</p>
        <h2>
          Why this design should help Mihika learn rather than just chase points
        </h2>
      </div>
      <div className="notes-grid">
        {notes.map((note) => (
          <article className="note-card" key={note.title}>
            <h3>{note.title}</h3>
            <p>{note.body}</p>
          </article>
        ))}
      </div>
      <article className="source-card">
        <h3>Material used</h3>
        <ul>
          {sourceFiles.map((file) => (
            <li key={file}>{file}</li>
          ))}
        </ul>
        <p>
          Internet-informed learning design was guided by research on spacing,
          retrieval practice, and measured gamification rather than point-heavy
          distraction loops.
        </p>
        <p>
          The listening paper shell was reviewed, but no audio track was included
          in this folder, so the implemented lesson flow focuses on the text-rich
          grammar, correction, reading, and writing material that could be
          verified directly.
        </p>
      </article>
    </section>
  );
}
