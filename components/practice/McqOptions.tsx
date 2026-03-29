"use client";

interface McqOptionsProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

export function McqOptions({ options, selected, onSelect }: McqOptionsProps) {
  return (
    <div className="options-grid" role="radiogroup" aria-label="Answer options">
      {options.map((option) => (
        <button
          key={option}
          role="radio"
          aria-checked={selected === option}
          className={`option ${selected === option ? "selected" : ""}`}
          onClick={() => onSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
