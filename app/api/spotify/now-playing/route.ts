import { NextResponse } from "next/server";
import { getNowPlaying, getRecentlyPlayed } from "@/lib/spotify";

export async function GET() {
  try {
    const data = await getNowPlaying();

    if (data?.is_playing) {
      return NextResponse.json({
        isPlaying: true,
        title: data.item?.name,
        artist: data.item?.artists?.map((a: { name: string }) => a.name).join(", "),
        album: data.item?.album?.name,
        albumArt: data.item?.album?.images?.[0]?.url,
        songUrl: data.item?.external_urls?.spotify,
        trackUri: data.item?.uri,
        progressMs: data.progress_ms,
        durationMs: data.item?.duration_ms,
      });
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
