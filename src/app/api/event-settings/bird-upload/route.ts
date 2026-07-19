import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  getEventSettings,
  saveEventSettings,
  uploadBirdLottieBuffer,
} from "@/lib/event-settings";

export const dynamic = "force-dynamic";

const MAX_LOTTIE_BYTES = 5 * 1024 * 1024;

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
        { error: "No Lottie bird file provided." },
        { status: 400 }
      );
    }

    const name = file.name.toLowerCase();
    const type = (file.type || "").toLowerCase();
    const isJson =
      type.includes("json") ||
      type.includes("text/plain") ||
      name.endsWith(".json");

    if (!isJson) {
      return NextResponse.json(
        { error: "Please upload a Lottie animation (.json)." },
        { status: 400 }
      );
    }

    if (file.size > MAX_LOTTIE_BYTES) {
      return NextResponse.json(
        { error: "Lottie bird file must be under 5MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadBirdLottieBuffer(buffer);

    const current = await getEventSettings();
    const settings = await saveEventSettings({
      ...current,
      birdImage: url,
      birdImageIos: "",
      // Clear legacy video/frame paths — Lottie is the source of truth.
      birdFrames: [],
    });

    return NextResponse.json({ url, settings });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload Lottie bird.",
      },
      { status: 400 }
    );
  }
}
