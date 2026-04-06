import { NextResponse } from "next/server";
import { getRecentlyPlayed } from "@/lib/spotify";

export async function GET() {
  try {
    const data = await getRecentlyPlayed(20);
    if (!data) return NextResponse.json({ tracks: [] });
    return NextResponse.json({
      tracks: data.items.map((item: {
        track: {
          name: string;
          artists: { name: string }[];
          album: { name: string; images: { url: string }[] };
          external_urls: { spotify: string };
          duration_ms: number;
        };
        played_at: string;
      }) => ({
        title: item.track.name,
        artist: item.track.artists.map((a) => a.name).join(", "),
        album: item.track.album.name,
        albumArt: item.track.album.images?.[0]?.url,
        songUrl: item.track.external_urls.spotify,
        playedAt: item.played_at,
        durationMs: item.track.duration_ms,
      })),
    });
  } catch {
    return NextResponse.json({ tracks: [] });
  }
}
