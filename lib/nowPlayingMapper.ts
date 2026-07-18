export interface MappedNowPlaying {
  isPlaying: true;
  title: string;
  artist: string;
  album: string;
  albumArt?: string;
  songUrl?: string;
  trackUri?: string;
  progressMs?: number;
  durationMs?: number;
}

interface SpotifyArtist { name: string }
interface SpotifyShow { name: string; publisher: string }
interface SpotifyImage { url: string }

interface SpotifyCurrentlyPlayingItem {
  name: string;
  duration_ms?: number;
  uri?: string;
  external_urls?: { spotify?: string };
  // Track fields
  artists?: SpotifyArtist[];
  album?: { name: string; images?: SpotifyImage[] };
  // Episode fields (requires `additional_types=episode` on the request)
  show?: SpotifyShow;
  images?: SpotifyImage[];
}

interface SpotifyCurrentlyPlayingResponse {
  is_playing?: boolean;
  progress_ms?: number;
  item?: SpotifyCurrentlyPlayingItem | null;
}

/**
 * Map Spotify's currently-playing response to the shape the now-playing UI
 * consumes, handling both tracks and podcast episodes. Episodes have no
 * `artists`/`album`, and their artwork lives at `item.images` rather than
 * `item.album.images` — so for episodes we surface the show name as the
 * "artist" line and the publisher as the "album" line.
 *
 * `item` is `null` when Spotify is playing an episode but the request omitted
 * `additional_types=episode` (the API defaults to track-only recognition).
 */
export function mapCurrentlyPlaying(
  data: SpotifyCurrentlyPlayingResponse | null | undefined,
): MappedNowPlaying | null {
  if (!data?.is_playing || !data.item) return null;
  const item = data.item;

  const isEpisode = !!item.show;
  const artist = isEpisode ? item.show!.name : (item.artists ?? []).map((a) => a.name).join(", ");
  const album = isEpisode ? item.show!.publisher : item.album?.name ?? "";
  const albumArt = isEpisode ? item.images?.[0]?.url : item.album?.images?.[0]?.url;

  return {
    isPlaying: true,
    title: item.name,
    artist,
    album,
    albumArt,
    songUrl: item.external_urls?.spotify,
    trackUri: item.uri,
    progressMs: data.progress_ms,
    durationMs: item.duration_ms,
  };
}
