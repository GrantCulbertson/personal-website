import { NextResponse } from "next/server";
import { getNowPlaying, getRecentlyPlayed } from "@/lib/spotify";
import { mapCurrentlyPlaying } from "@/lib/nowPlayingMapper";

export async function GET() {
  try {
    const data = await getNowPlaying();
    const mapped = mapCurrentlyPlaying(data);

    if (mapped) {
      return NextResponse.json(mapped);
    }

    // Nothing playing — fall back to last played track
    const recent = await getRecentlyPlayed(1);
    const last = recent?.items?.[0];
    if (last) {
      return NextResponse.json({
        isPlaying: false,
        isLastPlayed: true,
        title: last.track.name,
        artist: last.track.artists.map((a: { name: string }) => a.name).join(", "),
        album: last.track.album.name,
        albumArt: last.track.album.images?.[0]?.url,
        songUrl: last.track.external_urls.spotify,
        trackUri: last.track.uri,
        durationMs: last.track.duration_ms,
      });
    }

    return NextResponse.json({ isPlaying: false });
  } catch {
    return NextResponse.json({ isPlaying: false });
  }
}
