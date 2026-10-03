/**
 * Client-side TMDB API utilities.
 *
 * All functions in this file run in the browser and call TMDB directly
 * (no server-side proxy needed). This makes the app fully static-export
 * compatible — no /api routes required.
 *
 * API key + read token are public (NEXT_PUBLIC_*) — TMDB is free with
 * reasonable rate limits, so this is acceptable for a personal project.
 */

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
const TMDB_API_READ_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_READ_TOKEN || "";
const TMDB_LANG = process.env.NEXT_PUBLIC_TMDB_LANG || "en-US";

/** Whether TMDB is configured. */
export function isTmdbConfigured(): boolean {
  return !!(TMDB_API_KEY || TMDB_API_READ_TOKEN);
}

/** Build a TMDB image URL. */
export function tmdbImageUrl(
  path?: string,
  size:
    | "w92"
    | "w154"
    | "w185"
    | "w342"
    | "w500"
    | "w780"
    | "original" = "w500"
): string | undefined {
  if (!path) return undefined;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export interface TmdbMovie {
  id: number;
  title: string;
  original_title?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  imdb_id?: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  credits?: {
    cast?: TmdbCast[];
    crew?: TmdbCrew[];
  };
  videos?: { results?: TmdbVideo[] };
  images?: { backdrops?: TmdbImage[]; posters?: TmdbImage[] };
  media_type?: string;
}

export interface TmdbTv {
  id: number;
  name: string;
  original_name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: TmdbSeason[];
  genres?: { id: number; name: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  credits?: {
    cast?: TmdbCast[];
    crew?: TmdbCrew[];
  };
  videos?: { results?: TmdbVideo[] };
  images?: { backdrops?: TmdbImage[]; posters?: TmdbImage[] };
  external_ids?: { imdb_id?: string };
}

export interface TmdbCast {
  id: number;
  name: string;
  character?: string;
  profile_path?: string;
  order?: number;
}

export interface TmdbCrew {
  id: number;
  name: string;
  job?: string;
  department?: string;
  profile_path?: string;
}

export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
}

export interface TmdbImage {
  file_path: string;
  width?: number;
  height?: number;
  iso_639_1?: string;
}

export interface TmdbSeason {
  id: number;
  season_number: number;
  episode_count: number;
  name: string;
  overview?: string;
  air_date?: string;
  poster_path?: string;
}

export interface TmdbEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview?: string;
  air_date?: string;
  still_path?: string;
  runtime?: number;
  vote_average?: number;
}

export interface TmdbPerson {
  id: number;
  name: string;
  biography?: string;
  birthday?: string;
  deathday?: string;
  place_of_birth?: string;
  profile_path?: string;
  known_for_department?: string;
}

export interface TmdbPersonMovieCredit {
  id: number;
  title: string;
  original_title?: string;
  character?: string;
  poster_path?: string;
  release_date?: string;
  vote_average?: number;
  genre_ids?: number[];
}

export interface TmdbPersonTvCredit {
  id: number;
  name: string;
  original_name?: string;
  character?: string;
  poster_path?: string;
  first_air_date?: string;
  vote_average?: number;
  episode_count?: number;
}

/** In-memory cache (per session). Reduces duplicate calls. */
interface CacheEntry {
  data: unknown;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry>();

function getCacheTtlMs(endpoint: string): number {
  if (endpoint.includes("/trending/")) return 1000 * 60 * 30; // 30 min
  if (endpoint.includes("/popular")) return 1000 * 60 * 30; // 30 min
  if (endpoint.includes("/person/")) return 1000 * 60 * 60; // 1h
  if (endpoint.includes("/movie/") || endpoint.includes("/tv/")) return 1000 * 60 * 60; // 1h for details
  if (endpoint.includes("/genre")) return 1000 * 60 * 60 * 24; // 24h
  if (endpoint.includes("/search/")) return 1000 * 60 * 10; // 10 min
  return 1000 * 60 * 30; // 30 min default
}

/** Internal fetcher with cache + bearer token. */
async function fetchTmdb<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  if (!isTmdbConfigured()) return null;

