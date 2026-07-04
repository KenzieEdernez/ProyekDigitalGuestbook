import { NextResponse } from "next/server";
import { getEventSettings, saveEventSettings } from "@/lib/event-settings";
import { isAdminLoggedIn } from "@/lib/admin-auth";

export async function GET() {
  return NextResponse.json({ settings: await getEventSettings() });
}

export async function PUT(request: Request) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json(
      { error: "Anda harus login sebagai panitia." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const settings = await saveEventSettings(body);
  return NextResponse.json({ settings });
}
