const TOKEN_URL = "https://accounts.spotify.com/api/token";

export async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res: Response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN!,
    }),
    cache: "no-store",
  });

  const data = await res.json();
  return data.access_token as string;
}

export async function getNowPlaying() {
  const token = await getAccessToken();
  const res: Response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 204 || res.status > 400) return null;
  return res.json();
}

export async function getRecentlyPlayed(limit = 10) {
  const token = await getAccessToken();
  const res: Response = await fetch(
    `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function getTopTracks(limit = 10, time_range = "short_term") {
  const token = await getAccessToken();
  const res: Response = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?limit=${limit}&time_range=${time_range}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    }
  );
  if (!res.ok) return null;
  return res.json();
}

export interface DayHistory {
  date: string;
  total: number;
  byGenre: Record<string, number>;
  byMediaType: Record<string, number>;
}

export interface DailyHistoryResult {
  days: DayHistory[];
  topGenres: string[];
  mediaTypes: string[];
}

export async function getDailyHistory(): Promise<DailyHistoryResult | null> {
  const token = await getAccessToken();
  const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();

  const allItems: {
    track?: { duration_ms: number; artists: { id: string }[]; type?: string } | null;
    episode?: { duration_ms: number; show?: { name: string } } | null;
    played_at: string;
  }[] = [];

  let url: string | null =
    "https://api.spotify.com/v1/me/player/recently-played?limit=50";

  // Cache each page for 1 hour to avoid hammering Spotify on every load
  for (let page = 0; page < 20 && url; page++) {
    const res: Response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    } as RequestInit);
    if (!res.ok) break;
    const data = await res.json();
    if (!data.items?.length) break;

    allItems.push(...data.items);

    const oldest = new Date(data.items[data.items.length - 1].played_at).getTime();
    if (oldest < yearStart) break;
    url = data.next ?? null;
  }

  // Batch-fetch artist genres for all unique artists (music only)
  const artistIdSet = new Set<string>();
  for (const item of allItems) {
    for (const artist of item.track?.artists ?? []) artistIdSet.add(artist.id);
  }
  const artistIds = [...artistIdSet].slice(0, 50);

  const artistGenres: Record<string, string> = {};
  if (artistIds.length > 0) {
    const aRes = await fetch(
      `https://api.spotify.com/v1/artists?ids=${artistIds.join(",")}`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 3600 } }
    );
    if (aRes.ok) {
      const aData = await aRes.json();
      for (const artist of aData.artists ?? []) {
        if (artist?.genres?.[0]) artistGenres[artist.id] = artist.genres[0];
      }
    }
  }

  // Aggregate per day
  const dayMap: Record<string, { total: number; byGenre: Record<string, number>; byMediaType: Record<string, number> }> = {};
  for (const item of allItems) {
    const playedAt = new Date(item.played_at);
    if (playedAt.getTime() < yearStart) continue;
    const date = playedAt.toISOString().slice(0, 10);

    const isEpisode = !!item.episode && !item.track;
    const durationMs = isEpisode
      ? (item.episode?.duration_ms ?? 0)
      : (item.track?.duration_ms ?? 0);
    const mins = durationMs / 60_000;
    const mediaType = isEpisode ? "podcast" : "music";
    const genre = isEpisode
      ? "other"
      : (artistGenres[item.track?.artists?.[0]?.id ?? ""] ?? "other");

    if (!dayMap[date]) dayMap[date] = { total: 0, byGenre: {}, byMediaType: {} };
    dayMap[date].total += mins;
    dayMap[date].byGenre[genre] = (dayMap[date].byGenre[genre] ?? 0) + mins;
    dayMap[date].byMediaType[mediaType] = (dayMap[date].byMediaType[mediaType] ?? 0) + mins;
  }

  // Fill Jan 1 → today
  const today = new Date();
  const days: DayHistory[] = [];
  const d = new Date(yearStart);
  while (d <= today) {
    const key = d.toISOString().slice(0, 10);
    const entry = dayMap[key];
    days.push({
      date: key,
      total: entry ? Math.round(entry.total) : 0,
      byGenre: entry
        ? Object.fromEntries(Object.entries(entry.byGenre).map(([g, m]) => [g, Math.round(m)]))
        : {},
      byMediaType: entry
        ? Object.fromEntries(Object.entries(entry.byMediaType).map(([t, m]) => [t, Math.round(m)]))
        : {},
    });
    d.setDate(d.getDate() + 1);
  }

  // Top 6 genres by total
  const genreTotals: Record<string, number> = {};
  for (const day of days) {
    for (const [g, m] of Object.entries(day.byGenre)) {
      genreTotals[g] = (genreTotals[g] ?? 0) + m;
    }
  }
  const topGenres = Object.entries(genreTotals)
    .filter(([g]) => g !== "other")
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([g]) => g);

  // Collect present media types in order: music first, then podcast
  const mediaTypeSet = new Set<string>();
  for (const day of days) {
    for (const t of Object.keys(day.byMediaType)) mediaTypeSet.add(t);
  }
  const mediaTypes = ["music", "podcast"].filter(t => mediaTypeSet.has(t));

  return { days, topGenres, mediaTypes };
}

