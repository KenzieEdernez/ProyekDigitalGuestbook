"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  Calendar,
  ClipboardCheck,
  Gift,
  Heart,
  Home,
  ImageIcon,
  Mail,
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
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  useEffect(() => {
    if (open) {
      setAnimKey((k) => k + 1);
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = setTimeout(() => setMounted(false), 480);
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
    onNavigate(section);
  };

  if (!mounted || !portalRoot) return null;

  return createPortal(
    <div
      className={`menu-overlay fixed inset-0 z-[200] h-[100dvh] w-screen ${visible ? "is-visible" : "is-hiding"}`}
      aria-hidden={!visible}
      role="dialog"
      aria-modal="true"
      aria-label="Invitation navigation"
    >
      <div className="menu-backdrop absolute inset-0" onClick={onClose} />

      <aside
        className={`menu-panel absolute right-0 top-0 flex h-[100dvh] w-[min(90vw,420px)] flex-col lg:w-[460px] ${visible ? "is-visible" : "is-hiding"}`}
      >
        <div className="menu-panel-shimmer pointer-events-none absolute bottom-0 left-0 top-0 w-px" />
        <div className="menu-panel-texture pointer-events-none absolute inset-0" />
        <div className="menu-panel-glow pointer-events-none absolute inset-0" />
        <div className="menu-orb menu-orb-a pointer-events-none absolute -left-20 top-[18%] h-48 w-48 rounded-full" />
        <div className="menu-orb menu-orb-b pointer-events-none absolute -right-10 bottom-[22%] h-40 w-40 rounded-full" />

        <div className="menu-panel-content relative z-10 flex h-full min-h-0 flex-col">
          <div className="menu-block menu-block-header shrink-0 px-7 pb-6 pt-8 lg:px-9 lg:pt-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.45em] text-royal/90">
                  Wedding Invitation
                </p>
                <h2 className="mt-3 font-display text-2xl font-light leading-tight text-white lg:text-[1.75rem]">
                  {coupleName}
                </h2>
                <div className="menu-header-ornament mt-4 h-px w-full max-w-[180px]" />
              </div>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="menu-close-btn group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/5 transition-all duration-500 hover:border-royal/50 hover:bg-royal/10 active:scale-90"
              >
                <X className="h-[18px] w-[18px] text-white/55 transition-all duration-500 group-hover:rotate-90 group-hover:text-royal" />
              </button>
            </div>
            <p className="mt-5 text-[11px] leading-relaxed text-white/40">
              Select a section to explore our celebration
            </p>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 lg:px-7">
            <ul key={animKey} className="space-y-1">
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
                      className={`menu-nav-btn group relative flex w-full items-center gap-4 rounded-xl px-4 py-[1.125rem] text-left transition-colors duration-200 active:scale-[0.98] lg:px-5 ${
                        isActive ? "is-active" : ""
                      }`}
                    >
                      <span className="menu-nav-glow pointer-events-none absolute inset-0 rounded-xl" />
                      <span
                        className={`menu-nav-icon relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                          isActive
                            ? "border-royal/50 bg-royal/15 text-royal"
                            : "border-white/10 bg-white/[0.04] text-white/50 group-hover:border-royal/30 group-hover:text-royal/90"
                        }`}
                      >
                        <Icon className="h-[17px] w-[17px]" />
                      </span>
                      <span className="relative flex-1">
                        <span
                          className={`block font-display text-[1.05rem] font-light tracking-wide transition-colors duration-200 ${
                            isActive ? "text-royal" : "text-white/85 group-hover:text-white"
                          }`}
                        >
                          {label}
                        </span>
                      </span>
                      <ArrowUpRight
                        className={`relative h-4 w-4 shrink-0 transition-opacity duration-200 ${
                          isActive
                            ? "translate-x-0 translate-y-0 text-royal opacity-100"
                            : "-translate-x-1 translate-y-1 text-white/25 opacity-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-royal/70 group-hover:opacity-100"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="menu-block menu-block-footer shrink-0 px-7 py-8 lg:px-9">
            <div className="menu-footer-card rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4 text-center backdrop-blur-sm">
              <div className="mx-auto mb-3 flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-royal/50" />
                <Heart className="h-3 w-3 fill-royal/30 text-royal/60" />
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-royal/50" />
              </div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-white/35">
                With love &amp; gratitude
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>,
    portalRoot
  );
}
