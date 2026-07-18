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
        className="invitation-logo-image h-[5.75rem] w-auto max-w-[12.5rem] object-contain object-center sm:h-[6.75rem] sm:max-w-[15rem] md:h-28 md:max-w-[16rem]"
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
