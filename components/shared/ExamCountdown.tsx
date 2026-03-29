"use client";

import { useEffect, useState } from "react";

const EXAM_DATE = new Date("2026-04-15T00:00:00+05:30");

export function ExamCountdown() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    function calc() {
      const now = new Date();
      const diff = EXAM_DATE.getTime() - now.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    setDaysLeft(calc());

    const timer = setInterval(() => setDaysLeft(calc()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (daysLeft === null) return null;
  if (daysLeft <= 0) return <span className="exam-countdown exam-today">Exam day!</span>;

  const urgency =
    daysLeft <= 3 ? "exam-urgent" : daysLeft <= 7 ? "exam-soon" : "exam-calm";

  return (
    <span className={`exam-countdown ${urgency}`}>
      📅 {daysLeft} day{daysLeft !== 1 ? "s" : ""} to exam
    </span>
  );
}
