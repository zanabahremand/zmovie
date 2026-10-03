/**
 * MajidAPI FilmRail — type definitions and API helpers.
 *
 * The majidapi.ir/movie/filmrail webservice exposes the following actions:
 *   - home                       → { slider, ...sections } for the home page
 *   - movies&page=N              → paginated movies
 *   - series&page=N              → paginated series
 *   - search&s=NAME              → search results
 *   - genres                     → list of {id, title, slug, image}
 *   - genre&id=ID&page=N         → paginated items by genre
 *   - details&id=ID&type=movies|series → full details + download_links + videos
 *
 * Response shapes seen in the wild:
 *   - success list:   { status: 200, ok: true, result: [ {videos_id, title, poster_url, ...}, ... ] }
 *   - success obj:    { status: 200, ok: true, result: { ...single object... } }
 *   - success home:   { status: 200, ok: true, result: { slider: {...}, ... } }
 *   - rate-limited:   { error: "Rate limit reached" }   (HTTP 429)
 *   - invalid token: { error: "توکن وارد شده صحیح نیست..." } (HTTP 401)
 *
 * Field mapping (filmrail → internal MediaListItem):
 *   videos_id       → id       (cast to number)
 *   title           → title
 *   secondary_title → persianTitle
 *   poster_url      → poster
 *   thumbnail_url   → thumbnail
 *   imdb_rating     → rate / imdb
 *   release         → year     (slice to 4 chars)
 *   runtime         → time / duration
 *   video_quality   → quality
 *   is_tvseries     → type ("0" → "movie", "1" → "serie")
 *   description     → description (kept raw, used by normalizeDetails)
 *   trailer         → trailer (URL)
 *   slug            → slug
 *   video_descadd   → dubbingInfo
 */

const API_BASE = "https://api.majidapi.ir/movie/filmrail";

/** Required user-agent for the download endpoint — specified by MajidAPI docs. */
export const DOWNLOAD_USER_AGENT =
  "Dalvik/2.1.0 (Linux; U; Android 9; SM-G9880 Build/PQ3B.190801.10101846)";

export type MediaType = "movie" | "serie";

/** Common shape of every list item — internally normalised. */
export interface MediaListItem {
  id: number;
  title: string;
  persianTitle?: string;
  poster?: string;
  thumbnail?: string;
  year?: string | number;
  rate?: string | number;
  imdb?: string | number;
  type?: MediaType;
  time?: string;
  duration?: string;
  quality?: string;
  description?: string;
  trailer?: string;
  slug?: string;
  dubbingInfo?: string;
  genres?: string[];
  /** Original imdbID (for OMDb items, used by streaming embeds). */
  imdbID?: string;
  /** TMDB id (when source is TMDB) — for streaming embeds and details lookup. */
  tmdb_id?: number;
  [key: string]: unknown;
}

/** A home endpoint slider slide. */
export interface HomeSlide {
  id: number;
  title: string;
  description?: string;
  poster?: string;
  trailer?: string;
  type?: MediaType;
  slug?: string;
  actionType?: string;
  actionBtnText?: string;
  actionId?: number;
}

export interface HomeResult {
  slider: HomeSlide[];
  latestMovies?: MediaListItem[];
  latestSeries?: MediaListItem[];
  featuredMovies?: MediaListItem[];
  popularStars?: { id: number; name: string; imageUrl?: string }[];
  allCountries?: { id: number; name: string; imageUrl?: string }[];
  allGenres?: Genre[];
  featuredTvChannels?: {
    id: number;
    name: string;
    streamUrl?: string;
    streamLabel?: string;
    isPaid?: string;
  }[];
  featuresGenreAndMovie?: {
    genreId: number;
    name: string;
    description?: string;
    slug?: string;
    videos?: MediaListItem[];
  }[];
  [key: string]: unknown;
}

export interface Genre {
  id: number;
  name: string;
  slug?: string;
  image?: string;
  [key: string]: unknown;
}

export interface DownloadLink {
  id?: number;
  quality?: string;
  resolution?: string;
  size?: string;
  url?: string;
  format?: string;
  lang?: string;
  host?: string;
  title?: string;
  type?: string;
  label?: string;
  [key: string]: unknown;
}

export interface VideoFile {
  id: number;
  label?: string;
  streamKey?: string;
  fileType?: string;
  fileUrl?: string;
  subtitles?: unknown[];
  [key: string]: unknown;
}

