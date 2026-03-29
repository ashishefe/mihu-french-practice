import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "French Quest — Mihu Learning",
  description:
    "Mihika's Grade 7 French exam prep: passé composé, grammar, reading, writing, and spaced repetition.",
};

export default function FrenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
