"use client";

import { useEffect, useState } from "react";
import { Menu, X, Volume2, VolumeX } from "lucide-react";
import { NAV_ITEMS, type InvitationSection } from "@/lib/wedding-config";

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
      {/* Desktop side nav */}
      <nav className="fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 lg:block">
        <div className="rounded-2xl border border-white/10 bg-navy/80 p-3 shadow-card-lg backdrop-blur-xl">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ id, label }) => (
              <li key={id}>
                <button
                  onClick={() => handleNav(id)}
                  className={`flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-xs font-medium transition ${
                    active === id
                      ? "bg-royal/20 text-royal"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {active === id && (
                    <span className="h-1.5 w-1.5 rounded-full bg-royal" />
                  )}
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200/80 bg-white/95 px-2 py-2 backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          {NAV_ITEMS.slice(0, 5).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-[9px] font-semibold uppercase tracking-wide transition ${
                active === id ? "text-royal" : "text-stone-400"
              }`}
            >
              <span
                className={`h-1 w-1 rounded-full transition ${
                  active === id ? "bg-royal" : "bg-transparent"
                }`}
              />
              {label}
            </button>
          ))}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-[9px] font-semibold uppercase tracking-wide text-stone-400"
          >
            <Menu className="h-4 w-4" />
            Menu
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-navy p-6 pb-10 shadow-card-lg">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-royal">
                Menu Undangan
              </p>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-full p-2 text-white/60 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="space-y-2">
              {NAV_ITEMS.map(({ id, label }) => (
                <li key={id}>
                  <button
                    onClick={() => handleNav(id)}
                    className={`w-full rounded-xl px-4 py-3.5 text-left text-sm font-medium transition ${
                      active === id
                        ? "bg-royal/20 text-royal"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Music toggle */}
      <button
        onClick={onToggleMusic}
        className="fixed bottom-20 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white shadow-card transition hover:border-royal lg:bottom-6"
        aria-label={musicPlaying ? "Matikan musik" : "Putar musik"}
      >
        {musicPlaying ? (
          <Volume2 className="h-4 w-4 text-royal" />
        ) : (
          <VolumeX className="h-4 w-4 text-stone-400" />
        )}
      </button>
    </>
  );
}
