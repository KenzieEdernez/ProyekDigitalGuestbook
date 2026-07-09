"use client";

import { useEffect } from "react";
import { ArrowRight, X } from "lucide-react";
import { NAV_ITEMS, getCoupleDisplayName, type InvitationSection } from "@/lib/wedding-config";

interface MobileMenuOverlayProps {
  open: boolean;
  active: InvitationSection;
  onClose: () => void;
  onNavigate: (section: InvitationSection) => void;
}

export default function MobileMenuOverlay({
  open,
  active,
  onClose,
  onNavigate,
}: MobileMenuOverlayProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
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
    setTimeout(() => onNavigate(section), 280);
  };

  return (
    <div
      className={`menu-overlay fixed inset-0 z-[70] lg:hidden ${
        open ? "menu-overlay-open" : "menu-overlay-closed"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className="menu-backdrop absolute inset-0 bg-navy-900/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Side panel */}
      <aside
        className={`menu-panel absolute right-0 top-0 flex h-full w-[min(88vw,360px)] flex-col bg-navy/95 shadow-card-lg backdrop-blur-2xl ${
          open ? "menu-panel-open" : "menu-panel-closed"
        }`}
      >
        {/* Gold accent line */}
        <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-royal/40 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-royal/80">
              Undangan
            </p>
            <p className="mt-1 font-display text-lg font-light text-white">
              {getCoupleDisplayName()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="menu-close-btn group flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 transition-all duration-300 hover:border-royal/40 hover:bg-white/5 active:scale-95"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 transition-colors group-hover:text-royal">
              Close
            </span>
            <X className="h-3.5 w-3.5 text-white/50 transition-colors group-hover:text-royal" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ id, label }, i) => {
              const isActive = active === id;
              const stepNum = String(i + 1).padStart(2, "0");
              return (
                <li
                  key={id}
                  className="menu-nav-item"
                  style={{ "--item-index": i } as React.CSSProperties}
                >
                  <button
                    onClick={() => handleNav(id)}
                    className={`group flex w-full items-center justify-between rounded-xl px-4 py-4 text-left transition-all duration-300 active:scale-[0.98] ${
                      isActive
                        ? "bg-royal/15 text-royal"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-bold transition-all duration-300 ${
                          isActive
                            ? "border-royal/40 bg-royal/10 text-royal"
                            : "border-white/10 text-white/30 group-hover:border-royal/20 group-hover:text-royal/60"
                        }`}
                      >
                        <span className="text-[10px] font-bold">{stepNum}</span>
                      </span>
                      <span className="text-sm font-medium tracking-wide">
                        {label}
                      </span>
                    </div>
                    {isActive && (
                      <ArrowRight className="h-4 w-4 text-royal animate-pulse-soft" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-5">
          <p className="text-center text-[9px] uppercase tracking-[0.3em] text-white/25">
            EdernDigital
          </p>
        </div>
      </aside>
    </div>
  );
}
