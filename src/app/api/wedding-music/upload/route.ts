import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  getWeddingSettings,
  saveWeddingSettings,
  uploadMusicBuffer,
} from "@/lib/wedding-settings";

export const dynamic = "force-dynamic";

const MAX_MUSIC_BYTES = 12 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json(
      { error: "You must be logged in as staff." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No music file provided." },
        { status: 400 }
      );
    }

    const isAudio =
      file.type.startsWith("audio/") ||
      file.name.toLowerCase().endsWith(".mp3");

    if (!isAudio) {
      return NextResponse.json(
        { error: "Please upload an MP3 or audio file." },
        { status: 400 }
      );
    }

    if (file.size > MAX_MUSIC_BYTES) {
      return NextResponse.json(
        { error: "Music file must be under 12MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "audio/mpeg";
    const url = await uploadMusicBuffer(buffer, mimeType);

    const current = await getWeddingSettings();
    const settings = await saveWeddingSettings({
      ...current,
      musicUrl: url,
    });

    return NextResponse.json({ url, settings });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload music file.",
      },
      { status: 400 }
    );
  }
}
