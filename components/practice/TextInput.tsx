"use client";

import { useRef } from "react";

const ACCENT_CHARS = [
  "é", "è", "ê", "ë",
  "à", "â",
  "ù", "û",
  "î", "ï",
  "ô",
  "ç",
  "œ",
] as const;

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function TextInput({
  value,
  onChange,
  placeholder = "Write the corrected French answer here",
  label = "Type the answer",
}: TextInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function insertChar(char: string) {
    const input = inputRef.current;
    if (!input) {
      onChange(value + char);
      return;
    }

    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    const newValue = value.slice(0, start) + char + value.slice(end);
    onChange(newValue);

    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      input.selectionStart = start + char.length;
      input.selectionEnd = start + char.length;
      input.focus();
    });
  }

  return (
    <label className="text-answer">
      <span>{label}</span>
      <div className="accent-bar" role="toolbar" aria-label="French accent characters">
        {ACCENT_CHARS.map((char) => (
          <button
            key={char}
            type="button"
            className="accent-btn"
            onClick={() => insertChar(char)}
            aria-label={`Insert ${char}`}
          >
            {char}
          </button>
        ))}
      </div>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
