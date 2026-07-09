"use client";

import {
  ceremonyDateFromInput,
  formatCeremonyDateDisplay,
  toCeremonyDateInputValue,
} from "@/lib/ceremony-date";

type CeremonyDateInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
};

export default function CeremonyDateInput({
  value,
  onChange,
  disabled = false,
  label = "Date",
}: CeremonyDateInputProps) {
  const inputValue = toCeremonyDateInputValue(value);
  const preview = value ? formatCeremonyDateDisplay(inputValue) || value : "—";

  return (
    <div className="mb-3">
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
        {label}
      </label>
      <input
        type="date"
        value={inputValue}
        onChange={(e) => onChange(ceremonyDateFromInput(e.target.value))}
        disabled={disabled}
        className="input-field"
      />
      <p className="mt-2 text-xs text-stone-400">
        Public page will show:{" "}
        <span className="font-semibold text-stone-600 dark:text-stone-300">
          {preview}
        </span>
      </p>
    </div>
  );
}
