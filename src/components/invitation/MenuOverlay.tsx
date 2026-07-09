"use client";

import { useEffect } from "react";
import {
  ArrowRight,
  Calendar,
  ClipboardCheck,
  Gift,
  Heart,
  Home,
  ImageIcon,
  Mail,
  Sparkles,
  X,
} from "lucide-react";
import { NAV_ITEMS, type InvitationSection } from "@/lib/wedding-config";

const NAV_ICONS: Record<InvitationSection, React.ElementType> = {
  home: Home,
  couple: Heart,
  event: Calendar,
  gallery: ImageIcon,
  rsvp: ClipboardCheck,
  wishes: Mail,
  gift: Gift,
};

interface MenuOverlayProps {
  open: boolean;
  active: InvitationSection;
  coupleName: string;
  onClose: () => void;
  onNavigate: (section: InvitationSection) => void;
}

export default function MenuOverlay({
  open,
  active,
  coupleName,
  onClose,
  onNavigate,
}: MenuOverlayProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleNav = (section: InvitationSection) => {
    onClose();
    requestAnimationFrame(() => {
      setTimeout(() => onNavigate(section), 320);
    });
  };

  return (
    <div
      className={`menu-overlay fixed inset-0 z-[70] ${
        open ? "menu-overlay-open" : "menu-overlay-closed"
      }`}
      aria-hidden={!open}
    >
      <div className="menu-backdrop absolute inset-0" onClick={onClose} />

      <aside
        className={`menu-panel absolute right-0 top-0 flex h-full w-[min(92vw,400px)] flex-col overflow-hidden lg:w-[440px] ${
          open ? "menu-panel-open" : "menu-panel-closed"
        }`}
      >
        <div className="menu-panel-glow pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -left-20 top-1/4 h-40 w-40 rounded-full bg-royal/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-1/4 h-32 w-32 rounded-full bg-blush/20 blur-3xl" />

        <div className="relative flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-8 lg:py-6">
          <div className="menu-header-reveal">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-royal" />
              <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-royal/90">
                Navigation
              </p>
            </div>
            <p className="font-display text-xl font-light text-white lg:text-2xl">
              {coupleName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="menu-close-btn group flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 transition-all duration-300 hover:border-royal/50 hover:bg-royal/10 active:scale-95"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 transition-colors group-hover:text-royal">
              Close
            </span>
            <X className="h-4 w-4 text-white/50 transition-all duration-300 group-hover:rotate-90 group-hover:text-royal" />
          </button>
        </div>

        <nav className="relative flex-1 overflow-y-auto px-4 py-6 lg:px-6 lg:py-8">
          <ul className="space-y-2">
            {NAV_ITEMS.map(({ id, label }, i) => {
              const isActive = active === id;
              const Icon = NAV_ICONS[id];
              return (
                <li
                  key={id}
                  className="menu-nav-item"
                  style={{ "--item-index": i } as React.CSSProperties}
                >
                  <button
                    onClick={() => handleNav(id)}
                    className={`menu-nav-btn group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl px-4 py-4 text-left transition-all duration-400 ease-out-expo active:scale-[0.98] lg:px-5 lg:py-4 ${
                      isActive
                        ? "bg-royal/15 text-royal shadow-[inset_3px_0_0_0_rgba(197,160,89,0.9)]"
                        : "text-white/65 hover:bg-white/6 hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-400 ${
                        isActive
                          ? "border-royal/40 bg-royal/15 text-royal scale-105"
                          : "border-white/10 bg-white/5 text-white/40 group-hover:border-royal/25 group-hover:text-royal/80"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-sm font-medium tracking-wide lg:text-base">
                      {label}
                    </span>
                    <ArrowRight
                      className={`h-4 w-4 shrink-0 transition-all duration-400 ${
                        isActive
                          ? "translate-x-0 text-royal opacity-100"
                          : "-translate-x-2 text-white/20 opacity-0 group-hover:translate-x-0 group-hover:text-royal/60 group-hover:opacity-100"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="relative border-t border-white/10 px-6 py-6">
          <div className="menu-footer-reveal text-center">
            <div className="mx-auto mb-3 h-px w-16 bg-gradient-to-r from-transparent via-royal/50 to-transparent" />
            <p className="text-[9px] uppercase tracking-[0.35em] text-white/30">
              With love & gratitude
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
