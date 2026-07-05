import { NextResponse } from "next/server";
import { registerGuest } from "@/lib/guests";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { RegisterGuestInput } from "@/types/guest";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `register:${ip}`,
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Too many registration attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      }
    );
  }

  try {
    const body = (await request.json()) as RegisterGuestInput;

    const guest = await registerGuest({
      name: body.name ?? "",
      address: body.address ?? "",
      phone: body.phone ?? "",
      pax: Number(body.pax) || 1,
      attending: Boolean(body.attending),
    });

    return NextResponse.json({ guest });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Registration failed.",
      },
      { status: 400 }
    );
  }
}
