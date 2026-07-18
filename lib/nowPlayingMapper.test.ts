import { describe, test, expect } from "vitest";
import { mapCurrentlyPlaying } from "./nowPlayingMapper";

describe("mapCurrentlyPlaying", () => {
  test("maps a track item", () => {
    const data = {
      is_playing: true,
      currently_playing_type: "track",
      progress_ms: 12345,
      item: {
        name: "Long Time",
        artists: [{ name: "oliver archive" }, { name: "~" }],
        album: { name: "Long Time", images: [{ url: "https://img/track.jpg" }] },
        external_urls: { spotify: "https://open.spotify.com/track/abc" },
        uri: "spotify:track:abc",
        duration_ms: 154000,
      },
    };

    expect(mapCurrentlyPlaying(data)).toEqual({
      isPlaying: true,
      title: "Long Time",
      artist: "oliver archive, ~",
      album: "Long Time",
      albumArt: "https://img/track.jpg",
      songUrl: "https://open.spotify.com/track/abc",
      trackUri: "spotify:track:abc",
      progressMs: 12345,
      durationMs: 154000,
    });
  });

  test("maps a podcast episode item (show name as artist, publisher as album)", () => {
    const data = {
      is_playing: true,
      currently_playing_type: "episode",
      progress_ms: 2807204,
      item: {
        name: "Lev Menand and Nathan Tankus on Why Fed Independence Is Now Hanging by a Thread",
        show: { name: "Odd Lots", publisher: "Bloomberg" },
        images: [{ url: "https://img/episode.jpg" }],
        external_urls: { spotify: "https://open.spotify.com/episode/518vk4Z" },
        uri: "spotify:episode:518vk4Z",
        duration_ms: 3948382,
      },
    };

    expect(mapCurrentlyPlaying(data)).toEqual({
      isPlaying: true,
      title: "Lev Menand and Nathan Tankus on Why Fed Independence Is Now Hanging by a Thread",
      artist: "Odd Lots",
      album: "Bloomberg",
      albumArt: "https://img/episode.jpg",
      songUrl: "https://open.spotify.com/episode/518vk4Z",
      trackUri: "spotify:episode:518vk4Z",
      progressMs: 2807204,
      durationMs: 3948382,
    });
  });

  test("returns null when item is null (Spotify quirk: episode without additional_types)", () => {
    const data = { is_playing: true, currently_playing_type: "episode", item: null };
    expect(mapCurrentlyPlaying(data)).toBeNull();
  });

  test("returns null when is_playing is false", () => {
    const data = { is_playing: false, item: { name: "X" } };
    expect(mapCurrentlyPlaying(data)).toBeNull();
  });

  test("returns null when data is null", () => {
    expect(mapCurrentlyPlaying(null)).toBeNull();
  });
});
