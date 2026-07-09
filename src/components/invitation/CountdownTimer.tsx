"use client";

import { useEffect, useState } from "react";
import { getCountdownTimeLeft } from "@/lib/event-datetime";

interface CountdownTimerProps {
  target: Date | null;
}

export default function CountdownTimer({ target }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() =>
    target ? getCountdownTimeLeft(target) : null
  );
  const [tick, setTick] = useState(false);

  useEffect(() => {
    if (!target) {
      setTimeLeft(null);
      return;
    }

    setTimeLeft(getCountdownTimeLeft(target));

    const timer = setInterval(() => {
      setTimeLeft(getCountdownTimeLeft(target));
      setTick(true);
      setTimeout(() => setTick(false), 300);
    }, 1000);

    return () => clearInterval(timer);
  }, [target?.getTime()]);

  if (!target || !timeLeft) {
    return (
      <p className="text-center text-sm text-white/50">
        Set the event date in admin settings to start the countdown.
      </p>
    );
  }

  if (timeLeft.ended) {
    return (
      <p className="text-center font-display text-2xl text-royal animate-pulse-soft">
        Our big day has arrived!
      </p>
    );
  }

  const units = [
    { label: "Months", value: timeLeft.months },
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3">
      {units.map(({ label, value }) => (
        <div
          key={label}
          className={`countdown-unit rounded-2xl border border-white/10 bg-white/10 px-1.5 py-4 text-center backdrop-blur-md sm:px-2 sm:py-5 ${
            tick && label === "Seconds" ? "scale-105" : ""
          }`}
        >
          <p className="font-display text-2xl font-light text-white sm:text-3xl md:text-4xl">
            {String(value).padStart(2, "0")}
          </p>
          <p className="mt-2 text-[7px] font-bold uppercase tracking-[0.2em] text-white/40 sm:text-[8px] sm:tracking-[0.25em]">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
