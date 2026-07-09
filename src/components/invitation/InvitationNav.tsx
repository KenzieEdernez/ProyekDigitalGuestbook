"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Camera,
  Gift,
  Heart,
  Home,
  MessageCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import HamburgerButton from "@/components/invitation/HamburgerButton";
import MobileMenuOverlay from "@/components/invitation/MobileMenuOverlay";
import { NAV_ITEMS, type InvitationSection } from "@/lib/wedding-config";

const QUICK_NAV: InvitationSection[] = ["home", "couple", "rsvp", "gallery"];

const QUICK_ICONS: Record<InvitationSection, React.ElementType> = {
  home: Home,
  couple: Heart,
  event: Calendar,
  gallery: Camera,
  rsvp: Heart,
  gift: Gift,
  wishes: MessageCircle,
};

interface InvitationNavProps {
  active: InvitationSection;
  onNavigate: (section: InvitationSection) => void;
  musicPlaying: boolean;
  onToggleMusic: () => void;
}

export default function InvitationNav({
  active,
  onNavigate,
  musicPlaying,
  onToggleMusic,
}: InvitationNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (section: InvitationSection) => {
    onNavigate(section);
  };

  return (
    <>
      {/* Mobile: top bar with hamburger */}
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-navy/75 px-4 py-3 shadow-card backdrop-blur-xl transition-all duration-500 lg:hidden">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/50">
          Undangan
        </p>
        <HamburgerButton
          open={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        />
      </header>

      <MobileMenuOverlay
        open={menuOpen}
        active={active}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNav}
      />

      {/* Desktop floating nav */}
      <nav
        className={`fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 transition-all duration-500 ease-out-expo lg:block ${
          scrolled ? "opacity-100" : "opacity-80"
        }`}
      >
        <div className="rounded-2xl border border-white/10 bg-navy/90 p-2 shadow-card-lg backdrop-blur-xl">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ id, label }) => {
              const Icon = QUICK_ICONS[id];
              const isActive = active === id;
              return (
                <li key={id}>
                  <button
                    onClick={() => handleNav(id)}
                    className={`nav-pill group relative flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[11px] font-medium ${
                      isActive
                        ? "bg-royal/15 text-royal"
                        : "text-white/50 hover:bg-white/5 hover:text-white/80"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-royal" />
                    )}
                    <Icon
                      className={`h-3.5 w-3.5 transition-transform duration-300 ${
                        isActive ? "scale-110" : "group-hover:scale-105"
                      }`}
                    />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile bottom quick nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="mx-3 mb-3 overflow-hidden rounded-2xl border border-white/15 bg-navy/90 shadow-card-lg backdrop-blur-xl">
          <div className="flex items-center justify-between px-1 py-1.5">
            {QUICK_NAV.map((id) => {
              const item = NAV_ITEMS.find((n) => n.id === id)!;
              const Icon = QUICK_ICONS[id];
              const isActive = active === id;
              return (
                <button
                  key={id}
                  onClick={() => handleNav(id)}
                  className={`nav-pill flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2.5 transition-all duration-300 ${
                    isActive
                      ? "bg-royal/15 text-royal"
                      : "text-white/40 active:scale-95"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "scale-110" : ""}`} />
                  <span className="text-[8px] font-semibold uppercase tracking-wide">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Music toggle */}
      <button
        onClick={onToggleMusic}
        className={`fixed bottom-24 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border shadow-card transition-all duration-300 ease-out-expo hover:scale-105 active:scale-95 lg:bottom-6 ${
          musicPlaying
            ? "border-royal/40 bg-royal/10"
            : "border-stone-200 bg-white hover:border-royal/30"
        }`}
        aria-label={musicPlaying ? "Matikan musik" : "Putar musik"}
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
