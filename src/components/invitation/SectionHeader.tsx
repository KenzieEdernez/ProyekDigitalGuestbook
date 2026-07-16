"use client";

import Reveal from "./Reveal";

interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  light?: boolean;
  align?: "center" | "left";
}

export default function SectionHeader({
  label,
  title,
  subtitle,
  light = false,
  align = "center",
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left mx-0";
  const ornamentAlign = align === "center" ? "justify-center" : "justify-start";

  return (
    <header className={`mb-10 max-w-2xl sm:mb-14 lg:mb-16 ${alignClass}`}>
      <Reveal direction="blur" duration={700}>
        <div className={`flex items-center gap-4 ${ornamentAlign}`}>
          {align === "center" && (
            <span
              className={`h-px w-12 bg-gradient-to-r from-transparent ${
                light ? "to-royal/60" : "to-royal"
              }`}
            />
          )}
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.4em] ${
              light ? "text-royal-200" : "text-royal"
            }`}
          >
            {label}
          </p>
          <span
            className={`h-px w-12 bg-gradient-to-l from-transparent ${
              light ? "to-royal/60" : "to-royal"
            } ${align === "left" ? "hidden" : ""}`}
          />
        </div>
      </Reveal>

      <Reveal direction="up" delay={120} duration={900}>
        <h2
          className={`mt-5 font-display text-3xl font-light leading-tight sm:text-4xl md:text-5xl ${
            light ? "text-white" : "text-navy"
          }`}
        >
          {title}
        </h2>
      </Reveal>

      {subtitle && (
        <Reveal direction="up" delay={240} duration={800}>
          <p
            className={`mt-5 text-sm leading-relaxed ${
              light ? "text-white/60" : "text-stone-500"
            }`}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </header>
  );
}
