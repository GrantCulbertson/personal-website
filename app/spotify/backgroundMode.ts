export type BackgroundMode = "art" | "fallback" | "none";

/**
 * Decide which fixed background the Spotify page should show.
 *
 * - "art": a session is active and Spotify gave us cover art (or we're
 *   still holding onto the previous track's art during a transition) —
 *   blur that art behind the page, unchanged from prior behavior.
 * - "fallback": a session is active (playing or last-played) but there's
 *   no art at all — e.g. a local file with no embedded artwork. Use the
 *   same static hero background and dark theme as the resume page instead
 *   of falling back to the plain light theme.
 * - "none": nothing is playing and there's no last-played history.
 */
export function getBackgroundMode(isActive: boolean, hasArt: boolean): BackgroundMode {
  if (!isActive) return "none";
  return hasArt ? "art" : "fallback";
}
