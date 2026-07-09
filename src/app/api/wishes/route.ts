import { NextResponse } from "next/server";
import { createWish, getWishes } from "@/lib/wishes";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { CreateWishInput } from "@/types/wish";

export async function GET() {
  try {
    const wishes = await getWishes();
    return NextResponse.json({ wishes });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load wishes.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `wishes:${ip}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Terlalu banyak percobaan. Coba lagi dalam ${rateLimit.retryAfter} detik.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      }
    );
  }

  try {
    const body = (await request.json()) as CreateWishInput;
    const wish = await createWish(body);
    return NextResponse.json({ wish });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Gagal mengirim ucapan.",
      },
      { status: 400 }
    );
  }
}
