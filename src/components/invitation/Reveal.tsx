"use client";

import { useInView } from "@/hooks/useInView";

type RevealDirection = "up" | "down" | "left" | "right" | "scale" | "blur";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  duration?: number;
}

export default function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 800,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal reveal-${direction} ${inView ? "reveal-visible" : ""} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  direction?: RevealDirection;
}

export function Stagger({
  children,
  className = "",
  stagger = 100,
  direction = "up",
}: StaggerProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={i}
              className={`reveal reveal-${direction} ${inView ? "reveal-visible" : ""}`}
              style={{ transitionDelay: `${i * stagger}ms` }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}