export interface CastMember {
  id?: number;
  name: string;
  imageUrl?: string;
  url?: string;
  [key: string]: unknown;
}

export interface MediaDetails extends MediaListItem {
  imdbRank?: string;
  awards?: string;
  dubbings?: unknown[];
  userRating?: number;
  rating?: string | number;
  totalRating?: string | number;
  isPaid?: string;
  enableSingleBuy?: string;
  priceSingleBuy?: number;
  hasSingleBuy?: string;
  enableDownload?: string;
  downloadLinks?: DownloadLink[];
  thumbnail?: string;
  logoUrl?: string;
  broadcastNetworkLogoUrl?: string;
  adLink?: string;
  videos?: VideoFile[];
  genres?: string[];
  genreList?: Genre[];
  countries?: CastMember[];
  directors?: CastMember[];
  writers?: CastMember[];
  cast?: CastMember[];
  director?: string;
  actors?: string[] | string;
  country?: string;
  releaseDate?: string;
  totalSeasons?: number;
  [key: string]: unknown;
}

/** Episode of a series — used for season browsing. */
export interface Episode {
  id: number;
  title: string;
  episode: number;
  season: number;
  released?: string;
  poster?: string;
  imdbID?: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * Internal fetcher used by the /api/majidapi proxy. Always uses the special user-agent.
 * Token is appended as ?token=... by the proxy caller.
 */
export async function callMajidApi(
  action: string,
  params: Record<string, string | number> = {},
  token: string
): Promise<unknown> {
  const url = new URL(API_BASE);
  url.searchParams.set("action", action);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  url.searchParams.set("token", token);

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": DOWNLOAD_USER_AGENT,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (res.status === 429) {
    throw new MajidRateLimitError();
  }

  // Detect monthly plan limit (HTTP 422 with FREE_TEST_PLAN_RATE_LIMIT_REACHED)
  if (res.status === 422 && json && typeof json === "object") {
    const body = json as Record<string, unknown>;
    const errCode = String(body.error || "");
    const errMsg = String(body.message || "");
    if (errCode.includes("FREE_TEST_PLAN") || errMsg.includes("پلن آزمایشی")) {
      throw new MajidPlanLimitError(errMsg);
    }
  }

  if (!res.ok) {
    const err = new MajidHttpError(
      `MajidAPI ${action} failed (${res.status}): ${
        typeof json === "string" ? json : JSON.stringify(json)
      }`,
      res.status,
      json
    );
    throw err;
  }

  return json;
}

export class MajidRateLimitError extends Error {
  constructor() {
    super("Rate limit reached");
    this.name = "MajidRateLimitError";
  }
}

export class MajidHttpError extends Error {
  status: number;
  body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "MajidHttpError";
    this.status = status;
    this.body = body;
  }
}

export class MajidUpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MajidUpstreamError";
  }
}

/** Monthly free-tier limit reached — token needs a paid plan. */
export class MajidPlanLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MajidPlanLimitError";
  }
}

/** Unwrap the various response shapes the API can return. */
function unwrapResponse(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const obj = raw as Record<string, unknown>;

  // { status, ok, result: ... }
  if ("result" in obj) {
    const result = obj.result;
    if (result && typeof result === "object") {
      const r = result as Record<string, unknown>;
      // Upstream error marker: { state_all: "F", msg: "..." }
      if (r.state_all === "F" || (r.state_all === "f" && r.msg)) {
        throw new MajidUpstreamError(
          String(r.msg || "منبع در حال حاضر در دسترس نیست")
        );
      }
      // Items wrapped in { items: [...] } or { list: [...] }
      if ("items" in r && Array.isArray(r.items)) return r.items;
      if ("list" in r && Array.isArray(r.list)) return r.list;
      // Otherwise return the inner result
      return result;
    }
    return result;
  }

  // { data: ... } / { list: ... } / { items: ... }
  for (const key of ["data", "list", "items", "results"]) {
    if (key in obj) return obj[key];
  }

  return raw;
}

