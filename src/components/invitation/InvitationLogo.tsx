"use client";

interface InvitationLogoProps {
  src?: string;
}

export default function InvitationLogo({ src }: InvitationLogoProps) {
  if (!src) return null;

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt=""
      aria-hidden
      className="invitation-logo-image h-14 w-auto max-w-[7rem] object-contain sm:h-[4.5rem] sm:max-w-[8.5rem]"
    />
  );
}
