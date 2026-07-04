import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from "./admin-auth-constants";

export async function isAdminLoggedIn() {
  return (await cookies()).get(ADMIN_SESSION_COOKIE)?.value === ADMIN_SESSION_VALUE;
}

export function getAdminSessionValue() {
  return ADMIN_SESSION_VALUE;
}

export { ADMIN_SESSION_COOKIE };
