import SpotifyBackground from "./SpotifyBackground";
import SpotifyContent from "./SpotifyContent";
import { getTopTracks, getTopArtists, getDailyHistory } from "@/lib/spotify";

export default async function SpotifyPage() {
  const notSetUp = !process.env.SPOTIFY_REFRESH_TOKEN;

  const [topTracksData, topArtistsData, dailyHistory] = await Promise.all([
    notSetUp ? null : getTopTracks(6, "short_term"),
    notSetUp ? null : getTopArtists(6, "short_term"),
    notSetUp ? null : getDailyHistory(),
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
