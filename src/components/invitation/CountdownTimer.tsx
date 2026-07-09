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

  useEffect(() => {
    const target = new Date(targetDate);
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: "Hari", value: timeLeft.days },
    { label: "Jam", value: timeLeft.hours },
    { label: "Menit", value: timeLeft.minutes },
    { label: "Detik", value: timeLeft.seconds },
  ];

  if (timeLeft.ended) {
    return (
      <p className="text-center font-serif text-lg text-royal">
        Hari bahagia telah tiba!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {units.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-xl border border-royal/20 bg-white/80 px-2 py-4 text-center backdrop-blur-sm"
        >
          <p className="font-serif text-2xl font-bold text-navy md:text-3xl">
            {String(value).padStart(2, "0")}
          </p>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-stone-400">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
