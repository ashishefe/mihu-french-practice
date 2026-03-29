"use client";

import Image from "next/image";
import type { AttieMood } from "@/lib/types";

const moodToFile: Record<AttieMood, string> = {
  happy: "/attie/happy.webp",
  thinking: "/attie/thinking.webp",
  sympathetic: "/attie/sympathetic.webp",
  celebrating: "/attie/celebrating.webp",
};

const moodToAlt: Record<AttieMood, string> = {
  happy: "Attie wagging tail happily",
  thinking: "Attie tilting head, thinking",
  sympathetic: "Attie holding a book encouragingly",
  celebrating: "Attie celebrating with confetti",
};

const sizes = {
  sm: 48,
  md: 80,
  lg: 140,
} as const;

interface AttieProps {
  mood: AttieMood;
  size?: keyof typeof sizes;
  className?: string;
}

export function Attie({ mood, size = "md", className = "" }: AttieProps) {
  const px = sizes[size];

  return (
    <Image
      src={moodToFile[mood]}
      alt={moodToAlt[mood]}
      width={px}
      height={px}
      className={`attie attie-${size} ${className}`}
      priority={size === "lg"}
    />
  );
}
