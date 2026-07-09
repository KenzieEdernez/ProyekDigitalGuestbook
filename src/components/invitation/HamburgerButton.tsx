"use client";

interface HamburgerButtonProps {
  open: boolean;
  onClick: () => void;
  className?: string;
}

export default function HamburgerButton({
  open,
  onClick,
  className = "",
}: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Tutup menu" : "Buka menu"}
      aria-expanded={open}
      className={`hamburger-btn group relative flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-navy/80 shadow-card backdrop-blur-md transition-all duration-400 ease-out-expo hover:border-royal/40 active:scale-95 ${className}`}
    >
      <span className="sr-only">{open ? "Close" : "Menu"}</span>
      <div className="relative h-3.5 w-5">
        <span
          className={`absolute left-0 h-0.5 w-5 rounded-full bg-white transition-all duration-400 ease-out-expo ${
            open ? "top-[6px] rotate-45 bg-royal" : "top-0"
          }`}
        />
        <span
          className={`absolute left-0 top-[6px] h-0.5 w-5 rounded-full bg-white transition-all duration-300 ${
            open ? "scale-0 opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`absolute left-0 h-0.5 w-5 rounded-full bg-white transition-all duration-400 ease-out-expo ${
            open ? "top-[6px] -rotate-45 bg-royal" : "top-[12px]"
          }`}
        />
      </div>
    </button>
  );
}
