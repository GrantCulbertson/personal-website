export interface NowPlayingState {
  isPlaying: boolean;
  // Set once the first fetch has resolved; distinguishes "still loading" from
  // "loaded, but nothing is playing". Undefined until the first response.
  loaded?: boolean;
  isLastPlayed?: boolean;
  albumArt?: string;
  title?: string;
  artist?: string;
  album?: string;
  songUrl?: string;
  trackUri?: string;
  progressMs?: number;
  durationMs?: number;
}

interface FetchOpts {
  retries?: number;
  baseDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Fetch the now-playing state with resilience to transient failures. A single
 * request can fail on page load for reasons unrelated to playback — a network
 * blip, a serverless cold-start returning a non-JSON error page, or a momentary
 * Spotify hiccup. Rather than swallow that and leave the UI blank for a full
 * poll interval, retry a few times with short linear backoff. Returns null only
 * if every attempt fails.
 */
export async function fetchNowPlayingState(
  fetchImpl: typeof fetch = fetch,
  { retries = 3, baseDelayMs = 400, sleep = defaultSleep }: FetchOpts = {},
): Promise<NowPlayingState | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchImpl("/api/spotify/now-playing", { cache: "no-store" });
      if (!res.ok) throw new Error(`status ${res.status}`);
      return (await res.json()) as NowPlayingState;
    } catch {
      if (attempt === retries) return null;
      await sleep(baseDelayMs * (attempt + 1));
    }
  }
  return null;
}
