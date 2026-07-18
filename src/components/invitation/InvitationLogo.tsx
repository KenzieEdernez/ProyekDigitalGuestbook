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
        className="invitation-logo-image h-28 w-auto max-w-[14rem] object-contain sm:h-36 sm:max-w-[18rem] md:h-40 md:max-w-[20rem]"
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