/** Convert a raw filmrail list item into the internal MediaListItem shape. */
function mapFilmRailItem(raw: Record<string, unknown>): MediaListItem {
  // Parse id from videos_id — could be:
  //   - "10049" (numeric string from OMDb/filmrail)
  //   - "tmdb_12345" (TMDB items)
  //   - Number directly
  const rawVideosId = raw.videos_id ?? raw.id ?? raw.Id ?? raw.video_id ?? 0;
  let id: number;
  let tmdbId: number | undefined;
  if (typeof rawVideosId === "string" && rawVideosId.startsWith("tmdb_")) {
    const numPart = Number(rawVideosId.replace("tmdb_", ""));
    id = Number.isFinite(numPart) ? numPart : hashStrToNum(rawVideosId);
    tmdbId = Number.isFinite(numPart) ? numPart : undefined;
  } else {
    const num = Number(rawVideosId);
    id = Number.isFinite(num) ? num : hashStrToNum(String(rawVideosId));
  }

  const title = String(
    raw.title ?? raw.name ?? raw.secondary_title ?? "بدون عنوان"
  );
  const persianTitle = raw.secondary_title
    ? String(raw.secondary_title)
    : undefined;
  const poster = String(
    raw.poster_url ?? raw.poster ?? raw.image_link ?? raw.image ?? ""
  );
  const thumbnail = String(
    raw.thumbnail_url ?? raw.thumbnail ?? raw.thumb ?? ""
  );
  const rate = raw.imdb_rating ?? raw.imdb ?? raw.rate;
  const release = raw.release ?? raw.year;
  const year = release ? String(release).slice(0, 4) : undefined;
  const runtime = raw.runtime ?? raw.duration ?? raw.time;
  const quality = raw.video_quality ?? raw.quality;
  const isTvSeries =
    raw.is_tvseries ?? raw.is_tv_series ?? (raw.type === "tvseries" ? "1" : "0");
  const type: MediaType =
    String(isTvSeries) === "1" || raw.type === "tvseries" ? "serie" : "movie";
  const description = raw.description
    ? String(raw.description)
    : raw.summary
      ? String(raw.summary)
      : undefined;
  const trailer = raw.trailer ? String(raw.trailer) : undefined;
  const slug = raw.slug ? String(raw.slug) : undefined;
  const dubbingInfo = raw.video_descadd ? String(raw.video_descadd) : undefined;
  // imdbID (when source is OMDb-shaped: it lives in the videos_id field as a
  // "tt..." string; we keep both the numeric hash as `id` and the original
  // string as `imdbID`)
  const imdbID =
    typeof raw.videos_id === "string" &&
    (raw.videos_id as string).startsWith("tt")
      ? String(raw.videos_id)
      : typeof raw.imdb_id === "string"
        ? String(raw.imdb_id)
        : typeof raw.imdbID === "string"
          ? String(raw.imdbID)
          : undefined;

  return {
    id,
    title,
    persianTitle,
    poster: poster || undefined,
    thumbnail: thumbnail || undefined,
    year,
    rate: rate as string | number | undefined,
    imdb: rate as string | number | undefined,
    type,
    time: runtime as string | undefined,
    duration: runtime as string | undefined,
    quality: quality as string | undefined,
    description,
    trailer,
    slug,
    dubbingInfo,
    imdbID,
    // Stash the TMDB id for streaming embeds + later lookups
    ...((tmdbId !== undefined || typeof raw.tmdb_id === "number") && {
      tmdb_id: tmdbId ?? Number(raw.tmdb_id),
    }),
  };
}

function hashStrToNum(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) + 1;
}

