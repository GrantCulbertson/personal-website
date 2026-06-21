import { describe, test, expect } from "vitest";
import { aggregateDailyGenres, type ScrobbleRow } from "./listening";

describe("aggregateDailyGenres", () => {
  test("groups plays by date and sums daily totals", () => {
    const rows: ScrobbleRow[] = [
      { date: "2026-01-02", artist_name: "Radiohead", plays: 3 },
      { date: "2026-01-02", artist_name: "Aphex Twin", plays: 2 },
      { date: "2026-01-01", artist_name: "Radiohead", plays: 4 },
    ];
    const artistGenre = { radiohead: "rock", "aphex twin": "electronic" };

    const { days } = aggregateDailyGenres(rows, artistGenre);

    // chronological order
    expect(days.map(d => d.date)).toEqual(["2026-01-01", "2026-01-02"]);
    expect(days[0].total).toBe(4);
    expect(days[1].total).toBe(5);
  });

  test("splits daily plays by genre, unknown artists fall into 'other'", () => {
    const rows: ScrobbleRow[] = [
      { date: "2026-01-02", artist_name: "Radiohead", plays: 3 },
      { date: "2026-01-02", artist_name: "Aphex Twin", plays: 2 },
      { date: "2026-01-02", artist_name: "Some Local Band", plays: 1 },
    ];
    const artistGenre = { radiohead: "rock", "aphex twin": "electronic" };

    const { days } = aggregateDailyGenres(rows, artistGenre);

    expect(days[0].byGenre).toEqual({ rock: 3, electronic: 2, other: 1 });
  });

  test("ranks topGenres by total plays and excludes 'other'", () => {
    const rows: ScrobbleRow[] = [
      { date: "2026-01-01", artist_name: "Radiohead", plays: 5 },
      { date: "2026-01-01", artist_name: "Aphex Twin", plays: 9 },
      { date: "2026-01-01", artist_name: "Unknown", plays: 100 },
    ];
    const artistGenre = { radiohead: "rock", "aphex twin": "electronic" };

    const { topGenres } = aggregateDailyGenres(rows, artistGenre);

    // electronic (9) ranked above rock (5); "other" (100) excluded
    expect(topGenres).toEqual(["electronic", "rock"]);
  });

  test("limits topGenres to the requested count", () => {
    const rows: ScrobbleRow[] = [
      { date: "2026-01-01", artist_name: "A", plays: 5 },
      { date: "2026-01-01", artist_name: "B", plays: 4 },
      { date: "2026-01-01", artist_name: "C", plays: 3 },
    ];
    const artistGenre = { a: "rock", b: "jazz", c: "pop" };

    const { topGenres } = aggregateDailyGenres(rows, artistGenre, 2);

    expect(topGenres).toEqual(["rock", "jazz"]);
  });
});
