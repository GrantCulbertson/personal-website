import { NextResponse } from "next/server";
import { getNowPlaying } from "@/lib/spotify";

export async function GET() {
  try {
    const data = await getNowPlaying();
    if (!data) {
      return NextResponse.json({ isPlaying: false });
    }
    return NextResponse.json({
      isPlaying: data.is_playing,
      title: data.item?.name,
      artist: data.item?.artists?.map((a: { name: string }) => a.name).join(", "),
      album: data.item?.album?.name,
      albumArt: data.item?.album?.images?.[0]?.url,
      songUrl: data.item?.external_urls?.spotify,
      progressMs: data.progress_ms,
      durationMs: data.item?.duration_ms,
    });
  } catch {
    return NextResponse.json({ isPlaying: false });
  }
}
