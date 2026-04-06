import Image from "next/image";
import Link from "next/link";
import NowPlaying from "./NowPlaying";
import { getTopTracks, getTopArtists, getRecentlyPlayed } from "@/lib/spotify";

function msToMin(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = String(totalSec % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function timeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function SpotifyPage() {
  const notSetUp = !process.env.SPOTIFY_REFRESH_TOKEN;

  const [topTracksData, topArtistsData, recentData] = await Promise.all([
    notSetUp ? null : getTopTracks(10, "short_term"),
    notSetUp ? null : getTopArtists(6, "short_term"),
    notSetUp ? null : getRecentlyPlayed(15),
  ]);

  return (
    <div className="min-h-screen pt-16" style={{ background: "var(--cream)" }}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#1DB954">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <h1
              className="font-semibold tracking-tight"
              style={{ fontSize: "1.75rem", color: "var(--dark)" }}
            >
              Listening Dashboard
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            What I&apos;ve been playing lately — data pulled live from Spotify.
          </p>
        </div>

        {notSetUp ? (
          <SetupBanner />
        ) : (
          <div className="space-y-10">
            {/* Now Playing */}
            <section>
              <SectionLabel>Now Playing</SectionLabel>
              <NowPlaying />
            </section>

            {/* Top tracks + artists grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Tracks */}
              <section>
                <SectionLabel>Top Tracks · Last 4 Weeks</SectionLabel>
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "white", border: "1px solid var(--cream-dark)" }}
                >
                  {topTracksData?.items?.map(
                    (
                      track: {
                        id: string;
                        name: string;
                        artists: { name: string }[];
                        album: { images: { url: string }[] };
                        external_urls: { spotify: string };
                        duration_ms: number;
                      },
                      i: number
                    ) => (
                      <a
                        key={track.id}
                        href={track.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--cream)] group"
                        style={{
                          borderBottom:
                            i < topTracksData.items.length - 1
                              ? "1px solid var(--cream)"
                              : "none",
                          textDecoration: "none",
                        }}
                      >
                        <span
                          className="text-xs w-5 text-right flex-shrink-0"
                          style={{ color: "var(--muted)" }}
                        >
                          {i + 1}
                        </span>
                        <div
                          className="relative flex-shrink-0 rounded overflow-hidden"
                          style={{ width: 40, height: 40 }}
                        >
                          <Image
                            src={track.album.images?.[0]?.url}
                            alt={track.name}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="40px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: "var(--dark)" }}
                          >
                            {track.name}
                          </p>
                          <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                            {track.artists.map((a) => a.name).join(", ")}
                          </p>
                        </div>
                        <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>
                          {msToMin(track.duration_ms)}
                        </span>
                      </a>
                    )
                  ) ?? <EmptyState />}
                </div>
              </section>

              {/* Top Artists */}
              <section>
                <SectionLabel>Top Artists · Last 4 Weeks</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  {topArtistsData?.items?.map(
                    (
                      artist: {
                        id: string;
                        name: string;
                        genres: string[];
                        images: { url: string }[];
                        external_urls: { spotify: string };
                      }
                    ) => (
                      <a
                        key={artist.id}
                        href={artist.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-2xl p-4 flex flex-col items-center text-center gap-3 transition-all hover:shadow-md"
                        style={{
                          background: "white",
                          border: "1px solid var(--cream-dark)",
                          textDecoration: "none",
                        }}
                      >
                        <div
                          className="relative rounded-full overflow-hidden flex-shrink-0"
                          style={{ width: 72, height: 72 }}
                        >
                          {artist.images?.[0]?.url ? (
                            <Image
                              src={artist.images[0].url}
                              alt={artist.name}
                              fill
                              style={{ objectFit: "cover" }}
                              sizes="72px"
                            />
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{ background: "var(--cream-dark)" }}
                            />
                          )}
                        </div>
                        <div>
                          <p
                            className="text-sm font-semibold leading-tight"
                            style={{ color: "var(--dark)" }}
                          >
                            {artist.name}
                          </p>
                          <p
                            className="text-xs mt-1 truncate"
                            style={{ color: "var(--muted)", maxWidth: 120 }}
                          >
                            {artist.genres?.[0] ?? ""}
                          </p>
                        </div>
                      </a>
                    )
                  ) ?? <EmptyState />}
                </div>
              </section>
            </div>

            {/* Recently Played */}
            <section>
              <SectionLabel>Recently Played</SectionLabel>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1px solid var(--cream-dark)" }}
              >
                {recentData?.items?.map(
                  (
                    item: {
                      track: {
                        id: string;
                        name: string;
                        artists: { name: string }[];
                        album: { name: string; images: { url: string }[] };
                        external_urls: { spotify: string };
                        duration_ms: number;
                      };
                      played_at: string;
                    },
                    i: number
                  ) => (
                    <a
                      key={`${item.track.id}-${i}`}
                      href={item.track.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--cream)]"
                      style={{
                        borderBottom:
                          i < recentData.items.length - 1
                            ? "1px solid var(--cream)"
                            : "none",
                        textDecoration: "none",
                      }}
                    >
                      <div
                        className="relative flex-shrink-0 rounded overflow-hidden"
                        style={{ width: 40, height: 40 }}
                      >
                        <Image
                          src={item.track.album.images?.[0]?.url}
                          alt={item.track.name}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="40px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--dark)" }}
                        >
                          {item.track.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                          {item.track.artists.map((a) => a.name).join(", ")} ·{" "}
                          {item.track.album.name}
                        </p>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>
                        {timeAgo(item.played_at)}
                      </span>
                    </a>
                  )
                ) ?? <EmptyState />}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-widest mb-3"
      style={{ color: "var(--muted)" }}
    >
      {children}
    </p>
  );
}

function EmptyState() {
  return (
    <p className="p-6 text-sm text-center" style={{ color: "var(--muted)" }}>
      No data available
    </p>
  );
}

function SetupBanner() {
  return (
    <div
      className="rounded-2xl p-8 text-center"
      style={{ background: "white", border: "1px solid var(--cream-dark)" }}
    >
      <p className="font-semibold mb-2" style={{ color: "var(--dark)" }}>
        Spotify not connected yet
      </p>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        You need to complete the one-time OAuth flow to get a refresh token, then add it to{" "}
        <code>.env.local</code>.
      </p>
      <ol
        className="text-sm text-left inline-block space-y-2 mb-6"
        style={{ color: "var(--dark)" }}
      >
        <li>
          1. In your{" "}
          <a
            href="https://developer.spotify.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--slate-blue)" }}
          >
            Spotify Developer Dashboard
          </a>
          , add <code>http://localhost:3000/api/spotify/callback</code> as a Redirect URI.
        </li>
        <li>
          2. Visit <code>/api/spotify/login</code> in your browser to authorize.
        </li>
        <li>
          3. Copy the <code>refresh_token</code> from the response and paste it into{" "}
          <code>.env.local</code> as <code>SPOTIFY_REFRESH_TOKEN</code>.
        </li>
        <li>4. Restart the dev server — this page will populate automatically.</li>
      </ol>
      <Link
        href="/api/spotify/login"
        className="inline-block px-6 py-2.5 rounded-full text-sm font-medium"
        style={{ background: "#1DB954", color: "white" }}
      >
        Connect Spotify
      </Link>
    </div>
  );
}
