import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAllowedBirdUrl(raw: string) {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;

    const host = url.hostname.toLowerCase();
    let supabaseHost = "";
    try {
      supabaseHost = new URL(
        process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      ).hostname.toLowerCase();
    } catch {
      supabaseHost = "";
    }

    if (
      supabaseHost &&
      (host === supabaseHost || host.endsWith(".supabase.co"))
    ) {
      return true;
    }

    if (host === "localhost" || host === "127.0.0.1") return true;
    return host.includes("supabase");
  } catch {
    return false;
  }
}

/** Proxy bird video same-origin so canvas chroma-key can read pixels. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url")?.trim() || "";

  if (!target || !isAllowedBirdUrl(target)) {
    return NextResponse.json({ error: "Invalid bird media URL." }, { status: 400 });
  }

  try {
    const incomingRange = request.headers.get("range");
    const upstreamHeaders: HeadersInit = {
      Accept: "video/*,*/*",
    };
    if (incomingRange) {
      upstreamHeaders.Range = incomingRange;
    }

    const upstream = await fetch(target, {
      headers: upstreamHeaders,
      cache: "no-store",
    });

    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.json(
        { error: "Failed to fetch bird media." },
        { status: upstream.status || 502 }
      );
    }

    if (!upstream.body) {
      return NextResponse.json(
        { error: "Empty bird media response." },
        { status: 502 }
      );
    }

    const headers = new Headers();
    const contentType = upstream.headers.get("content-type") || "video/mp4";
    headers.set("Content-Type", contentType);
    headers.set(
      "Cache-Control",
      "public, max-age=86400, stale-while-revalidate=604800"
    );
    headers.set("Access-Control-Allow-Origin", "*");

    for (const key of [
      "content-length",
      "content-range",
      "accept-ranges",
    ] as const) {
      const value = upstream.headers.get(key);
      if (value) headers.set(key, value);
    }

    if (!headers.has("Accept-Ranges")) {
      headers.set("Accept-Ranges", "bytes");
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to proxy bird media." },
      { status: 502 }
    );
  }
}