  // Build cache key
  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const cacheKey = `${path}|${sortedParams}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data as T;
  }

  // Build URL
  const url = new URL(`${TMDB_BASE}${path}`);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (TMDB_API_READ_TOKEN) {
    headers["Authorization"] = `Bearer ${TMDB_API_READ_TOKEN}`;
  } else {
    url.searchParams.set("api_key", TMDB_API_KEY);
  }
  url.searchParams.set("language", TMDB_LANG);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  try {
    const res = await fetch(url.toString(), { headers });
    if (!res.ok) return null;
    const data = (await res.json()) as T;

    // Cache
    cache.set(cacheKey, {
      data,
      expiresAt: Date.now() + getCacheTtlMs(path),
    });
    // Cap cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }
    return data;
  } catch {
    return null;
  }
}

// ─────────── Trending ───────────

export async function fetchTmdbTrendingMovies(): Promise<TmdbMovie[]> {
  const data = await fetchTmdb<{ results?: TmdbMovie[] }>("/trending/movie/week");
  return data?.results || [];
}

export async function fetchTmdbTrendingSeries(): Promise<TmdbTv[]> {
  const data = await fetchTmdb<{ results?: TmdbTv[] }>("/trending/tv/week");
  return data?.results || [];
}

// ─────────── Popular / Top ───────────

export async function fetchTmdbPopularMovies(page = 1): Promise<TmdbMovie[]> {
  const data = await fetchTmdb<{ results?: TmdbMovie[] }>("/movie/popular", {
    page: String(page),
  });
  return data?.results || [];
}

export async function fetchTmdbPopularSeries(page = 1): Promise<TmdbTv[]> {
  const data = await fetchTmdb<{ results?: TmdbTv[] }>("/tv/popular", {
    page: String(page),
  });
  return data?.results || [];
}

export async function fetchTmdbTopMovies(page = 1): Promise<TmdbMovie[]> {
  const data = await fetchTmdb<{ results?: TmdbMovie[] }>("/movie/top_rated", {
    page: String(page),
  });
  return data?.results || [];
}

export async function fetchTmdbTopSeries(page = 1): Promise<TmdbTv[]> {
  const data = await fetchTmdb<{ results?: TmdbTv[] }>("/tv/top_rated", {
    page: String(page),
  });
  return data?.results || [];
}

// ─────────── Genres ───────────

export async function fetchTmdbGenres(): Promise<
  { id: number; name: string }[]
> {
  const [movie, tv] = await Promise.all([
    fetchTmdb<{ genres?: { id: number; name: string }[] }>("/genre/movie/list"),
    fetchTmdb<{ genres?: { id: number; name: string }[] }>("/genre/tv/list"),
  ]);
  const merged = new Map<number, { id: number; name: string }>();
  for (const g of movie?.genres || []) merged.set(g.id, g);
  for (const g of tv?.genres || []) merged.set(g.id, g);
  return Array.from(merged.values());
}

// ─────────── Discover by genre ───────────

export async function fetchTmdbMoviesByGenre(
  genreId: number,
  page = 1
): Promise<TmdbMovie[]> {
  const data = await fetchTmdb<{ results?: TmdbMovie[] }>("/discover/movie", {
    with_genres: String(genreId),
    page: String(page),
    sort_by: "popularity.desc",
  });
  return data?.results || [];
}

export async function fetchTmdbSeriesByGenre(
  genreId: number,
  page = 1
): Promise<TmdbTv[]> {
  const data = await fetchTmdb<{ results?: TmdbTv[] }>("/discover/tv", {
    with_genres: String(genreId),
    page: String(page),
    sort_by: "popularity.desc",
  });
  return data?.results || [];
}

// ─────────── Search ───────────

export async function searchTmdb(query: string): Promise<TmdbMovie[]> {
  if (!query.trim()) return [];
  const data = await fetchTmdb<{ results?: TmdbMovie[] }>("/search/multi", {
    query,
  });
  return (data?.results || []).filter(
    (r) => r && (r as { media_type?: string }).media_type !== "person"
  );
}

// ─────────── Details ───────────

export async function fetchTmdbMovieDetails(
  id: number
): Promise<TmdbMovie | null> {
  return fetchTmdb<TmdbMovie>(`/movie/${id}`, {
    append_to_response: "credits,videos,images,external_ids",
    include_image_language: "en,null",
  });
}

export async function fetchTmdbTvDetails(
  id: number
): Promise<TmdbTv | null> {
  return fetchTmdb<TmdbTv>(`/tv/${id}`, {
    append_to_response: "credits,videos,images,external_ids",
    include_image_language: "en,null",
  });
}

// ─────────── Seasons ───────────

export async function fetchTmdbSeason(
  tvId: number,
  seasonNumber: number
): Promise<{
  id: number;
  name: string;
  overview?: string;
  episodes?: TmdbEpisode[];
} | null> {
  return fetchTmdb(`/tv/${tvId}/season/${seasonNumber}`);
}

// ─────────── Find by imdbID ───────────

export async function findTmdbByImdb(
  imdbID: string
): Promise<TmdbMovie | null> {
  const data = await fetchTmdb<{ movie_results?: TmdbMovie[] }>(
    `/find/${imdbID}`,
    { external_source: "imdb_id" }
  );
  return data?.movie_results?.[0] || null;
}

export async function findTmdbTvByImdb(
  imdbID: string
): Promise<TmdbTv | null> {
  const data = await fetchTmdb<{ tv_results?: TmdbTv[] }>(
    `/find/${imdbID}`,
    { external_source: "imdb_id" }
  );
  return data?.tv_results?.[0] || null;
}

// ─────────── Person endpoints ───────────

export async function searchTmdbPerson(name: string): Promise<TmdbPerson[]> {
  if (!name.trim()) return [];
  const data = await fetchTmdb<{ results?: TmdbPerson[] }>("/search/person", {
    query: name,
  });
  return data?.results || [];
}

export async function fetchTmdbPerson(
  id: number
): Promise<TmdbPerson | null> {
  return fetchTmdb<TmdbPerson>(`/person/${id}`);
}

export async function fetchTmdbPersonMovieCredits(
  personId: number
): Promise<TmdbPersonMovieCredit[]> {
  const data = await fetchTmdb<{
    cast?: TmdbPersonMovieCredit[];
  }>(`/person/${personId}/movie_credits`);
  return data?.cast || [];
}

export async function fetchTmdbPersonTvCredits(
  personId: number
): Promise<TmdbPersonTvCredit[]> {
  const data = await fetchTmdb<{
    cast?: TmdbPersonTvCredit[];
  }>(`/person/${personId}/tv_credits`);
  return data?.cast || [];
}

export async function fetchTmdbPopularPeople(
  page = 1
): Promise<TmdbPerson[]> {
  const data = await fetchTmdb<{ results?: TmdbPerson[] }>(
    "/person/popular",
    { page: String(page) }
  );
  return data?.results || [];
}

// ─────────── Converters (TMDB → filmrail-compatible shape) ───────────

/** Convert TMDB movie to filmrail-compatible item shape. */
export function tmdbMovieToFilmRail(movie: TmdbMovie): Record<string, unknown> {
  return {
    videos_id: `tmdb_${movie.id}`,
    tmdb_id: movie.id,
    title: movie.title || movie.original_title || "",
    secondary_title:
      movie.original_title !== movie.title ? movie.original_title : "",
    description: movie.overview || "",
    slug: "",
    trailer: "",
    imdb_rating: movie.vote_average ? String(movie.vote_average) : "",
    release: movie.release_date
      ? String(movie.release_date).slice(0, 4)
      : "",
    is_paid: "0",
    is_tvseries: "0",
    runtime: movie.runtime ? `${movie.runtime} min` : "",
    video_quality: "HD",
    video_descadd: "",
    thumbnail_url: tmdbImageUrl(movie.backdrop_path, "w500") || "",
    poster_url: tmdbImageUrl(movie.poster_path, "w500") || "",
    logo_url: "",
    ad_link: "",
  };
}

/** Convert TMDB TV to filmrail-compatible item shape. */
export function tmdbTvToFilmRail(tv: TmdbTv): Record<string, unknown> {
  return {
    videos_id: `tmdb_${tv.id}`,
    tmdb_id: tv.id,
    title: tv.name || tv.original_name || "",
    secondary_title:
      tv.original_name !== tv.name ? tv.original_name : "",
    description: tv.overview || "",
    slug: "",
    trailer: "",
    imdb_rating: tv.vote_average ? String(tv.vote_average) : "",
    release: tv.first_air_date
      ? String(tv.first_air_date).slice(0, 4)
      : "",
    is_paid: "0",
    is_tvseries: "1",
    runtime: "",
    video_quality: "HD",
    video_descadd: "",
    thumbnail_url: tmdbImageUrl(tv.backdrop_path, "w500") || "",
    poster_url: tmdbImageUrl(tv.poster_path, "w500") || "",
    logo_url: "",
    ad_link: "",
  };
}

/**
 * Build a complete home response from TMDB data (client-side).
 * Returns a structure shaped like the filmrail `home` endpoint so
 * our existing normalizers work seamlessly.
 */
export async function fetchTmdbHome(): Promise<{
  status: 200;
  ok: true;
  result: {
    slider: { slider_type: string; slide: unknown[] };
    latest_movies: unknown[];
    latest_tvseries: unknown[];
    featured_videos: unknown[];
    features_genre_and_movie: unknown[];
    all_genre: unknown[];
    all_country: unknown[];
    popular_stars: unknown[];
    featured_tv_channel: unknown[];
  };
} | null> {
  const [
    trendingMovies,
    trendingSeries,
    popularMovies,
    popularSeries,
    genres,
    popularPeople,
  ] = await Promise.all([
    fetchTmdbTrendingMovies(),
    fetchTmdbTrendingSeries(),
    fetchTmdbPopularMovies(),
    fetchTmdbPopularSeries(),
    fetchTmdbGenres(),
    fetchTmdbPopularPeople(),
  ]);

  // Slider: top 6 trending movies with backdrops
  const sliderSlides = trendingMovies.slice(0, 6).map((m) => ({
    id: String(m.id),
    title: m.title || m.original_title || "",
    description: m.overview || "",
    image_link:
      tmdbImageUrl(m.backdrop_path || m.poster_path, "original") || "",
    slug: "",
    trailer: "",
    action_type: "movie",
    action_btn_text: "تماشا",
    action_id: String(m.id),
    action_url: "",
  }));

  // Latest movies: trending + popular (deduped)
  const allMovies = [...trendingMovies, ...popularMovies];
  const seenIds = new Set<number>();
  const latestMovies = allMovies
    .filter((m) => {
      if (seenIds.has(m.id)) return false;
      seenIds.add(m.id);
      return !!m.poster_path;
    })
    .slice(0, 20)
    .map(tmdbMovieToFilmRail);

  // Latest series
  const allSeries = [...trendingSeries, ...popularSeries];
  const seenTvIds = new Set<number>();
  const latestSeries = allSeries
    .filter((s) => {
      if (seenTvIds.has(s.id)) return false;
      seenTvIds.add(s.id);
      return !!s.poster_path;
    })
    .slice(0, 20)
    .map(tmdbTvToFilmRail);

  const featuredVideos = popularMovies.slice(0, 10).map(tmdbMovieToFilmRail);

  const allGenre = genres.map((g) => ({
    genre_id: String(g.id),
    name: g.name,
    description: "",
    slug: String(g.id),
    url: "",
    image_url: "",
  }));

  const popularStars = popularPeople.slice(0, 24).map((p) => ({
    star_id: String(p.id),
    star_name: p.name,
    image_url: p.profile_path
      ? `https://image.tmdb.org/t/p/w300${p.profile_path}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          p.name
        )}&size=256&background=random&bold=true`,
  }));

  return {
    status: 200,
    ok: true,
    result: {
      slider: {
        slider_type: "movie",
        slide: sliderSlides,
      },
      latest_movies: latestMovies,
      latest_tvseries: latestSeries,
      featured_videos: featuredVideos,
      features_genre_and_movie: [],
      all_genre: allGenre,
      all_country: [],
      popular_stars: popularStars,
      featured_tv_channel: [],
    },
  };
}

/** Convert TMDB movie details to filmrail-compatible details shape. */
export async function fetchTmdbMovieDetailsAsFilmRail(
  tmdbId: number
): Promise<Record<string, unknown> | null> {
  const movie = await fetchTmdbMovieDetails(tmdbId);
  if (!movie) return null;

  return {
    videos_id: `tmdb_${movie.id}`,
    tmdb_id: movie.id,
    imdb_id: movie.imdb_id || "",
    title: movie.title || "",
    secondary_title:
      movie.original_title !== movie.title ? movie.original_title : "",
    description: movie.overview || "",
    slug: "",
    trailer:
      movie.videos?.results?.find(
        (v) => v.site === "YouTube" && v.type === "Trailer"
      )?.key
        ? `https://www.youtube.com/watch?v=${
            movie.videos?.results?.find(
              (v) => v.site === "YouTube" && v.type === "Trailer"
            )?.key
          }`
        : "",
    release: movie.release_date || "",
    runtime: movie.runtime ? `${movie.runtime} min` : "",
    video_quality: "HD",
    imdb_rating: movie.vote_average ? String(movie.vote_average) : "",
    imdb_rank: "",
    awards: "",
    dubbings: [],
    video_descadd: "",
    user_rating: 0,
    rating: "0",
    total_rating: "0",
    is_tvseries: "0",
    is_paid: "0",
    enable_single_buy: "0",
    price_single_buy: 0,
    has_single_buy: "0",
    enable_download: "0",
    download_links: [],
    thumbnail_url: tmdbImageUrl(movie.backdrop_path, "w500") || "",
    poster_url: tmdbImageUrl(movie.poster_path, "w500") || "",
    logo_url: "",
    broadcast_network_logo_url: "",
    ad_link: "",
    videos: [],
    genre: (movie.genres || []).map((g) => ({
      genre_id: String(g.id),
      name: g.name,
      url: "",
    })),
    country: (movie.production_countries || []).map((c, i) => ({
      country_id: String(i + 1),
      name: c.name,
      url: "",
    })),
    director: (movie.credits?.crew || [])
      .filter((c) => c.job === "Director")
      .map((c, i) => ({
        star_id: String(c.id || i + 1),
        name: c.name,
        url: "",
        image_url: c.profile_path
          ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
          : "",
      })),
    writer: [],
    cast: (movie.credits?.cast || [])
      .slice(0, 12)
      .map((c) => ({
        star_id: String(c.id),
        name: c.name,
        url: "",
        image_url: c.profile_path
          ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
          : "",
        character: c.character || "",
      })),
    tmdb_backdrops: (movie.images?.backdrops || [])
      .slice(0, 6)
      .map((img) => `https://image.tmdb.org/t/p/w780${img.file_path}`),
  };
}

