"use client";

interface HamburgerButtonProps {
  open: boolean;
  onClick: () => void;
  elevated?: boolean;
  className?: string;
}

export default function HamburgerButton({
  open,
  onClick,
  elevated = false,
  className = "",
}: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className={`hamburger-btn group relative flex h-[52px] w-[52px] items-center justify-center rounded-full active:scale-95 ${
        open ? "hamburger-open is-open" : "hamburger-closed"
      } ${elevated ? "z-[202]" : ""} ${className}`}
    >
      <span className="hamburger-aura pointer-events-none absolute inset-0 rounded-full" />
      <span className="hamburger-ring pointer-events-none absolute inset-0 rounded-full" />
      <span className="hamburger-ring-outer pointer-events-none absolute -inset-1 rounded-full" />

      <div className="relative flex h-[18px] w-[22px] flex-col items-end justify-between">
        <span className="hamburger-line hamburger-line-top block h-[2px] rounded-full bg-white" />
        <span className="hamburger-line hamburger-line-mid block h-[2px] rounded-full bg-white" />
        <span className="hamburger-line hamburger-line-bot block h-[2px] rounded-full bg-white" />
      </div>

      <span className="sr-only">{open ? "Close" : "Menu"}</span>
    </button>
  );
}
