const STORAGE_KEY = "wedding-rsvp-session";

export type RsvpSession = {
  guestName: string;
  attendance: "attending" | "not_attending";
  completedAt: number;
};

export function saveRsvpSession(
  data: Pick<RsvpSession, "guestName" | "attendance">
) {
  if (typeof window === "undefined") return;
  const session: RsvpSession = { ...data, completedAt: Date.now() };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("wedding-rsvp-complete", { detail: session }));
}

export function getRsvpSession(): RsvpSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RsvpSession;
  } catch {
    return null;
  }
}
