"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface NowPlayingData {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  songUrl?: string;
  progressMs?: number;
  durationMs?: number;
}

export default function NowPlaying() {
  const [data, setData] = useState<NowPlayingData | null>(null);

  useEffect(() => {
    const poll = async () => {
      const res = await fetch("/api/spotify/now-playing");
      const json = await res.json();
      setData(json);
    };
    poll();
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!data) {
    return (
      <div
        className="rounded-2xl p-6 animate-pulse"
        style={{ background: "white", border: "1px solid var(--cream-dark)", height: 100 }}
      />
    );
  }

  if (!data.isPlaying) {
    return (
      <div
        className="rounded-2xl p-6 flex items-center gap-4"
        style={{ background: "white", border: "1px solid var(--cream-dark)" }}
      >
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 48, height: 48, background: "var(--cream)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--muted)">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--muted)" }}>
            Not currently playing
          </p>
          <p className="text-sm mt-0.5" style={{ color: "var(--dark)" }}>
            Spotify is paused
          </p>
        </div>
      </div>
    );
  }

  const progress = data.durationMs
    ? Math.min((data.progressMs! / data.durationMs) * 100, 100)
    : 0;

  return (
    <a
      href={data.songUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-2xl p-5 flex items-center gap-5 transition-all duration-200 hover:shadow-lg block"
      style={{ background: "white", border: "1px solid var(--cream-dark)", textDecoration: "none" }}
    >
      {data.albumArt && (
        <div className="relative flex-shrink-0 rounded-lg overflow-hidden" style={{ width: 64, height: 64 }}>
          <Image src={data.albumArt} alt={data.album ?? ""} fill style={{ objectFit: "cover" }} sizes="64px" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#1DB954" }}>
            Now Playing
          </span>
          {/* Animated bars */}
          <span className="flex items-end gap-0.5 h-3">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className="inline-block rounded-full"
                style={{
                  width: 3,
                  background: "#1DB954",
                  animation: `eq-bar-${i} 0.8s ease-in-out infinite alternate`,
                  height: i === 2 ? 12 : 8,
                }}
              />
            ))}
          </span>
        </div>
        <p className="font-semibold text-sm truncate" style={{ color: "var(--dark)" }}>
          {data.title}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted)" }}>
          {data.artist} · {data.album}
        </p>
        <div
          className="mt-2 rounded-full overflow-hidden"
          style={{ height: 3, background: "var(--cream-dark)" }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, background: "#1DB954" }}
          />
        </div>
      </div>
    </a>
  );
}
