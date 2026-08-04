"use client";

import { useEffect, useState } from "react";

interface RsvpReminderToastProps {
  visible: boolean;
  onRsvp: () => void;
  onDismiss?: () => void;
  eyebrow?: string;
  title?: string;
  message?: string;
}

/** Chat-bubble reminder that points down toward the RSVP FAB. */
export default function RsvpReminderToast({
  visible,
  onRsvp,
  onDismiss,
  eyebrow = "Reminder",
  title = "Please RSVP",
  message = "Tap here to reserve your seat.",
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
    const hideTimer = setTimeout(() => {
      setShow(false);
      onDismiss?.();
    }, 5500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [visible, onDismiss]);

  if (!show) return null;

  return (
    <div
      className={`rsvp-chat-bubble relative mb-1 w-[min(72vw,13.5rem)] transition-all duration-700 ease-out ${
        fadeOut ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"
      }`}
      role="status"
    >
      <button
        type="button"
        onClick={onRsvp}
        className="block w-full rounded-2xl bg-white px-3.5 py-3 text-left shadow-[0_10px_28px_rgba(26,35,50,0.18)] ring-1 ring-black/5"
      >
        {eyebrow.trim() ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7355]">
            {eyebrow}
          </p>
        ) : null}
        {title.trim() ? (
          <p className="mt-1 font-display text-[1.05rem] font-light leading-snug text-navy whitespace-pre-line">
            {title}
          </p>
        ) : null}
        {message.trim() ? (
          <p className="mt-1 text-[11px] font-light leading-relaxed text-stone-500 whitespace-pre-line">
            {message}
          </p>
        ) : null}
      </button>
      {/* Tail pointing down-right toward the RSVP button */}
      <span className="rsvp-chat-tail" aria-hidden />
    </div>
  );
}
