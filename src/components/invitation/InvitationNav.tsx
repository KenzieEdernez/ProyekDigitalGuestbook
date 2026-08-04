"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import HamburgerButton from "@/components/invitation/HamburgerButton";
import MenuOverlay from "@/components/invitation/MenuOverlay";
import RsvpFabIcon from "@/components/invitation/RsvpFabIcon";
import RsvpReminderToast from "@/components/invitation/RsvpReminderToast";
import type { InvitationSection } from "@/lib/wedding-config";

interface InvitationNavProps {
  active: InvitationSection;
  coupleName: string;
  onNavigate: (section: InvitationSection) => void;
  musicPlaying: boolean;
  musicAvailable?: boolean;
  onToggleMusic: () => void;
  showRsvpReminder?: boolean;
  onRsvpReminder?: () => void;
  onRsvpReminderDismiss?: () => void;
  rsvpReminderEyebrow?: string;
  rsvpReminderTitle?: string;
  rsvpReminderMessage?: string;
}

export default function InvitationNav({
  active,
  coupleName,
  onNavigate,
  musicPlaying,
  musicAvailable = false,
  onToggleMusic,
  showRsvpReminder = false,
  onRsvpReminder,
  onRsvpReminderDismiss,
  rsvpReminderEyebrow,
  rsvpReminderTitle,
  rsvpReminderMessage,
}: InvitationNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 16);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const handleNav = (section: InvitationSection) => {
    setMenuOpen(false);
    onNavigate(section);
  };

  return (
    <>
      <header
        className={`invitation-header sticky top-0 px-4 py-3 lg:px-10 lg:py-4 ${
          menuOpen ? "z-[201] is-menu-open" : "z-50"
        } is-dark ${scrolled ? "is-scrolled" : ""}`}
      >
        <div className="invitation-header-inner relative flex items-center justify-between">
          <button
            onClick={() => handleNav("home")}
            className="group min-w-0 text-left"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.38em] text-royal/75 transition-all duration-500 group-hover:tracking-[0.42em] group-hover:text-royal">
              The Wedding of
            </p>
            <p className="truncate font-display text-base font-light text-white transition-all duration-500 group-hover:text-royal/90 lg:text-lg">
              {coupleName}
            </p>
          </button>

          <HamburgerButton
            open={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            elevated={menuOpen}
          />
        </div>
      </header>

      <MenuOverlay
        open={menuOpen}
        active={active}
        coupleName={coupleName}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNav}
      />

      <div className="invitation-fab-stack fixed bottom-6 right-4 z-40 flex flex-col items-end gap-3 lg:bottom-8 lg:right-8">
        {showRsvpReminder && (
          <RsvpReminderToast
            visible={showRsvpReminder}
            eyebrow={rsvpReminderEyebrow}
            title={rsvpReminderTitle}
            message={rsvpReminderMessage}
            onRsvp={() => {
              onRsvpReminder?.();
              handleNav("rsvp");
            }}
            onDismiss={onRsvpReminderDismiss}
          />
        )}

        <button
          type="button"
          onClick={() => {
            onRsvpReminderDismiss?.();
            handleNav("rsvp");
          }}
          className="invitation-fab-rsvp"
          aria-label="RSVP"
        >
          <RsvpFabIcon className="h-8 w-8" />
        </button>

        {musicAvailable && (
          <button
            type="button"
            onClick={onToggleMusic}
            className="invitation-fab-music"
            aria-label={musicPlaying ? "Pause music" : "Play music"}
          >
            {musicPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current translate-x-0.5" />
            )}
          </button>
        )}
      </div>
    </>
  );
}
