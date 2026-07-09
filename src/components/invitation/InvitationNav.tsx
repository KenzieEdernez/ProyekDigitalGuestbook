"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import HamburgerButton from "@/components/invitation/HamburgerButton";
import MenuOverlay from "@/components/invitation/MenuOverlay";
import type { InvitationSection } from "@/lib/wedding-config";

interface InvitationNavProps {
  active: InvitationSection;
  coupleName: string;
  onNavigate: (section: InvitationSection) => void;
  musicPlaying: boolean;
  onToggleMusic: () => void;
}

export default function InvitationNav({
  active,
  coupleName,
  onNavigate,
  musicPlaying,
  onToggleMusic,
}: InvitationNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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

  const toggleMenu = () => setMenuOpen((v) => !v);

  return (
    <>
      <header
        className={`sticky top-0 flex items-center justify-between border-b px-4 py-3 transition-all duration-500 lg:px-10 lg:py-4 ${
          menuOpen ? "z-[201]" : "z-50"
        } ${
          scrolled || menuOpen
            ? "border-white/10 bg-navy/92 shadow-card backdrop-blur-xl"
            : "border-transparent bg-navy/75 backdrop-blur-md"
        }`}
      >
        <button
          onClick={() => handleNav("home")}
          className="group text-left transition-opacity hover:opacity-90"
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-royal/80 transition-colors group-hover:text-royal">
            The Wedding of
          </p>
          <p className="font-display text-base font-light text-white transition-transform duration-300 group-hover:translate-x-0.5 lg:text-lg">
            {coupleName}
          </p>
        </button>

        <HamburgerButton
          open={menuOpen}
          onClick={toggleMenu}
          elevated={menuOpen}
          className={menuOpen ? "z-[202]" : ""}
        />
      </header>

      <MenuOverlay
        open={menuOpen}
        active={active}
        coupleName={coupleName}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNav}
      />

      <button
        onClick={onToggleMusic}
        className={`fixed bottom-6 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border shadow-card transition-all duration-300 ease-out-expo hover:scale-105 active:scale-95 lg:bottom-8 lg:right-8 ${
          musicPlaying
            ? "border-royal/40 bg-royal/10"
            : "border-stone-200 bg-white hover:border-royal/30"
        }`}
        aria-label={musicPlaying ? "Mute music" : "Play music"}
      >
        {musicPlaying ? (
          <Volume2 className="h-4 w-4 animate-pulse-soft text-royal" />
        ) : (
          <VolumeX className="h-4 w-4 text-stone-400" />
        )}
      </button>
    </>
  );
}
