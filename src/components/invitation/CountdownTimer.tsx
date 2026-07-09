"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: string;
}

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    ended: false,
  };
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() =>
    getTimeLeft(new Date(targetDate))
  );
  const [tick, setTick] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate);
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
      setTick(true);
      setTimeout(() => setTick(false), 300);
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  if (timeLeft.ended) {
    return (
      <p className="text-center font-display text-2xl text-royal animate-pulse-soft">
        Our big day has arrived!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {units.map(({ label, value }) => (
        <div
          key={label}
          className={`countdown-unit rounded-2xl border border-white/10 bg-white/10 px-2 py-5 text-center backdrop-blur-md ${
            tick && label === "Detik" ? "scale-105" : ""
          }`}
        >
          <p className="font-display text-3xl font-light text-white md:text-4xl">
            {String(value).padStart(2, "0")}
          </p>
          <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.25em] text-white/40">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
