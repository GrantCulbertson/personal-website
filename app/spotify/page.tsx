import SpotifyBackground from "./SpotifyBackground";
import SpotifyContent from "./SpotifyContent";
import { getTopTracks, getTopArtists } from "@/lib/spotify";
import { getDailyScrobbleHistory } from "@/lib/listening";

// Rebuild the genre-enriched history (50 Spotify lookups + a Neon query)
// at most once a day; page loads serve the cached render.
export const revalidate = 86400;

export default async function SpotifyPage() {
  const notSetUp = !process.env.SPOTIFY_REFRESH_TOKEN;
  const hasDb = !!process.env.DATABASE_URL;

  const [topTracksData, topArtistsData, dailyHistory] = await Promise.all([
    notSetUp ? null : getTopTracks(6, "short_term"),
    notSetUp ? null : getTopArtists(6, "short_term"),
    notSetUp || !hasDb ? null : getDailyScrobbleHistory(),
  ]);

  return (
    <>
      {/* Fixed blurred album art background — fades in when playing */}
      {!notSetUp && <SpotifyBackground />}

      {/* Page content sits above the fixed background */}
      <SpotifyContent
        notSetUp={notSetUp}
        topTracksData={topTracksData}
        topArtistsData={topArtistsData}
        days={dailyHistory?.days ?? null}
        topGenres={dailyHistory?.topGenres ?? null}
        mediaTypes={dailyHistory?.mediaTypes ?? null}
      />
    </>
  );
}
