import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "./admin-auth-constants";
import { verifyAdminSessionToken } from "./admin-session";

export async function isAdminLoggedIn() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifyAdminSessionToken(token);
}

export { ADMIN_SESSION_COOKIE } from "./admin-auth-constants";
export { createAdminSessionToken, verifyAdminSessionToken } from "./admin-session";
