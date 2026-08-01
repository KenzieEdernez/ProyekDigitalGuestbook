"use client";

import { useEffect, useState } from "react";

interface RsvpReminderToastProps {
  visible: boolean;
  onRsvp: () => void;
}

export default function RsvpReminderToast({
  visible,
  onRsvp,
}: RsvpReminderToastProps) {
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShow(false);
      setFadeOut(false);
      return;
    }

    setShow(true);
    setFadeOut(false);

    const fadeTimer = setTimeout(() => setFadeOut(true), 4500);
    const hideTimer = setTimeout(() => setShow(false), 5500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [visible]);

  if (!show) return null;

  return (
    <div
      className={`fixed left-1/2 top-20 z-[60] w-[min(92vw,22rem)] -translate-x-1/2 transition-opacity duration-700 ease-out lg:top-24 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      role="status"
    >
      <div className="rounded-2xl border border-royal/25 bg-white/95 px-5 py-4 text-center shadow-card-lg backdrop-blur-md">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-royal">
          Reminder
        </p>
        <p className="mt-2 font-display text-lg font-light text-navy">
          Please RSVP
        </p>
        <p className="mt-1.5 text-xs font-light leading-relaxed text-stone-500">
          Kindly reserve your seat so we can welcome you warmly on our special
          day.
        </p>
        <button
          type="button"
          onClick={onRsvp}
          className="mt-3 inline-flex rounded-full bg-navy px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-navy/90 active:scale-95"
        >
          RSVP Now
        </button>
      </div>
    </div>
  );
}
