"use client";

import { useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = setTimeout(() => setMounted(false), 520);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleNav = (section: InvitationSection) => {
    onClose();
    setTimeout(() => onNavigate(section), 360);
  };

  if (!mounted) return null;

  return (
    <div
      className={`menu-overlay fixed inset-0 z-[70] ${visible ? "is-visible" : "is-hiding"}`}
      aria-hidden={!visible}
      role="dialog"
      aria-modal="true"
      aria-label="Invitation navigation"
    >
      <div className="menu-backdrop absolute inset-0" onClick={onClose} />

      <aside className={`menu-panel absolute right-0 top-0 flex h-full w-[min(92vw,400px)] flex-col lg:w-[440px] ${visible ? "is-visible" : "is-hiding"}`}>
        <div className="menu-panel-glow pointer-events-none absolute inset-0" />
        <div className="menu-orb menu-orb-a pointer-events-none absolute -left-16 top-1/4 h-44 w-44 rounded-full bg-royal/15 blur-3xl" />
        <div className="menu-orb menu-orb-b pointer-events-none absolute -right-8 bottom-1/3 h-36 w-36 rounded-full bg-blush/25 blur-3xl" />

        <div className="menu-panel-content relative z-10 flex h-full flex-col">
          <div className="menu-block menu-block-header flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-8 lg:py-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 animate-pulse-soft text-royal" />
                <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-royal">
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
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 transition-colors group-hover:text-royal">
                Close
              </span>
              <X className="h-4 w-4 text-white/60 transition-all duration-300 group-hover:rotate-90 group-hover:text-royal" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6 lg:px-6 lg:py-8">
            <ul className="space-y-2.5">
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
                      className={`menu-nav-btn group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl px-4 py-4 text-left transition-all duration-300 active:scale-[0.98] lg:px-5 lg:py-4 ${
                        isActive
                          ? "bg-royal/18 text-royal shadow-[inset_3px_0_0_0_rgba(197,160,89,1)]"
                          : "text-white/80 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                          isActive
                            ? "border-royal/50 bg-royal/20 text-royal"
                            : "border-white/15 bg-white/8 text-white/70 group-hover:border-royal/35 group-hover:text-royal"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-sm font-medium tracking-wide lg:text-[15px]">
                        {label}
                      </span>
                      <ArrowRight
                        className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                          isActive
                            ? "translate-x-0 text-royal opacity-100"
                            : "-translate-x-1 text-white/30 opacity-70 group-hover:translate-x-0 group-hover:text-royal group-hover:opacity-100"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="menu-block menu-block-footer border-t border-white/10 px-6 py-6">
            <div className="text-center">
              <div className="mx-auto mb-3 h-px w-20 bg-gradient-to-r from-transparent via-royal/60 to-transparent" />
              <p className="text-[9px] uppercase tracking-[0.35em] text-white/40">
                With love &amp; gratitude
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
