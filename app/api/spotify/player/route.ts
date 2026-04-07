import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/spotify";

export async function POST(req: Request) {
  try {
    const { action, trackUri, volume } = await req.json() as {
      action: "play" | "pause" | "volume";
      trackUri?: string;
      volume?: number;
    };

    const token = await getAccessToken();

    if (action === "play") {
      const body = trackUri ? JSON.stringify({ uris: [trackUri] }) : undefined;
      const res = await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body,
      });
      // 404 = no active device
      if (res.status === 404) {
        return NextResponse.json({ ok: false, error: "no_active_device" }, { status: 404 });
      }
    } else if (action === "pause") {
      await fetch("https://api.spotify.com/v1/me/player/pause", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } else if (action === "volume") {
      await fetch(
        `https://api.spotify.com/v1/me/player/volume?volume_percent=${Math.round(volume ?? 100)}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "internal" }, { status: 500 });
  }
}
