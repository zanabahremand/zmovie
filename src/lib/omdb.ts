/**
 * OMDb API — free public fallback for when MajidAPI is unavailable.
 *
 * API: http://www.omdbapi.com/
 * Sample public key "thewdb" works for free (limited) usage.
 * Returns movies + series with poster URLs from m.media-amazon.com
 * (which is accessible from Iran).
 *
 * Response shapes:
 *   - Search: { Search: [...], totalResults: "..." }
 *   - Single: { Title, Year, imdbID, Type, Poster, ... }
 *   - Episodes: { Title, Season, totalSeasons, Episodes: [...] }
 */

const OMDB_BASE = "http://www.omdbapi.com";
const OMDB_API_KEY = process.env.OMDB_API_KEY || "thewdb"; // free sample key

export interface OmdbItem {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string; // "movie" | "series" | "episode"
  Poster: string;
}

export interface OmdbEpisode {
  Title: string;
  Released: string;
  Episode: string;
  Season: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OmdbDetails extends OmdbItem {
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  imdbRating?: string;
  imdbVotes?: string;
  Metascore?: string;
  Production?: string;
  BoxOffice?: string;
  totalSeasons?: string;
}

/** Internal fetcher. */
async function fetchOmdb<T>(params: Record<string, string>): Promise<T> {
  const url = new URL(OMDB_BASE);
  url.searchParams.set("apikey", OMDB_API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`OMDb failed (${res.status})`);
  }
  return (await res.json()) as T;
}

/** Search terms for popular movies + series — gives a varied home feed. */
const MOVIE_SEARCHES = [
  "Batman", "Avengers", "Star Wars", "Spider-Man", "Matrix",
  "Lord of the Rings", "Harry Potter", "John Wick", "Fast and Furious",
  "Jurassic", "Mission Impossible", "Dune", "Avatar", "Inception",
  "Interstellar", "Dark Knight", "Iron Man", "Thor", "Captain America",
  "Hulk", "Deadpool", "X-Men", "Wolverine", "Transformers",
  "Pirates of the Caribbean", "Hunger Games", "Twilight", "Divergent",
  "Jumanji", "Tarzan", "King Kong", "Godzilla",
];

const SERIES_SEARCHES = [
  "Walking Dead", "Breaking Bad", "Game of Thrones", "Stranger Things",
  "Crown", "Better Call Saul", "Westworld", "Money Heist",
  "Dark", "Black Mirror", "Vikings", "Peaky Blinders", "Sopranos",
  "Wire", "Friends", "Office", "Lost", "Sherlock",
  "House of Cards", "Narcos", "Witcher", "Mandalorian",
  "Lost in Space", "Foundation", "Wheel of Time", "Rings of Power",
];

/** Get a curated "popular" set — OMDb doesn't have a "popular" endpoint, so
 *  we hit a bunch of popular search terms and combine. */
export async function fetchOmdbHome(): Promise<{
  slider: Array<{ id: number; title: string; poster: string; year: string; description?: string; imdbID: string }>;
  latestMovies: OmdbItem[];
  latestSeries: OmdbItem[];
}> {
  const moviesMap = new Map<string, OmdbItem>();
  const seriesMap = new Map<string, OmdbItem>();

  // Fetch movies in parallel (chunks of 8 to avoid hammering)
  const chunk = <T,>(arr: T[], size: number): T[][] =>
    arr.reduce((acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), [] as T[][]);

  for (const batch of chunk(MOVIE_SEARCHES, 6)) {
    const results = await Promise.allSettled(
      batch.map((s) => fetchOmdb<{ Search?: OmdbItem[] }>({ s, type: "movie" }))
    );
    for (const r of results) {
      if (r.status === "fulfilled" && r.value.Search) {
        for (const m of r.value.Search) {
          if (m.Poster && m.Poster !== "N/A" && !moviesMap.has(m.imdbID)) {
            moviesMap.set(m.imdbID, m);
          }
        }
      }
    }
  }

  for (const batch of chunk(SERIES_SEARCHES, 6)) {
    const results = await Promise.allSettled(
      batch.map((s) => fetchOmdb<{ Search?: OmdbItem[] }>({ s, type: "series" }))
    );
    for (const r of results) {
      if (r.status === "fulfilled" && r.value.Search) {
        for (const s of r.value.Search) {
          if (s.Poster && s.Poster !== "N/A" && !seriesMap.has(s.imdbID)) {
            seriesMap.set(s.imdbID, s);
          }
        }
      }
    }
  }

  const movies = Array.from(moviesMap.values());
  const series = Array.from(seriesMap.values());

  // Slider: pick 6 best movies with full details (for description)
  const sliderCandidates = movies.slice(0, 8);
  const slider = [];
  for (const m of sliderCandidates.slice(0, 6)) {
    try {
      const det = await fetchOmdb<OmdbDetails>({ i: m.imdbID, plot: "short" });
      slider.push({
        id: hashStrToNum(m.imdbID),
        title: m.Title,
        poster: m.Poster,
        year: m.Year,
        description: det.Plot,
        imdbID: m.imdbID,
      });
    } catch {
      slider.push({
        id: hashStrToNum(m.imdbID),
        title: m.Title,
        poster: m.Poster,
        year: m.Year,
        imdbID: m.imdbID,
      });
    }
  }

  return {
    slider,
    latestMovies: movies,
    latestSeries: series,
  };
}

/** Search movies+series by name. */
export async function searchOmdb(query: string): Promise<OmdbItem[]> {
  if (!query.trim()) return [];
  // Search both movies and series in parallel
  const [mRes, sRes] = await Promise.allSettled([
    fetchOmdb<{ Search?: OmdbItem[] }>({ s: query, type: "movie" }),
    fetchOmdb<{ Search?: OmdbItem[] }>({ s: query, type: "series" }),
  ]);
  const items: OmdbItem[] = [];
  if (mRes.status === "fulfilled" && mRes.value.Search) items.push(...mRes.value.Search);
  if (sRes.status === "fulfilled" && sRes.value.Search) items.push(...sRes.value.Search);

  // Deduplicate by imdbID, filter out N/A posters
  const seen = new Set<string>();
  return items.filter((m) => {
    if (seen.has(m.imdbID)) return false;
    seen.add(m.imdbID);
    return m.Poster && m.Poster !== "N/A";
  });
}

/** Get full details by imdbID. */
export async function fetchOmdbDetails(
  imdbID: string
): Promise<OmdbDetails | null> {
  try {
    return await fetchOmdb<OmdbDetails>({ i: imdbID, plot: "full" });
  } catch {
    return null;
  }
}

/** Fetch episodes for a season of a series. */
export async function fetchOmdbEpisodes(
  imdbID: string,
  season: number
): Promise<OmdbEpisode[]> {
  try {
    const data = await fetchOmdb<{ Episodes?: OmdbEpisode[] }>({
      i: imdbID,
      Season: String(season),
    });
    return data.Episodes || [];
  } catch {
    return [];
  }
}

function hashStrToNum(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) + 1; // avoid 0 (which would conflict with falsy checks)
}
