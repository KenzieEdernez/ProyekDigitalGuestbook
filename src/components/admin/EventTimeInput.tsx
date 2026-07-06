"use client";

import {
  formatTime12,
  isTimePartsComplete,
  partsFromTimeString,
  type TimeParts,
  type TimePeriod,
} from "@/lib/event-time";

type EventTimeInputProps = {
  timeFrom: string;
  onChange: (timeFrom: string) => void;
  disabled?: boolean;
};

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);

export default function EventTimeInput({
  timeFrom,
  onChange,
  disabled = false,
}: EventTimeInputProps) {
  const parts = partsFromTimeString(timeFrom);

  const updateParts = (next: TimeParts) => {
    if (!isTimePartsComplete(next)) return;
    onChange(formatTime12(next));
  };

  return (
    <div className="md:col-span-2">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
        Event Time *
      </label>
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-2">
        <select
          value={parts.hour}
          onChange={(e) => updateParts({ ...parts, hour: Number(e.target.value) })}
          disabled={disabled}
          className="input-field"
        >
          {HOURS.map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
        <select
          value={parts.minute}
          onChange={(e) => updateParts({ ...parts, minute: Number(e.target.value) })}
          disabled={disabled}
          className="input-field"
        >
          {MINUTES.map((minute) => (
            <option key={minute} value={minute}>
              {String(minute).padStart(2, "0")}
            </option>
          ))}
        </select>
        <select
          value={parts.period}
          onChange={(e) =>
            updateParts({ ...parts, period: e.target.value as TimePeriod })
          }
          disabled={disabled}
          className="input-field"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
      <p className="mt-2 text-xs text-stone-400">
        Public page will show:{" "}
        <span className="font-semibold text-stone-600 dark:text-stone-300">
          At {timeFrom || "—"}
        </span>
      </p>
    </div>
  );
}