/** Normalises whatever shape the API returned into an array of items. */
export function normalizeList<T = MediaListItem>(raw: unknown): T[] {
  let unwrapped: unknown;
  try {
    unwrapped = unwrapResponse(raw);
  } catch {
    return [];
  }

  if (!unwrapped) return [];
  if (Array.isArray(unwrapped)) {
    // filmrail items — map fields
    return unwrapped
      .filter((item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
      )
      .map((item) => mapFilmRailItem(item) as unknown as T);
  }
  if (typeof unwrapped !== "object") return [];

  const obj = unwrapped as Record<string, unknown>;
  for (const key of ["data", "list", "items", "results", "movies", "series"]) {
    if (Array.isArray(obj[key])) {
      return (obj[key] as Record<string, unknown>[])
        .filter((item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null
        )
        .map((item) => mapFilmRailItem(item) as unknown as T);
    }
  }
  return [];
}

/** Normalises the home endpoint response. */
export function normalizeHome(raw: unknown): HomeResult {
  let result: unknown;
  try {
    result = unwrapResponse(raw);
  } catch {
    return { slider: [] };
  }

  if (!result || typeof result !== "object") {
    return { slider: [] };
  }

  const obj = result as Record<string, unknown>;
  const home: HomeResult = {
    slider: [],
  };

  // Slider
  if (obj.slider && typeof obj.slider === "object") {
    const slider = obj.slider as Record<string, unknown>;
    const slides = Array.isArray(slider.slide) ? slider.slide : [];
    home.slider = slides
      .filter((s): s is Record<string, unknown> =>
        typeof s === "object" && s !== null
      )
      .map((s): HomeSlide => ({
        id: Number(s.id ?? s.action_id ?? 0),
        title: String(s.title ?? "بدون عنوان"),
        description: s.description ? String(s.description) : undefined,
        poster: s.image_link ? String(s.image_link) : undefined,
        trailer: s.trailer ? String(s.trailer) : undefined,
        type: s.action_type === "tvseries" ? "serie" : "movie",
        slug: s.slug ? String(s.slug) : undefined,
        actionType: s.action_type ? String(s.action_type) : undefined,
        actionBtnText: s.action_btn_text ? String(s.action_btn_text) : undefined,
        actionId: s.action_id ? Number(s.action_id) : undefined,
      }));
  }

  // Latest movies
  if (Array.isArray(obj.latest_movies)) {
    home.latestMovies = normalizeList<MediaListItem>(obj.latest_movies);
  }

  // Latest TV series
  if (Array.isArray(obj.latest_tvseries)) {
    home.latestSeries = normalizeList<MediaListItem>(
      obj.latest_tvseries
    ).map((m) => ({ ...m, type: "serie" as MediaType }));
  }

  // Featured (generic section)
  if (Array.isArray(obj.featured_videos)) {
    home.featuredMovies = normalizeList<MediaListItem>(obj.featured_videos);
  }

  // Popular stars
  if (Array.isArray(obj.popular_stars)) {
    home.popularStars = (obj.popular_stars as Record<string, unknown>[])
      .map((s) => ({
        id: Number(s.star_id ?? 0),
        name: String(s.star_name ?? ""),
        imageUrl: s.image_url ? String(s.image_url) : undefined,
      }))
      .filter((s) => s.name);
  }

  // All countries
  if (Array.isArray(obj.all_country)) {
    home.allCountries = (obj.all_country as Record<string, unknown>[])
      .map((c) => ({
        id: Number(c.country_id ?? 0),
        name: String(c.name ?? ""),
        imageUrl: c.image_url ? String(c.image_url) : undefined,
      }))
      .filter((c) => c.name);
  }

  // All genres (rich list, prefer this over the genres endpoint)
  if (Array.isArray(obj.all_genre)) {
    home.allGenres = (obj.all_genre as Record<string, unknown>[])
      .map((g): Genre => ({
        id: Number(g.genre_id ?? 0),
        name: String(g.name ?? ""),
        slug: g.slug ? String(g.slug) : undefined,
        image: g.image_url ? String(g.image_url) : undefined,
      }))
      .filter((g) => g.name);
  }

  // Featured TV channels (live)
  if (Array.isArray(obj.featured_tv_channel)) {
    home.featuredTvChannels = (obj.featured_tv_channel as Record<string, unknown>[])
      .map((c) => ({
        id: Number(c.live_tv_id ?? 0),
        name: String(c.tv_name ?? ""),
        streamUrl: c.stream_url ? String(c.stream_url) : undefined,
        streamLabel: c.stream_label ? String(c.stream_label) : undefined,
        isPaid: c.is_paid ? String(c.is_paid) : undefined,
      }))
      .filter((c) => c.name);
  }

  // Features genre + movie (per-genre selections)
  if (Array.isArray(obj.features_genre_and_movie)) {
    home.featuresGenreAndMovie = (
      obj.features_genre_and_movie as Record<string, unknown>[]
    )
      .map((g) => ({
        genreId: Number(g.genre_id ?? 0),
        name: String(g.name ?? ""),
        description: g.description ? String(g.description) : undefined,
        slug: g.slug ? String(g.slug) : undefined,
        videos: Array.isArray(g.videos)
          ? normalizeList<MediaListItem>(g.videos)
          : [],
      }))
      .filter((g) => g.name && g.videos && g.videos.length > 0);
  }

  return home;
}

/** Normalises genres list. filmrail uses {id, title, slug, image}. */
export function normalizeGenres(raw: unknown): Genre[] {
  let unwrapped: unknown;
  try {
    unwrapped = unwrapResponse(raw);
  } catch {
    return [];
  }

  const items = Array.isArray(unwrapped)
    ? unwrapped
    : Array.isArray((unwrapped as Record<string, unknown>)?.data)
      ? (unwrapped as Record<string, unknown>).data as unknown[]
      : [];

  return items
    .map((item): Genre | null => {
      if (typeof item !== "object" || item === null) return null;
      const obj = item as Record<string, unknown>;
      const id = Number(obj.id ?? obj.genre_id ?? obj.Id);
      const name = String(obj.name ?? obj.title ?? obj.genre_name ?? "");
      if (!Number.isFinite(id) || !name) return null;
      return {
        id,
        name,
        slug: obj.slug ? String(obj.slug) : undefined,
        image: obj.image ? String(obj.image) : undefined,
      };
    })
    .filter((g): g is Genre => g !== null);
}

/** Normalises the details endpoint response. */
export function normalizeDetails(raw: unknown): MediaDetails {
  let unwrapped: unknown;
  try {
    unwrapped = unwrapResponse(raw);
  } catch {
    return {};
  }
  if (Array.isArray(unwrapped)) {
    const first = unwrapped[0];
    if (first && typeof first === "object") {
      return mapDetails(first as Record<string, unknown>);
    }
    return {};
  }
  if (unwrapped && typeof unwrapped === "object") {
    return mapDetails(unwrapped as Record<string, unknown>);
  }
  return {};
}

/** Map a raw filmrail details object to internal MediaDetails. */
function mapDetails(obj: Record<string, unknown>): MediaDetails {
  const base = mapFilmRailItem(obj);

  // download_links → DownloadLink[]
  const downloadLinks: DownloadLink[] = Array.isArray(obj.download_links)
    ? (obj.download_links as Record<string, unknown>[]).map((dl): DownloadLink => ({
        id: dl.download_link_id ? Number(dl.download_link_id) : undefined,
        quality: dl.resolution ? String(dl.resolution) : undefined,
        resolution: dl.resolution ? String(dl.resolution) : undefined,
        size: dl.file_size ? String(dl.file_size) : undefined,
        url: dl.download_url ? String(dl.download_url) : undefined,
        label: dl.label ? String(dl.label) : undefined,
        lang: dl.label ? String(dl.label) : undefined,
      }))
    : [];

  // videos (for streaming)
  const videos: VideoFile[] = Array.isArray(obj.videos)
    ? (obj.videos as Record<string, unknown>[]).map((v): VideoFile => ({
        id: v.video_file_id ? Number(v.video_file_id) : 0,
        label: v.label ? String(v.label) : undefined,
        streamKey: v.stream_key ? String(v.stream_key) : undefined,
        fileType: v.file_type ? String(v.file_type) : undefined,
        fileUrl: v.file_url ? String(v.file_url) : undefined,
        subtitles: Array.isArray(v.subtitle) ? (v.subtitle as unknown[]) : [],
      }))
    : [];

  // genre → string[] + Genre[]
  const genreList: Genre[] = Array.isArray(obj.genre)
    ? (obj.genre as Record<string, unknown>[]).map((g): Genre => ({
        id: Number(g.genre_id ?? 0),
        name: String(g.name ?? ""),
        url: g.url ? String(g.url) : undefined,
      }))
    : [];
  const genres = genreList.map((g) => g.name).filter(Boolean);

  // country, director, writer, cast
  const countries = Array.isArray(obj.country)
    ? mapCast(obj.country as Record<string, unknown>[])
    : [];
  const directors = Array.isArray(obj.director)
    ? mapCast(obj.director as Record<string, unknown>[])
    : [];
  const writers = Array.isArray(obj.writer)
    ? mapCast(obj.writer as Record<string, unknown>[])
    : [];
  const cast = Array.isArray(obj.cast)
    ? mapCast(obj.cast as Record<string, unknown>[])
    : [];

  return {
    ...base,
    imdbRank: obj.imdb_rank ? String(obj.imdb_rank) : undefined,
    awards: obj.awards ? String(obj.awards) : undefined,
    dubbings: Array.isArray(obj.dubbings) ? obj.dubbings : [],
    userRating: obj.user_rating ? Number(obj.user_rating) : undefined,
    rating: obj.rating as string | number | undefined,
    totalRating: obj.total_rating as string | number | undefined,
    isPaid: obj.is_paid ? String(obj.is_paid) : undefined,
    enableSingleBuy: obj.enable_single_buy ? String(obj.enable_single_buy) : undefined,
    priceSingleBuy: obj.price_single_buy ? Number(obj.price_single_buy) : undefined,
    hasSingleBuy: obj.has_single_buy ? String(obj.has_single_buy) : undefined,
    enableDownload: obj.enable_download ? String(obj.enable_download) : undefined,
    downloadLinks,
    videos,
    genres,
    genreList,
    countries,
    directors,
    writers,
    cast,
    director: directors.map((d) => d.name).filter(Boolean).join("، "),
    actors: cast.map((c) => c.name),
    country: countries.map((c) => c.name).join("، "),
    releaseDate: obj.release ? String(obj.release) : undefined,
    totalSeasons: obj.total_seasons
      ? Number(obj.total_seasons)
      : obj.totalSeasons
        ? Number(obj.totalSeasons)
        : undefined,
    logoUrl: obj.logo_url ? String(obj.logo_url) : undefined,
    broadcastNetworkLogoUrl: obj.broadcast_network_logo_url
      ? String(obj.broadcast_network_logo_url)
      : undefined,
    adLink: obj.ad_link ? String(obj.ad_link) : undefined,
  };
}

function mapCast(items: Record<string, unknown>[]): CastMember[] {
  return items
    .map((c): CastMember => ({
      id: c.star_id ? Number(c.star_id) : undefined,
      name: String(c.name ?? ""),
      imageUrl: c.image_url ? String(c.image_url) : undefined,
      url: c.url ? String(c.url) : undefined,
    }))
    .filter((c) => c.name);
}

/** Normalises the download_links field directly (no longer needed as separate
 *  endpoint, but kept for compatibility). */
export function normalizeDownloads(raw: unknown): DownloadLink[] {
  let unwrapped: unknown;
  try {
    unwrapped = unwrapResponse(raw);
  } catch {
    return [];
  }
  if (!unwrapped) return [];
  if (Array.isArray(unwrapped)) {
    return (unwrapped as Record<string, unknown>[]).map((dl): DownloadLink => ({
      id: dl.download_link_id ? Number(dl.download_link_id) : undefined,
      quality: dl.resolution ? String(dl.resolution) : undefined,
      resolution: dl.resolution ? String(dl.resolution) : undefined,
      size: dl.file_size ? String(dl.file_size) : undefined,
      url: dl.download_url ? String(dl.download_url) : undefined,
      label: dl.label ? String(dl.label) : undefined,
    }));
  }
  if (unwrapped && typeof unwrapped === "object") {
    const obj = unwrapped as Record<string, unknown>;
    if (Array.isArray(obj.download_links)) {
      return normalizeDownloads(obj.download_links);
    }
  }
  return [];
}

/** Normalises the episodes endpoint response. */
export function normalizeEpisodes(raw: unknown): Episode[] {
  let unwrapped: unknown;
  try {
    unwrapped = unwrapResponse(raw);
  } catch {
    return [];
  }
  if (!unwrapped) return [];
  if (!Array.isArray(unwrapped)) return [];

  return (unwrapped as Record<string, unknown>[])
    .map((ep): Episode => {
      const imdbID = ep.imdb_id ?? ep.imdbID ?? ep.episode_id;
      return {
        id: imdbID ? hashStrToNum(String(imdbID)) : Number(ep.episode_id ?? 0),
        title: String(ep.title ?? ep.name ?? ""),
        episode: Number(ep.episode ?? ep.episode_number ?? 0),
        season: Number(ep.season ?? ep.season_number ?? 1),
        released: ep.released ? String(ep.released) : ep.air_date ? String(ep.air_date) : undefined,
        poster: ep.poster ? String(ep.poster) : ep.still_path ? String(ep.still_path) : undefined,
        imdbID: imdbID ? String(imdbID) : undefined,
        description: ep.overview ? String(ep.overview) : undefined,
      };
    })
    .filter((ep) => ep.title && ep.episode > 0);
}
