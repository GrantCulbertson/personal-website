"use client";

import { useEffect, useRef, useState } from "react";
import { fetchNowPlayingState, type NowPlayingState } from "./nowPlayingClient";
import { getBackgroundMode } from "./backgroundMode";

export type { NowPlayingState };

// Shared context so both this and NowPlaying don't double-poll
let sharedState: NowPlayingState = { isPlaying: false };
const listeners = new Set<(s: NowPlayingState) => void>();

async function fetchNowPlaying() {
  // Resilient fetch (retries transient failures) so a blip on page load
  // doesn't leave the card blank until the next 30s poll.
  const json = await fetchNowPlayingState();
  if (json) {
    sharedState = { ...json, loaded: true };
    listeners.forEach((fn) => fn(sharedState));
  }
}

let intervalStarted = false;
function startSharedPolling() {
  if (intervalStarted) return;
  intervalStarted = true;
  fetchNowPlaying();
  setInterval(fetchNowPlaying, 30_000);
}

export function useNowPlaying() {
  const [state, setState] = useState<NowPlayingState>(sharedState);
  useEffect(() => {
    setState(sharedState);
    listeners.add(setState);
    startSharedPolling();
    return () => { listeners.delete(setState); };
  }, []);
  return state;
}

export default function SpotifyBackground() {
  const { albumArt } = useNowPlaying();
  const prevArt = useRef<string | undefined>(undefined);

  // Keep previous art visible while transitioning
  const displayArt = albumArt ?? prevArt.current;
  useEffect(() => {
    if (albumArt) prevArt.current = albumArt;
  }, [albumArt]);

  const mode = getBackgroundMode(!!displayArt);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      {mode === "art" && (
        <>
          {/* Blurred, saturated album art */}
          <div
            style={{
              position: "absolute",
              inset: "-80px",
              backgroundImage: `url(${displayArt})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(72px) saturate(1.8) brightness(0.7)",
              transform: "scale(1.25)",
            }}
          />
          {/* Dark gradient so content stays readable */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(160deg, rgba(10,10,20,0.72) 0%, rgba(10,10,20,0.82) 100%)",
            }}
          />
        </>
      )}

      {mode === "fallback" && (
        <>
          {/* No cover art (e.g. a local file) — reuse the resume page's
              hero background so the page doesn't fall back to the plain
              light theme mid-session. */}
          <div
            style={{
              position: "absolute",
              inset: "-60px",
              backgroundImage: "url(/hero.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(24px) saturate(1.8) brightness(0.9)",
              transform: "scale(1.1)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(160deg, rgba(10,12,30,0.45) 0%, rgba(10,12,30,0.55) 100%)",
            }}
          />
        </>
      )}
    </div>
  );
}
