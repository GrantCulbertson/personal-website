"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import NowPlaying from "./NowPlaying";
import DailyChart from "./DailyChart";
import { useNowPlaying } from "./SpotifyBackground";

import type { DayHistory } from "@/lib/spotify";

interface Props {
  notSetUp: boolean;
  topTracksData: { items: SpotifyTrack[] } | null;
  topArtistsData: { items: SpotifyArtist[] } | null;
  days: DayHistory[] | null;
  topGenres: string[] | null;
  mediaTypes: string[] | null;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  external_urls: { spotify: string };
  duration_ms: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
  external_urls: { spotify: string };
}

function msToMin(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function SpotifyContent({ notSetUp, topTracksData, topArtistsData, days, topGenres, mediaTypes }: Props) {
  const { isPlaying, isLastPlayed, albumArt } = useNowPlaying();
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  // Switch to dark/lit mode whenever there's album art — playing or last played
  const lit = (isPlaying || !!isLastPlayed) && !!albumArt;

  // Dynamic style helpers
  const pageText    = lit ? "rgba(255,255,255,0.9)"   : "var(--dark)";
  const mutedText   = lit ? "rgba(255,255,255,0.5)"   : "var(--muted)";
  const labelText   = lit ? "rgba(255,255,255,0.45)"  : "var(--muted)";
  const cardBg      = lit ? "rgba(255,255,255,0.08)"  : "white";
  const cardBorder  = lit ? "rgba(255,255,255,0.12)"  : "var(--cream-dark)";
  const cardBackdrop = lit ? "blur(20px)" : "none";
  const rowHover    = lit ? "rgba(255,255,255,0.06)"  : "var(--cream)";
  const rowDivider  = lit ? "rgba(255,255,255,0.07)"  : "var(--cream)";

  const card = {
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    backdropFilter: cardBackdrop,
    WebkitBackdropFilter: cardBackdrop,
    transition: "background 0.8s ease, border 0.8s ease",
  } as React.CSSProperties;

  return (
    <div
      className={`min-h-screen pt-16${ready ? " page-ready" : ""}`}
      style={{
        background: "transparent",
        position: "relative",
        zIndex: 1,
        transition: "color 0.8s ease",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10" style={{ transition: "color 0.8s ease" }}>
          <div className="fade-up flex items-center gap-3 mb-3" style={{ animationDelay: "0.05s" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#1DB954">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <h1 className="font-semibold tracking-tight" style={{ fontSize: "1.75rem", color: pageText, transition: "color 0.8s ease" }}>
              Listening Dashboard
            </h1>
          </div>
          <p className="fade-up text-sm" style={{ color: mutedText, transition: "color 0.8s ease", animationDelay: "0.12s" }}>
            What I&apos;ve been playing lately — data pulled live from Spotify.
          </p>
        </div>

        {notSetUp ? (
          <SetupBanner />
        ) : (
          <div className="space-y-10">
            {/* Now Playing */}
            <section className="fade-up" style={{ animationDelay: "0.2s" }}>
              <SectionLabel color={labelText}>Now Playing</SectionLabel>
              <NowPlaying isLit={lit} />
            </section>

            {/* Top tracks + artists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ alignItems: "stretch" }}>
              {/* Top Tracks */}
              <section className="fade-up flex flex-col" style={{ animationDelay: "0.3s" }}>
                <SectionLabel color={labelText}>Top Tracks · Last 4 Weeks</SectionLabel>
                <div className="rounded-2xl overflow-hidden flex-1" style={card}>
                  {topTracksData?.items?.slice(0, 6).map((track, i) => (
                    <a
                      key={track.id}
                      href={track.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                      style={{
                        borderBottom: i < 5 ? `1px solid ${rowDivider}` : "none",
                        textDecoration: "none",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = rowHover)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span className="text-xs w-5 text-right flex-shrink-0" style={{ color: mutedText }}>{i + 1}</span>
                      <div className="relative flex-shrink-0 rounded overflow-hidden" style={{ width: 40, height: 40 }}>
                        <Image src={track.album.images?.[0]?.url} alt={track.name} fill style={{ objectFit: "cover" }} sizes="40px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: pageText }}>{track.name}</p>
                        <p className="text-xs truncate" style={{ color: mutedText }}>{track.artists.map(a => a.name).join(", ")}</p>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: mutedText }}>{msToMin(track.duration_ms)}</span>
                    </a>
                  )) ?? <EmptyState color={mutedText} />}
                </div>
              </section>

              {/* Top Artists */}
              <section className="fade-up flex flex-col" style={{ animationDelay: "0.38s" }}>
                <SectionLabel color={labelText}>Top Artists · Last 4 Weeks</SectionLabel>
                <div className="grid grid-cols-2 gap-3 flex-1 content-start">
                  {topArtistsData?.items?.map((artist) => (
                    <a
                      key={artist.id}
                      href={artist.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl p-4 flex flex-col items-center text-center gap-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                      style={{ ...card, textDecoration: "none" }}
                    >
                      <div className="relative rounded-full overflow-hidden flex-shrink-0" style={{ width: 72, height: 72 }}>
                        {artist.images?.[0]?.url ? (
                          <Image src={artist.images[0].url} alt={artist.name} fill style={{ objectFit: "cover" }} sizes="72px" />
                        ) : (
                          <div className="w-full h-full" style={{ background: lit ? "rgba(255,255,255,0.1)" : "var(--cream-dark)" }} />
                        )}
                      </div>
                      <p className="text-sm font-semibold leading-tight" style={{ color: pageText }}>{artist.name}</p>
                    </a>
                  )) ?? <EmptyState color={mutedText} />}
                </div>
              </section>
            </div>

            {/* Daily minutes chart */}
            <section className="fade-up" style={{ animationDelay: "0.46s" }}>
              <SectionLabel color={labelText}>Minutes Listened by Day · Recent History</SectionLabel>
              <div style={card} className="rounded-2xl">
                <DailyChart days={days ?? []} topGenres={topGenres ?? []} mediaTypes={mediaTypes ?? []} lit={lit} />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color, transition: "color 0.8s ease" }}>
      {children}
    </p>
  );
}

function EmptyState({ color }: { color: string }) {
  return <p className="p-6 text-sm text-center" style={{ color }}>No data available</p>;
}

function SetupBanner() {
  return (
    <div className="rounded-2xl p-8 text-center" style={{ background: "white", border: "1px solid var(--cream-dark)" }}>
      <p className="font-semibold mb-2" style={{ color: "var(--dark)" }}>Spotify not connected yet</p>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        Complete the one-time OAuth flow to get a refresh token, then add it to <code>.env.local</code>.
      </p>
      <ol className="text-sm text-left inline-block space-y-2 mb-6" style={{ color: "var(--dark)" }}>
        <li>1. Add <code>http://127.0.0.1:3000/api/spotify/callback</code> as a Redirect URI in your <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: "var(--slate-blue)" }}>Spotify Dashboard</a>.</li>
        <li>2. Visit <code>/api/spotify/login</code> to authorize.</li>
        <li>3. Copy the <code>refresh_token</code> → paste into <code>.env.local</code> as <code>SPOTIFY_REFRESH_TOKEN</code>.</li>
        <li>4. Restart the dev server.</li>
      </ol>
      <Link href="/api/spotify/login" className="inline-block px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg" style={{ background: "#1DB954", color: "white" }}>
        Connect Spotify
      </Link>
    </div>
  );
}
