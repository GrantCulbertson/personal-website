import { describe, test, expect } from "vitest";
import { getBackgroundMode } from "./backgroundMode";

describe("getBackgroundMode", () => {
  test("no session (not playing, no last played) is always 'none', even with stale art", () => {
    expect(getBackgroundMode(false, false)).toBe("none");
    expect(getBackgroundMode(false, true)).toBe("none");
  });

  test("active session with art uses the blurred album-art background", () => {
    expect(getBackgroundMode(true, true)).toBe("art");
  });

  test("active session without art (e.g. a local file) falls back to the resume-style background", () => {
    expect(getBackgroundMode(true, false)).toBe("fallback");
  });
});
