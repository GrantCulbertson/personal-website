import type { DayHistory, DailyHistoryResult } from "./spotify";
import { getAccessToken } from "./spotify";
import { getDb } from "./db";

export interface ScrobbleRow {
  date: string;
  artist_name: string;
  plays: number;
}

// Cap genre enrichment to the most-played artists. These cover the vast
// majority of listening volume; everything else folds into "other".
const TOP_ARTIST_LIMIT = 50;

/**
 * Pure aggregation: turn per-day, per-artist scrobble counts into the
 * DayHistory shape the chart consumes, deriving genre from an
 * artist-name → genre map. Artists with no known genre fall into "other".
 */
export function aggregateDailyGenres(
  rows: ScrobbleRow[],
  artistGenre: Record<string, string>,
  topGenreCount = 6,
): { days: DayHistory[]; topGenres: string[] } {
  const dayMap: Record<string, { total: number; byGenre: Record<string, number> }> = {};

  for (const row of rows) {
    const genre = artistGenre[row.artist_name.toLowerCase()] ?? "other";
    if (!dayMap[row.date]) dayMap[row.date] = { total: 0, byGenre: {} };
    dayMap[row.date].total += row.plays;
    dayMap[row.date].byGenre[genre] = (dayMap[row.date].byGenre[genre] ?? 0) + row.plays;
  }

  const days: DayHistory[] = Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, entry]) => ({
      date,
      total: entry.total,
      byGenre: entry.byGenre,
      byMediaType: {},
    }));

  const genreTotals: Record<string, number> = {};
  for (const day of days) {
    for (const [g, p] of Object.entries(day.byGenre)) {
      genreTotals[g] = (genreTotals[g] ?? 0) + p;
    }
  }
  const topGenres = Object.entries(genreTotals)
    .filter(([g]) => g !== "other")
    .sort(([, a], [, b]) => b - a)
    .slice(0, topGenreCount)
    .map(([g]) => g);

  return { days, topGenres };
}

/** Rank artists by total plays and return the top N names. */
function topArtistsByPlays(rows: ScrobbleRow[], limit: number): string[] {
  const totals: Record<string, number> = {};
  for (const row of rows) {
    totals[row.artist_name] = (totals[row.artist_name] ?? 0) + row.plays;
  }
  return Object.entries(totals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([name]) => name);
}

/**
 * Look up each artist's primary genre via Spotify's search endpoint, which
 * returns full artist objects (including `genres`) — one request per artist.
 * Returns a lowercased artist-name → genre map.
 */
async function fetchArtistGenres(artistNames: string[]): Promise<Record<string, string>> {
  if (artistNames.length === 0) return {};
  const token = await getAccessToken();
  const artistGenre: Record<string, string> = {};

  await Promise.all(
    artistNames.map(async (name) => {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=1`,
        { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 86400 } },
      );
      if (!res.ok) return;
      const data = await res.json();
      const genre = data.artists?.items?.[0]?.genres?.[0];
      if (genre) artistGenre[name.toLowerCase()] = genre;
    }),
  );

  return artistGenre;
}

/**
 * Year-to-date daily listening history sourced from the Neon scrobbles table,
 * with genre derived from Spotify. The y-axis metric is play count (scrobbles),
 * not minutes — the table has no duration. Returns null if the query fails.
 */
export async function getDailyScrobbleHistory(): Promise<DailyHistoryResult | null> {
  const yearStart = `${new Date().getFullYear()}-01-01`;

  let rows: ScrobbleRow[];
  try {
    const result = await getDb().query<ScrobbleRow>(
      `SELECT date::text AS date, artist_name, COUNT(*)::int AS plays
         FROM scrobbles
        WHERE date >= $1
        GROUP BY date, artist_name
        ORDER BY date ASC`,
      [yearStart],
    );
    rows = result.rows;
  } catch (err) {
    console.error("Failed to query scrobbles from Neon:", err);
    return null;
  }

  if (rows.length === 0) return { days: [], topGenres: [], mediaTypes: [] };

  const artistGenre = await fetchArtistGenres(topArtistsByPlays(rows, TOP_ARTIST_LIMIT));
  const { days, topGenres } = aggregateDailyGenres(rows, artistGenre);

  return { days, topGenres, mediaTypes: [] };
}
