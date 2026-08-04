/** Open envelope with RSVP card — matches the invitation FAB artwork. */
export default function RsvpFabIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Card / letter rising from envelope */}
      <rect
        x="20"
        y="10"
        width="24"
        height="28"
        rx="2"
        fill="#faf7f2"
      />
      <text
        x="32"
        y="23"
        textAnchor="middle"
        fill="var(--fab-accent, #5c4033)"
        fontSize="7.5"
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        letterSpacing="1.1"
      >
        RSVP
      </text>
      <line
        x1="25"
        y1="28"
        x2="39"
        y2="28"
        stroke="var(--fab-accent, #5c4033)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <line
        x1="25"
        y1="32.5"
        x2="39"
        y2="32.5"
        stroke="var(--fab-accent, #5c4033)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Envelope body */}
      <path
        d="M12 28h40c1.7 0 3 1.3 3 3v22c0 1.7-1.3 3-3 3H12c-1.7 0-3-1.3-3-3V31c0-1.7 1.3-3 3-3Z"
        fill="currentColor"
      />
      {/* Envelope inner shadow band */}
      <path
        d="M9 31l23 14 23-14"
        stroke="var(--fab-accent, #5c4033)"
        strokeWidth="2.2"
        strokeLinejoin="round"
        opacity="0.22"
      />
      {/* Envelope flap (open / folded back look) */}
      <path
        d="M9 31L32 45L55 31"
        stroke="var(--fab-accent, #5c4033)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
        opacity="0.18"
      />
      {/* Front pocket fold highlight */}
      <path
        d="M12 53.5h40"
        stroke="var(--fab-accent, #5c4033)"
        strokeWidth="1.2"
        opacity="0.12"
        strokeLinecap="round"
      />
    </svg>
  );
}
