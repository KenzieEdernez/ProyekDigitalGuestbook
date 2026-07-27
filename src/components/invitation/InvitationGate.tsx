"use client";

import { useEffect, useState } from "react";

type InvitationGateProps = {
  /** Doors should play the open animation. */
  opening?: boolean;
  /** Invitation is fully open; gate stays as persistent border. */
  opened?: boolean;
};

/**
 * Watercolor gate + swinging doors.
 * Fixed overlay: roof/pillars/doors stay as a viewport border while content scrolls through the portal.
 */
export default function InvitationGate({
  opening = false,
  opened = false,
}: InvitationGateProps) {
  const [doorsOpen, setDoorsOpen] = useState(opened && !opening);

  useEffect(() => {
    if (opened && !opening) {
      setDoorsOpen(true);
      return;
    }
    if (!opening) return;

    // Start closed for one frame, then swing open
    setDoorsOpen(false);
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setDoorsOpen(true));
    });
    return () => window.cancelAnimationFrame(id);
  }, [opening, opened]);

  const settled = opened && !opening;

  return (
    <div
      className={`invitation-gate pointer-events-none fixed inset-0 z-[35] flex items-center justify-center ${
        settled ? "is-settled" : ""
      } ${doorsOpen ? "is-opening" : "is-closed"}`}
      aria-hidden
    >
      <div className="gate-stage">
        <div className="gate-backdrop" />

        <div className="gate-art">
          <div className={`gate-shutter ${doorsOpen ? "is-open" : ""}`} />

          <img
            src="/invitation/gate/frame.png"
            alt=""
            className="gate-frame"
            draggable={false}
          />

          <div className={`gate-doors ${doorsOpen ? "is-open" : ""}`}>
            <div className="gate-door gate-door-left">
              <img
                src="/invitation/gate/door-left.png"
                alt=""
                draggable={false}
              />
            </div>
            <div className="gate-door gate-door-right">
              <img
                src="/invitation/gate/door-right.png"
                alt=""
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
