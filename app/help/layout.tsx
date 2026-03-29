import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help — Mihu Learning",
  description: "Attie explains how Mihu Learning works.",
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
