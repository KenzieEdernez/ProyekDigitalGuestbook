export const ADMIN_SESSION_COOKIE = "digital_guestbook_admin";

export function getAdminSessionValue() {
  return process.env.ADMIN_SESSION_TOKEN?.trim() || null;
}
