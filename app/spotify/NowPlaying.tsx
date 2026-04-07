"use client";

import Image from "next/image";
import { useNowPlaying } from "./SpotifyBackground";

export default function NowPlaying({ isLit }: { isLit?: boolean }) {
  const data = useNowPlaying();

  const cardStyle = isLit
    ? { background: "rgba(255,255,255,0.10)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)" }
    : { background: "white", border: "1px solid var(--cream-dark)" };

  const textPrimary = isLit ? "rgba(255,255,255,0.95)" : "var(--dark)";
  const textMuted   = isLit ? "rgba(255,255,255,0.55)" : "var(--muted)";
  const progressBg  = isLit ? "rgba(255,255,255,0.15)" : "var(--cream-dark)";
  const btnBg       = isLit ? "rgba(255,255,255,0.12)" : "var(--cream)";
  const btnHoverBg  = isLit ? "rgba(255,255,255,0.2)"  : "var(--cream-dark)";

  // Show skeleton on first render
  if (!data.isPlaying && !data.isLastPlayed && data.albumArt === undefined) {
    return (
      <div className="rounded-2xl p-6 animate-pulse" style={{ ...cardStyle, height: 100 }} />
    );
  }

  // Nothing playing, no history either
  if (!data.isPlaying && !data.isLastPlayed) {
    return (
      <div className="rounded-2xl p-6 flex items-center gap-4" style={cardStyle}>
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 48, height: 48, background: isLit ? "rgba(255,255,255,0.12)" : "var(--cream)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={textMuted}>
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: textMuted }}>
            Not currently playing
          </p>
          <p className="text-sm mt-0.5" style={{ color: textPrimary }}>Spotify is paused</p>
        </div>
      </div>
    );
  }

  const progress = data.durationMs && data.progressMs
    ? Math.min((data.progressMs / data.durationMs) * 100, 100)
    : 0;

  const isLastPlayed = !data.isPlaying && data.isLastPlayed;

  return (
    <div className="rounded-2xl p-5 flex items-center gap-5" style={cardStyle}>
      {/* Album art — links to Spotify */}
      <a
        href={data.songUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 rounded-lg overflow-hidden"
        style={{ display: "block", width: 64, height: 64, position: "relative" }}
        tabIndex={-1}
      >
        {data.albumArt ? (
          <Image src={data.albumArt} alt={data.album ?? ""} fill style={{ objectFit: "cover" }} sizes="64px" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: isLit ? "rgba(255,255,255,0.1)" : "var(--cream-dark)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill={isLit ? "rgba(255,255,255,0.45)" : "var(--muted)"}>
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6zm-2 16a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
            </svg>
          </div>
        )}
      </a>

      {/* Track info + controls */}
      <div className="flex-1 min-w-0">
        {/* Top row: label + control buttons */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {isLastPlayed ? (
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
                Last played
              </span>
            ) : (
              <>
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#1DB954" }}>
                  Now Playing
                </span>
                {/* Animated equalizer bars */}
                <span className="flex items-end gap-0.5" style={{ height: 14 }}>
                  {([
                    { dur: "0.55s", fromH: 4  },
                    { dur: "0.7s",  fromH: 12 },
                    { dur: "0.45s", fromH: 6  },
                  ] as const).map(({ dur, fromH }, i) => (
                    <span
                      key={i}
                      className="inline-block"
                      style={{
                        width: 3, height: fromH,
                        background: "#1DB954", borderRadius: 2,
                        animation: `eq-bar-${i + 1} ${dur} ease-in-out infinite alternate`,
                        animationFillMode: "both",
                      }}
                    />
                  ))}
                </span>
              </>
            )}
          </div>

          {/* Open in Spotify */}
          <a
            href={data.songUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open in Spotify"
            onMouseEnter={e => (e.currentTarget.style.background = btnHoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = btnBg)}
            style={{
              width: 28, height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: btnBg,
              transition: "background 0.15s ease",
              flexShrink: 0,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={textPrimary}>
              <path d="M8 5v14l11-7z"/>
            </svg>
          </a>
        </div>

        {/* Title */}
        <a
          href={data.songUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-sm truncate block hover:underline"
          style={{ color: textPrimary, textDecoration: "none" }}
        >
          {data.title}
        </a>

        {/* Artist · Album */}
        <p className="text-xs truncate mt-0.5" style={{ color: textMuted }}>
          {data.artist} · {data.album}
        </p>

        {/* Progress bar (only when actively playing) */}
        {data.isPlaying && (
          <div className="mt-2 rounded-full overflow-hidden" style={{ height: 3, background: progressBg }}>
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "#1DB954" }} />
          </div>
        )}

      </div>
    </div>
  );
}
