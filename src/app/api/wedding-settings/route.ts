import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  getWeddingSettings,
  hasConfiguredMusic,
  saveWeddingSettings,
} from "@/lib/wedding-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getWeddingSettings();
  return NextResponse.json(
    {
      settings,
      musicAvailable: hasConfiguredMusic(settings),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(request: Request) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json(
      { error: "You must be logged in as staff." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const settings = await saveWeddingSettings(body);
    return NextResponse.json(
      { settings },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save wedding settings.",
      },
      { status: 400 }
    );
  }
}
