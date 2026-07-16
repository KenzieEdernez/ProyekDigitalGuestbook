import { NextResponse } from "next/server";
import { getMusicPlaybackUrl } from "@/lib/wedding-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const playbackUrl = await getMusicPlaybackUrl();
  if (!playbackUrl) {
    return new NextResponse("No music configured", { status: 404 });
  }

  try {
    let fetchUrl = playbackUrl;

    if (playbackUrl.startsWith("/")) {
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");
      fetchUrl = `${origin}${playbackUrl}`;
    }

    const upstream = await fetch(fetchUrl, { cache: "no-store" });
    if (!upstream.ok || !upstream.body) {
      return new NextResponse("Music file not found", { status: 404 });
    }

    const contentLength = upstream.headers.get("Content-Length");
    const contentType = upstream.headers.get("Content-Type") || "audio/mpeg";

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": contentType,
        ...(contentLength ? { "Content-Length": contentLength } : {}),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Failed to load music", { status: 502 });
  }
}
