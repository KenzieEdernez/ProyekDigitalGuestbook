"use client";

type InvitationBorderVideoProps = {
  src?: string | null;
};

/**
 * Fixed overlay for an uploaded gate/border animation video.
 * Plays muted + looping so it stays as a viewport frame while content scrolls.
 */
export default function InvitationBorderVideo({
  src,
}: InvitationBorderVideoProps) {
  const url = src?.trim() || "";
  if (!url) return null;

  return (
    <div
      className="invitation-border-video pointer-events-none fixed inset-0 z-[35]"
      aria-hidden
    >
      <video
        className="h-full w-full object-cover"
        src={url}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
    </div>
  );
}
