"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Camera,
  Gift,
  Heart,
  Home,
  Menu,
  MessageCircle,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { NAV_ITEMS, type InvitationSection } from "@/lib/wedding-config";

const NAV_ICONS: Record<InvitationSection, React.ElementType> = {
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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleNav = (section: InvitationSection) => {
    setMenuOpen(false);
    onNavigate(section);
  };

  return (
    <>
      {/* Desktop floating nav */}
      <nav
        className={`fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 transition-all duration-500 ease-out-expo lg:block ${
          scrolled ? "opacity-100" : "opacity-80"
        }`}
      >
        <div className="rounded-2xl border border-white/10 bg-navy/90 p-2 shadow-card-lg backdrop-blur-xl">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ id, label }) => {
              const Icon = NAV_ICONS[id];
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
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-royal transition-all duration-400" />
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

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="mx-3 mb-3 overflow-hidden rounded-2xl border border-white/20 bg-navy/90 shadow-card-lg backdrop-blur-xl">
          <div className="flex items-center justify-between px-1 py-1.5">
            {NAV_ITEMS.slice(0, 4).map(({ id, label }) => {
              const Icon = NAV_ICONS[id];
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
                    {label}
                  </span>
                </button>
              );
            })}
            <button
              onClick={() => setMenuOpen(true)}
              className="nav-pill flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2.5 text-white/40 transition-all active:scale-95"
            >
              <Menu className="h-4 w-4" />
              <span className="text-[8px] font-semibold uppercase tracking-wide">
                Menu
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu sheet */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-500 ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm transition-opacity duration-500"
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={`absolute bottom-0 left-0 right-0 rounded-t-3xl bg-navy p-6 pb-12 shadow-card-lg transition-transform duration-500 ease-out-expo ${
            menuOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-royal">
              Menu Undangan
            </p>
            <button
              onClick={() => setMenuOpen(false)}
              className="rounded-full p-2 text-white/50 transition-all hover:bg-white/10 active:scale-90"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <ul className="grid grid-cols-2 gap-2">
            {NAV_ITEMS.map(({ id, label }, i) => {
              const Icon = NAV_ICONS[id];
              const isActive = active === id;
              return (
                <li
                  key={id}
                  className="transition-all duration-500"
                  style={{
                    transitionDelay: menuOpen ? `${i * 50}ms` : "0ms",
                    opacity: menuOpen ? 1 : 0,
                    transform: menuOpen ? "translateY(0)" : "translateY(16px)",
                  }}
                >
                  <button
                    onClick={() => handleNav(id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium transition-all active:scale-95 ${
                      isActive
                        ? "bg-royal/20 text-royal"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

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
