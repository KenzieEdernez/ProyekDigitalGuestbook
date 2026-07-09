import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { createWish, deleteAllWishes, getWishes } from "@/lib/wishes";
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
        error: `Too many attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
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
          error instanceof Error ? error.message : "Failed to send wish.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json(
      { error: "You must be logged in as staff." },
      { status: 401 }
    );
  }

  try {
    const deleted = await deleteAllWishes();
    return NextResponse.json({ deleted });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete wishes.",
      },
      { status: 500 }
    );
  }
}
