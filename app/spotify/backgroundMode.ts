export type BackgroundMode = "art" | "fallback";

/**
 * Decide which fixed background the Spotify page shows.
 *
 * - "art": Spotify gave us cover art (the current track, or the previous
 *   track's art held over during a transition) — blur that art behind
 *   the page.
 * - "fallback": there's no art determining the background — nothing
 *   playing, paused/idle, a last-played track with no art, or a
 *   currently-playing local file with no embedded artwork. Use the same
 *   static hero background as the resume page instead of the plain light
 *   theme, so the page keeps one consistent look in every other case.
 */
export function getBackgroundMode(hasArt: boolean): BackgroundMode {
  return hasArt ? "art" : "fallback";
}