export async function getDailyMinutes() {
  const token = await getAccessToken();
  const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();

  const allItems: {
    track: { duration_ms: number };
    played_at: string;
  }[] = [];

  // Spotify's `next` URL is a ready-to-use cursor pointing to older items
  let url: string | null =
    "https://api.spotify.com/v1/me/player/recently-played?limit=50";

  // Paginate up to 20 pages (1000 plays) back towards Jan 1
  for (let page = 0; page < 20 && url; page++) {
    const res: Response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) break;
    const data = await res.json();
    if (!data.items?.length) break;

    allItems.push(...data.items);

    const oldest = new Date(data.items[data.items.length - 1].played_at).getTime();
    if (oldest < yearStart) break;

    url = data.next ?? null;
  }

  // Aggregate ms by calendar day
  const dayMap: Record<string, number> = {};
  for (const item of allItems) {
    const playedAt = new Date(item.played_at);
    if (playedAt.getTime() < yearStart) continue;
    const key = playedAt.toISOString().slice(0, 10);
    dayMap[key] = (dayMap[key] ?? 0) + (item.track.duration_ms ?? 0);
  }

  // Build full array Jan 1 → today
  const today = new Date();
  const result: { date: string; minutes: number }[] = [];
  const d = new Date(yearStart);
  while (d <= today) {
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, minutes: Math.round((dayMap[key] ?? 0) / 60_000) });
    d.setDate(d.getDate() + 1);
  }
  return result;
}

export async function getGenreMinutes(topN = 8) {
  const token = await getAccessToken();

  // Fetch recently played (max 50)
  const recentRes = await fetch(
    "https://api.spotify.com/v1/me/player/recently-played?limit=50",
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  if (!recentRes.ok) return null;
  const recentData = await recentRes.json();

  // Collect unique artist IDs (up to 50 for batch endpoint)
  const artistIdSet = new Set<string>();
  for (const item of recentData.items) {
    for (const artist of item.track.artists) {
      artistIdSet.add(artist.id);
    }
  }
  const artistIds = [...artistIdSet].slice(0, 50);

  // Batch-fetch artist details to get genres
  const artistRes = await fetch(
    `https://api.spotify.com/v1/artists?ids=${artistIds.join(",")}`,
    { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 3600 } }
  );
  if (!artistRes.ok) return null;
  const artistData = await artistRes.json();

  const artistGenres: Record<string, string[]> = {};
  for (const artist of artistData.artists ?? []) {
    if (artist) artistGenres[artist.id] = artist.genres ?? [];
  }

  // Sum duration_ms by primary genre
  const genreMs: Record<string, number> = {};
  for (const item of recentData.items) {
    const primaryArtistId = item.track.artists[0]?.id;
    const genre = artistGenres[primaryArtistId]?.[0];
    if (genre) {
      genreMs[genre] = (genreMs[genre] ?? 0) + (item.track.duration_ms ?? 0);
    }
  }

  return Object.entries(genreMs)
    .map(([genre, ms]) => ({ genre, minutes: Math.round(ms / 60_000) }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, topN);
}

export async function getTopArtists(limit = 6, time_range = "short_term") {
  const token = await getAccessToken();
  const res: Response = await fetch(
    `https://api.spotify.com/v1/me/top/artists?limit=${limit}&time_range=${time_range}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    }
  );
  if (!res.ok) return null;
  return res.json();
}
