"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
}

export function StatCard({ label, value, className = "" }: StatCardProps) {
  return (
    <article className={`stat-card ${className}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
