import { describe, test, expect, vi } from "vitest";
import { fetchNowPlayingState } from "./nowPlayingClient";

const noSleep = () => Promise.resolve();
function res(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response;
}

describe("fetchNowPlayingState", () => {
  test("returns the parsed state on first success", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res({ isPlaying: true, title: "X" }));
    const state = await fetchNowPlayingState(fetchImpl as unknown as typeof fetch, { sleep: noSleep });
    expect(state).toEqual({ isPlaying: true, title: "X" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  test("retries after a network rejection, then succeeds", async () => {
    const fetchImpl = vi.fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValue(res({ isPlaying: false, isLastPlayed: true }));
    const state = await fetchNowPlayingState(fetchImpl as unknown as typeof fetch, { retries: 3, sleep: noSleep });
    expect(state).toEqual({ isPlaying: false, isLastPlayed: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  test("retries after a non-ok response (e.g. cold-start error page), then succeeds", async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(res({}, false, 503))
      .mockResolvedValue(res({ isPlaying: true }));
    const state = await fetchNowPlayingState(fetchImpl as unknown as typeof fetch, { retries: 3, sleep: noSleep });
    expect(state).toEqual({ isPlaying: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  test("returns null after exhausting all retries", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("down"));
    const state = await fetchNowPlayingState(fetchImpl as unknown as typeof fetch, { retries: 2, sleep: noSleep });
    expect(state).toBeNull();
    expect(fetchImpl).toHaveBeenCalledTimes(3); // initial attempt + 2 retries
  });
});
