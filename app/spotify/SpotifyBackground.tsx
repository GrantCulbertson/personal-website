"use client";

import { useEffect, useRef, useState } from "react";
import { fetchNowPlayingState, type NowPlayingState } from "./nowPlayingClient";

export type { NowPlayingState };

// Shared context so both this and NowPlaying don't double-poll
let sharedState: NowPlayingState = { isPlaying: false };
const listeners = new Set<(s: NowPlayingState) => void>();

async function fetchNowPlaying() {
  // Resilient fetch (retries transient failures) so a blip on page load
  // doesn't leave the card blank until the next 30s poll.
  const json = await fetchNowPlayingState();
  if (json) {
    sharedState = json;
    listeners.forEach((fn) => fn(json));
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
  const { isPlaying, isLastPlayed, albumArt } = useNowPlaying();
  const prevArt = useRef<string | undefined>(undefined);

  // Keep previous art visible while transitioning
  const displayArt = albumArt ?? prevArt.current;
  useEffect(() => {
    if (albumArt) prevArt.current = albumArt;
  }, [albumArt]);

  const visible = (isPlaying || !!isLastPlayed) && !!displayArt;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        transition: "opacity 1.2s ease",
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Blurred, saturated album art */}
      {displayArt && (
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
      )}
      {/* Dark gradient so content stays readable */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(160deg, rgba(10,10,20,0.72) 0%, rgba(10,10,20,0.82) 100%)",
        }}
      />
    </div>
  );
}