/** Convert TMDB TV details to filmrail-compatible details shape. */
export async function fetchTmdbTvDetailsAsFilmRail(
  tmdbId: number
): Promise<Record<string, unknown> | null> {
  const tv = await fetchTmdbTvDetails(tmdbId);
  if (!tv) return null;

  return {
    videos_id: `tmdb_${tv.id}`,
    tmdb_id: tv.id,
    imdb_id: tv.external_ids?.imdb_id || "",
    title: tv.name || "",
    secondary_title:
      tv.original_name !== tv.name ? tv.original_name : "",
    description: tv.overview || "",
    slug: "",
    trailer:
      tv.videos?.results?.find(
        (v) => v.site === "YouTube" && v.type === "Trailer"
      )?.key
        ? `https://www.youtube.com/watch?v=${
            tv.videos?.results?.find(
              (v) => v.site === "YouTube" && v.type === "Trailer"
            )?.key
          }`
        : "",
    release: tv.first_air_date || "",
    runtime: "",
    video_quality: "HD",
    imdb_rating: tv.vote_average ? String(tv.vote_average) : "",
    imdb_rank: "",
    awards: "",
    dubbings: [],
    video_descadd: "",
    user_rating: 0,
    rating: "0",
    total_rating: "0",
    is_tvseries: "1",
    is_paid: "0",
    enable_single_buy: "0",
    price_single_buy: 0,
    has_single_buy: "0",
    enable_download: "0",
    download_links: [],
    thumbnail_url: tmdbImageUrl(tv.backdrop_path, "w500") || "",
    poster_url: tmdbImageUrl(tv.poster_path, "w500") || "",
    logo_url: "",
    broadcast_network_logo_url: "",
    ad_link: "",
    videos: [],
    genre: (tv.genres || []).map((g) => ({
      genre_id: String(g.id),
      name: g.name,
      url: "",
    })),
    country: (tv.production_countries || []).map((c, i) => ({
      country_id: String(i + 1),
      name: c.name,
      url: "",
    })),
    director: [],
    writer: [],
    cast: (tv.credits?.cast || [])
      .slice(0, 12)
      .map((c) => ({
        star_id: String(c.id),
        name: c.name,
        url: "",
        image_url: c.profile_path
          ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
          : "",
        character: c.character || "",
      })),
    total_seasons: tv.number_of_seasons || 1,
    seasons: (tv.seasons || []).map((s) => ({
      season_number: s.season_number,
      episode_count: s.episode_count,
      name: s.name,
      air_date: s.air_date,
      poster_path: s.poster_path
        ? `https://image.tmdb.org/t/p/w300${s.poster_path}`
        : "",
    })),
    tmdb_backdrops: (tv.images?.backdrops || [])
      .slice(0, 6)
      .map((img) => `https://image.tmdb.org/t/p/w780${img.file_path}`),
  };
}

