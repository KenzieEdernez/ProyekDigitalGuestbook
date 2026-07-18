"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { resolveHeroImages } from "@/lib/hero-images";
import type { InvitationCopy } from "@/types/wedding";

interface InvitationCoverProps {
  guestName: string | null;
  heroImage: string;
  heroImagePortrait: string;
  heroImageCard: string;
  coupleName: string;
  copy: InvitationCopy;
  onOpen: () => void;
  onPrimeMusic?: () => void;
  isExiting?: boolean;
}

export default function InvitationCover({
  guestName,
  heroImage,
  heroImagePortrait,
  heroImageCard,
  coupleName,
  copy,
  onOpen,
  onPrimeMusic,
  isExiting = false,
}: InvitationCoverProps) {
  const [visible, setVisible] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);
  const [scale, setScale] = useState(1);
  const shellRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const heroes = resolveHeroImages({
    heroImage,
    heroImagePortrait,
    heroImageCard,
  });

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    const card = cardRef.current;
    if (!shell || !card) return;

    const fit = () => {
      card.style.transform = "scale(1)";
      const available = shell.clientHeight;
      const needed = card.scrollHeight;
      if (!available || !needed) {
        setScale(1);
        return;
      }
      setScale(Math.min(1, available / needed));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(shell);
    observer.observe(card);
    window.addEventListener("resize", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [heroes.landscape, guestName, copy.coverMessage, copy.engagementTitle]);

  const handleOpen = () => {
    setBtnPressed(true);
    onOpen();
  };

  return (
    <div
      className={`invitation-cover relative min-h-[100dvh] overflow-hidden transition-opacity duration-700 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="invitation-cover-bg absolute inset-0 scale-[1.03] md:hidden"
        style={{ backgroundImage: `url('${heroes.portrait}')` }}
      />
      <div
        className="invitation-cover-bg absolute inset-0 hidden scale-[1.03] md:block"
        style={{ backgroundImage: `url('${heroes.landscape}')` }}
      />
      <div className="absolute inset-0 bg-navy-900/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/20 via-transparent to-navy-900/58" />

      <div
        ref={shellRef}
        className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-6 sm:px-6"
      >
        <div
          ref={cardRef}
          className={`invitation-cover-card ${
            visible && !isExiting
              ? "opacity-100"
              : "opacity-0"
          } transition-opacity duration-[1.1s] ease-out-expo`}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <div className="invitation-cover-card-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroes.landscape}
              alt=""
              onLoad={() => {
                const shell = shellRef.current;
                const card = cardRef.current;
                if (!shell || !card) return;
                card.style.transform = "scale(1)";
                const available = shell.clientHeight;
                const needed = card.scrollHeight;
                setScale(
                  available && needed ? Math.min(1, available / needed) : 1
                );
              }}
            />
          </div>

          <div className="invitation-cover-card-body">
            <p className="invitation-cover-kicker">{copy.engagementTitle}</p>

            <h1 className="invitation-cover-names font-display">{coupleName}</h1>

            <div className="invitation-cover-rule" aria-hidden />

            {guestName && (
              <p className="invitation-cover-guest font-display">
                <span>Dear</span>
                {guestName}
              </p>
            )}

            <p className="invitation-cover-message">{copy.coverMessage}</p>

            <button
              onPointerDown={onPrimeMusic}
              onClick={handleOpen}
              disabled={btnPressed}
              className={`btn-invite-primary invitation-cover-cta inline-flex items-center justify-center gap-1.5 ${
                btnPressed ? "scale-95 opacity-70" : ""
              }`}
            >
              <span>{copy.openButtonLabel}</span>
              <ChevronDown className="invitation-cover-cta-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
