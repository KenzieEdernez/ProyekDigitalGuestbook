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
      className={`hamburger-btn group relative flex h-12 w-12 items-center justify-center rounded-full border shadow-card backdrop-blur-md transition-all duration-500 ease-out-expo active:scale-95 ${
        open
          ? "border-royal/50 bg-navy shadow-glow"
          : "border-white/25 bg-navy/85 hover:border-royal/40 hover:bg-navy"
      } ${elevated ? "z-[81]" : ""} ${className}`}
    >
      <span className="sr-only">{open ? "Close" : "Menu"}</span>
      <div className="relative h-4 w-5">
        <span
          className={`absolute left-0 h-[2px] w-5 rounded-full transition-all duration-500 ease-out-expo ${
            open
              ? "top-[7px] rotate-45 bg-royal shadow-[0_0_8px_rgba(197,160,89,0.6)]"
              : "top-0 bg-white group-hover:bg-royal/90"
          }`}
        />
        <span
          className={`absolute left-0 top-[7px] h-[2px] rounded-full bg-white transition-all duration-400 ease-out-expo group-hover:bg-royal/90 ${
            open ? "w-0 opacity-0" : "w-5 opacity-100"
          }`}
        />
        <span
          className={`absolute left-0 h-[2px] w-5 rounded-full transition-all duration-500 ease-out-expo ${
            open
              ? "top-[7px] -rotate-45 bg-royal shadow-[0_0_8px_rgba(197,160,89,0.6)]"
              : "top-[14px] bg-white group-hover:bg-royal/90"
          }`}
        />
      </div>
    </button>
  );
}
