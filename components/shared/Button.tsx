"use client";

import type { ReactNode, MouseEventHandler } from "react";

interface ButtonProps {
  variant: "primary" | "secondary";
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  href?: string;
  className?: string;
  disabled?: boolean;
}

export function Button({
  variant,
  children,
  onClick,
  href,
  className = "",
  disabled,
}: ButtonProps) {
  const cls = `button ${variant} ${className}`;

  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
