"use client";

import { useEffect, useRef } from "react";
import { ScanLine } from "lucide-react";

interface ScanInputProps {
  value: string;
  onChange: (value: string) => void;
  onScan: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  variant?: "default" | "premium";
}

export default function ScanInput({
  value,
  onChange,
  onScan,
  placeholder = "Scan QR code here...",
  autoFocus = true,
  disabled = false,
  variant = "default",
}: ScanInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (val.trim().length >= 3) onScan(val.trim());
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      onScan(value.trim());
    }
  };

  const inputClass =
    variant === "premium"
      ? "input-field pl-11 font-mono"
      : "w-full rounded-xl border-2 border-royal/30 bg-white px-5 py-4 font-mono text-lg outline-none focus:border-royal focus:ring-2 focus:ring-royal/20 disabled:opacity-50";

  return (
    <div className="relative">
      {variant === "premium" && (
        <ScanLine className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className={inputClass}
      />
    </div>
  );
}
