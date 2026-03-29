"use client";

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
  return (
    <label className="text-answer">
      <span>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
