"use client";

import { useEffect, useState } from "react";
import { getCountdownTimeLeft } from "@/lib/event-datetime";

interface CountdownTimerProps {
  target: Date | null;
  settingsReady?: boolean;
}

export default function CountdownTimer({ target, settingsReady = true }: CountdownTimerProps) {
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

  if (!settingsReady) {
    return (
      <p className="text-center text-sm text-white/50">
        Loading countdown...
      </p>
    );
  }

  if (!target || !timeLeft) {
    return (
      <p className="text-center text-sm text-white/50">
        Set the wedding date and time in Admin → Wedding Invitation Content → Wedding Events.
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
    <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
      {units.map(({ label, value }) => (
        <div
          key={label}
          className={`countdown-unit rounded-xl border border-white/10 bg-white/[0.08] px-1 py-2.5 text-center backdrop-blur-md sm:rounded-2xl sm:px-2 sm:py-4 ${
            tick && label === "Seconds" ? "scale-105" : ""
          }`}
        >
          <p className="font-display text-lg font-light text-white sm:text-2xl md:text-3xl">
            {String(value).padStart(2, "0")}
          </p>
          <p className="mt-1 text-[6px] font-bold uppercase tracking-[0.14em] text-white/35 sm:mt-1.5 sm:text-[7px] sm:tracking-[0.22em]">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
