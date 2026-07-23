import { describe, test, expect } from "vitest";
import { getBackgroundMode } from "./backgroundMode";

describe("getBackgroundMode", () => {
  test("returns 'art' whenever there is cover art to show", () => {
    expect(getBackgroundMode(true)).toBe("art");
  });

  test("returns 'fallback' whenever there is no cover art — regardless of play state", () => {
    // Covers: nothing playing, paused/idle, last-played with no art, and a
    // currently-playing local file with no embedded artwork — every case
    // where art isn't determining the background.
    expect(getBackgroundMode(false)).toBe("fallback");
  });
});
