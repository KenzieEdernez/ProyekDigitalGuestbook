/** White envelope + RSVP card icon for the circular RSVP FAB. */
export default function RsvpFabIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M8 18.5L24 28.5L40 18.5V36.5C40 37.6 39.1 38.5 38 38.5H10C8.9 38.5 8 37.6 8 36.5V18.5Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M8 18.5L24 10.5L40 18.5L24 28.5L8 18.5Z"
        fill="currentColor"
      />
      <rect x="14" y="14" width="20" height="14" rx="1.5" fill="#5c2430" />
      <text
        x="24"
        y="23.5"
        textAnchor="middle"
        fill="currentColor"
        fontSize="6.2"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.6"
      >
        RSVP
      </text>
    </svg>
  );
}
