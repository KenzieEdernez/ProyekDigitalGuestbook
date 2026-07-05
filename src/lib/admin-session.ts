const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

function getSessionSecret() {
  return process.env.ADMIN_SESSION_TOKEN?.trim() || null;
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlEncodeText(value: string) {
  return base64UrlEncode(new TextEncoder().encode(value));
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function signPayload(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return base64UrlEncode(new Uint8Array(signature));
}

export async function createAdminSessionToken(username: string) {
  const secret = getSessionSecret();
  if (!secret) return null;

  const sessionId = crypto.randomUUID();
  const issuedAt = Date.now();
  const payload = `${sessionId}.${issuedAt}.${base64UrlEncodeText(username)}`;
  const signature = await signPayload(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string) {
  const secret = getSessionSecret();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 4) return false;

  const [sessionId, issuedAtRaw, encodedUsername, signature] = parts;
  const issuedAt = Number(issuedAtRaw);
  if (!sessionId || !encodedUsername || !signature || !Number.isFinite(issuedAt)) {
    return false;
  }

  if (Date.now() - issuedAt > SESSION_MAX_AGE_MS) return false;

  const payload = `${sessionId}.${issuedAtRaw}.${encodedUsername}`;
  const expected = await signPayload(payload, secret);
  return timingSafeEqual(signature, expected);
}
