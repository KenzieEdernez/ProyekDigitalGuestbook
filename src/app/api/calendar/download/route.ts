import { NextResponse } from "next/server";
import { buildIcsContent, type CalendarEventInput } from "@/lib/calendar-event";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input: CalendarEventInput = {
    title: searchParams.get("title") ?? "",
    date: searchParams.get("date") ?? "",
    time: searchParams.get("time") ?? "",
    location: searchParams.get("location") ?? "",
    description: searchParams.get("description") ?? "",
  };

  const icsContent = buildIcsContent(input);
  if (!icsContent) {
    return NextResponse.json(
      { error: "Invalid calendar event details." },
      { status: 400 }
    );
  }

  return new NextResponse(icsContent, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="wedding-event.ics"',
      "Cache-Control": "no-store",
    },
  });
}
