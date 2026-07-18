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
        className="invitation-logo-image h-[5.5rem] w-auto max-w-[11rem] object-contain sm:h-28 sm:max-w-[13rem]"
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
