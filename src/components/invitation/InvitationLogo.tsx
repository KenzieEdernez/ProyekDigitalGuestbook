"use client";

interface InvitationLogoProps {
  src?: string;
  fallbackInitials?: string;
  size?: "default" | "couple";
}

export default function InvitationLogo({
  src,
  fallbackInitials = "LA",
  size = "default",
}: InvitationLogoProps) {
  const sizeClass =
    size === "couple"
      ? "h-[5.25rem] w-auto max-w-[11.5rem] object-contain object-center sm:h-[6.25rem] sm:max-w-[13.5rem] md:h-[7rem] md:max-w-[15rem]"
      : "h-[5.75rem] w-auto max-w-[12.5rem] object-contain object-center sm:h-[6.75rem] sm:max-w-[15rem] md:h-28 md:max-w-[16rem]";

  if (src) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={src}
        alt=""
        aria-hidden
        className={`invitation-logo-image ${sizeClass}`}
      />
    );
  }

  const letters = fallbackInitials.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() || "LA";

  return (
    <div
      className={`invitation-logo-fallback ${
        size === "couple" ? "invitation-logo-fallback-couple" : ""
      }`}
      aria-hidden
    >
      <span>{letters[0]}</span>
      <span className="invitation-logo-fallback-bar" />
      <span>{letters[1] ?? letters[0]}</span>
    </div>
  );
}
