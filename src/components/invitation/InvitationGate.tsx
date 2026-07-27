"use client";

import { useEffect, useState } from "react";

type InvitationGateProps = {
  opening?: boolean;
  opened?: boolean;
};

function LatticePanel({
  className = "",
  showEmblem = false,
}: {
  className?: string;
  showEmblem?: boolean;
}) {
  return (
    <div className={`gate-lattice ${className}`}>
      <span className="gate-lattice-grid" />
      <span className="gate-lattice-diamond" />
      {showEmblem ? <span className="gate-lattice-emblem" /> : null}
    </div>
  );
}

function GateDoorFace() {
  return (
    <div className="gate-door-face">
      <div className="gate-door-rail gate-door-rail-top" />
      <div className="gate-door-upper">
        <LatticePanel />
      </div>
      <div className="gate-door-mid">
        <span className="gate-door-handle" />
      </div>
      <div className="gate-door-lower">
        <span className="gate-door-panel" />
      </div>
      <div className="gate-door-rail gate-door-rail-bottom" />
      <span className="gate-door-edge" />
    </div>
  );
}

/**
 * CSS-painted Chinese gate + swinging doors as a fixed viewport border.
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

    setDoorsOpen(false);
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setDoorsOpen(true));
    });
    return () => window.cancelAnimationFrame(id);
  }, [opening, opened]);

  return (
    <div
      className={`invitation-gate pointer-events-none fixed inset-0 z-[35] ${
        doorsOpen ? "is-open" : "is-closed"
      }`}
      aria-hidden
    >
      <div className="gate-shell">
        {/* Roof */}
        <div className="gate-roof">
          <div className="gate-roof-ridge" />
          <div className="gate-roof-tiles" />
          <div className="gate-roof-eave gate-roof-eave-left" />
          <div className="gate-roof-eave gate-roof-eave-right" />
          <div className="gate-roof-beam" />
          <span className="gate-roof-finial" />
        </div>

        {/* Transom */}
        <div className="gate-transom">
          <LatticePanel showEmblem className="gate-transom-lattice" />
        </div>

        {/* Pillars */}
        <div className="gate-pillar gate-pillar-left">
          <span className="gate-pillar-cap" />
          <span className="gate-pillar-body" />
          <span className="gate-pillar-base" />
        </div>
        <div className="gate-pillar gate-pillar-right">
          <span className="gate-pillar-cap" />
          <span className="gate-pillar-body" />
          <span className="gate-pillar-base" />
        </div>

        {/* Threshold */}
        <div className="gate-threshold" />

        {/* Doors */}
        <div className="gate-portal">
          <div className={`gate-shutter ${doorsOpen ? "is-open" : ""}`} />
          <div className={`gate-doors ${doorsOpen ? "is-open" : ""}`}>
            <div className="gate-door gate-door-left">
              <GateDoorFace />
            </div>
            <div className="gate-door gate-door-right">
              <GateDoorFace />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
