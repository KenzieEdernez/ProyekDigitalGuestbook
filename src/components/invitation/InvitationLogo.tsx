"use client";

interface InvitationLogoProps {
  src?: string;
  fallbackInitials?: string;
}

export default function InvitationLogo({
  src,
  fallbackInitials = "LA",
}: InvitationLogoProps) {
  if (src) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={src}
        alt=""
        aria-hidden
        className="invitation-logo-image h-16 w-auto max-w-[8rem] object-contain sm:h-[4.75rem] sm:max-w-[9rem]"
      />
    );
  }

  const letters = fallbackInitials.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() || "LA";

  return (
    <div className="invitation-logo-fallback" aria-hidden>
      <span>{letters[0]}</span>
      <span className="invitation-logo-fallback-bar" />
      <span>{letters[1] ?? letters[0]}</span>
    </div>
  );
}