/** Get TMDB season episodes in filmrail-compatible shape. */
export async function fetchTmdbSeasonEpisodesAsFilmRail(
  tvId: number,
  seasonNumber: number
): Promise<{ status: 200; ok: true; result: unknown[] } | null> {
  const season = await fetchTmdbSeason(tvId, seasonNumber);
  if (!season) return null;

  return {
    status: 200,
    ok: true,
    result: (season.episodes || []).map((ep) => ({
      episode_id: `tmdb_ep_${ep.id}`,
      title: ep.name || `قسمت ${ep.episode_number}`,
      season: ep.season_number,
      episode: ep.episode_number,
      released: ep.air_date || "",
      poster: ep.still_path
        ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
        : "",
      tmdb_id: ep.id,
      description: ep.overview || "",
    })),
  };
}

/** Get person full filmography in filmrail-compatible shape. */
export async function fetchTmdbPersonFilmographyAsFilmRail(
  personId: number
): Promise<{
  star_id: string;
  star_name: string;
  image_url: string;
  bio?: string;
  birth_year?: number;
  nationality?: string;
  films: unknown[];
} | null> {
  const [person, movieCredits, tvCredits] = await Promise.all([
    fetchTmdbPerson(personId),
    fetchTmdbPersonMovieCredits(personId),
    fetchTmdbPersonTvCredits(personId),
  ]);
  if (!person) return null;

  const movies = movieCredits.map((m) => ({
    videos_id: `tmdb_${m.id}`,
    tmdb_id: m.id,
    title: m.title || "",
    secondary_title: "",
    description: "",
    imdb_rating: m.vote_average ? String(m.vote_average) : "",
    release: m.release_date ? String(m.release_date).slice(0, 4) : "",
    is_paid: "0",
    is_tvseries: "0",
    runtime: "",
    video_quality: "HD",
    video_descadd: "",
    thumbnail_url: "",
    poster_url: m.poster_path
      ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
      : "",
    logo_url: "",
    ad_link: "",
    character: m.character || "",
  }));

  const series = tvCredits.map((s) => ({
    videos_id: `tmdb_${s.id}`,
    tmdb_id: s.id,
    title: s.name || "",
    secondary_title: "",
    description: "",
    imdb_rating: s.vote_average ? String(s.vote_average) : "",
    release: s.first_air_date ? String(s.first_air_date).slice(0, 4) : "",
    is_paid: "0",
    is_tvseries: "1",
    runtime: "",
    video_quality: "HD",
    video_descadd: "",
    thumbnail_url: "",
    poster_url: s.poster_path
      ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
      : "",
    logo_url: "",
    ad_link: "",
    character: s.character || "",
  }));

  // Sort by release year (desc) and combine
  const all = [...movies, ...series].sort((a, b) =>
    String(b.release).localeCompare(String(a.release))
  );

  // Parse birth_year from YYYY-MM-DD
  const birthYear = person.birthday
    ? Number(person.birthday.slice(0, 4))
    : undefined;

  return {
    star_id: String(person.id),
    star_name: person.name,
    image_url: person.profile_path
      ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          person.name
        )}&size=256&background=random&bold=true`,
    bio: person.biography || undefined,
    birth_year: birthYear,
    nationality: person.place_of_birth || undefined,
    films: all,
  };
}
