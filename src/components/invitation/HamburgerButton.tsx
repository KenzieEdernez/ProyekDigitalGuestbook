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
          ? "hamburger-open border-royal/60 bg-navy shadow-glow"
          : "border-white/25 bg-navy/85 hover:border-royal/45 hover:bg-navy"
      } ${elevated ? "z-[202]" : ""} ${className}`}
    >
      <span
        className={`pointer-events-none absolute inset-0 rounded-full transition-all duration-500 ${
          open ? "hamburger-ring scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      />
      <span className="sr-only">{open ? "Close" : "Menu"}</span>
      <div className="relative h-4 w-5">
        <span
          className={`absolute left-0 block h-[2px] w-5 origin-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] ${
            open
              ? "top-[7px] rotate-45 bg-royal"
              : "top-0 bg-white group-hover:bg-royal/90"
          }`}
        />
        <span
          className={`absolute left-0 top-[7px] block h-[2px] origin-center rounded-full transition-all duration-350 ease-out-expo ${
            open ? "w-0 bg-royal opacity-0" : "w-5 bg-white opacity-100 group-hover:bg-royal/90"
          }`}
        />
        <span
          className={`absolute left-0 block h-[2px] w-5 origin-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] ${
            open
              ? "top-[7px] -rotate-45 bg-royal"
              : "top-[14px] bg-white group-hover:bg-royal/90"
          }`}
        />
      </div>
    </button>
  );
}
