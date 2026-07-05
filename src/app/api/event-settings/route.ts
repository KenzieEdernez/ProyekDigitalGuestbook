import { NextResponse } from "next/server";
import { getEventSettings, saveEventSettings } from "@/lib/event-settings";
import { isAdminLoggedIn } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { settings: await getEventSettings() },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(request: Request) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json(
      { error: "Anda harus login sebagai panitia." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const settings = await saveEventSettings(body);
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
          : "Failed to save event settings.",
      },
      { status: 400 }
    );
  }
}
