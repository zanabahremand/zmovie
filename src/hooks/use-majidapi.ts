"use client";

import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useZmovieStore } from "@/lib/store";
import {
  type MediaListItem,
  type MediaDetails,
  type Genre,
  type HomeResult,
  type Episode,
  normalizeList,
  normalizeHome,
  normalizeGenres,
  normalizeDetails,
  normalizeEpisodes,
} from "@/lib/majidapi";
import {
  fetchTmdbHome,
  fetchTmdbGenres,
  fetchTmdbMoviesByGenre,
  fetchTmdbSeriesByGenre,
  fetchTmdbMovieDetailsAsFilmRail,
  fetchTmdbTvDetailsAsFilmRail,
  fetchTmdbSeasonEpisodesAsFilmRail,
  fetchTmdbPersonFilmographyAsFilmRail,
  fetchTmdbPopularPeople,
  fetchTmdbTrendingMovies,
  fetchTmdbTrendingSeries,
  searchTmdb,
  tmdbMovieToFilmRail,
  tmdbTvToFilmRail,
  isTmdbConfigured,
} from "@/lib/tmdb-client";

// ─────────── Home (slider + sections) ───────────
export function useHome() {
  return useQuery<HomeResult>({
    queryKey: ["home"],
    queryFn: async () => {
      const data = await fetchTmdbHome();
      if (!data) {
        return { slider: [] } as HomeResult;
      }
      return normalizeHome(data);
    },
    staleTime: 1000 * 60 * 30, // 30 min
    retry: 1,
  });
}

// ─────────── Genres ───────────
export function useGenres() {
  return useQuery<Genre[]>({
    queryKey: ["genres"],
    queryFn: async () => {
      const genres = await fetchTmdbGenres();
      return genres.map((g) => ({
        id: g.id,
        name: g.name,
        slug: String(g.id),
        image: undefined,
      }));
    },
    staleTime: 1000 * 60 * 60, // 1h
    retry: 1,
  });
}

// ─────────── Movies (paginated) ───────────
export function useMovies() {
  return useInfiniteQuery<MediaListItem[]>({
    queryKey: ["movies"],
    queryFn: async ({ pageParam }) => {
      // Use trending for page 1, popular for next pages
      const page = pageParam as number;
      let movies;
      if (page === 1) {
        const home = await fetchTmdbHome();
        movies = (home?.result?.latest_movies as Record<string, unknown>[]) || [];
      } else {
        // For pagination beyond page 1, fetch from popular
        const home = await fetchTmdbHome();
        const all = (home?.result?.latest_movies as Record<string, unknown>[]) || [];
        const start = (page - 1) * 12;
        movies = all.slice(start, start + 12);
      }
      return normalizeList<MediaListItem>({ status: 200, ok: true, result: movies });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 12) return undefined;
      return allPages.length + 1;
    },
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}

// ─────────── Series (paginated) ───────────
export function useSeries() {
  return useInfiniteQuery<MediaListItem[]>({
    queryKey: ["series"],
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      const home = await fetchTmdbHome();
      const all = (home?.result?.latest_tvseries as Record<string, unknown>[]) || [];
      const start = (page - 1) * 12;
      const items = all.slice(start, start + 12);
      return normalizeList<MediaListItem>({ status: 200, ok: true, result: items });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 12) return undefined;
      return allPages.length + 1;
    },
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}

// ─────────── Genre list (paginated) ───────────
export function useByGenre(genreId?: number | null) {
  return useInfiniteQuery<MediaListItem[]>({
    queryKey: ["genre", genreId],
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      const [movies, series] = await Promise.all([
        fetchTmdbMoviesByGenre(genreId as number, page),
        fetchTmdbSeriesByGenre(genreId as number, page),
      ]);
      const items = [
        ...movies.map(tmdbMovieToFilmRail),
        ...series.map(tmdbTvToFilmRail),
      ];
      return normalizeList<MediaListItem>({ status: 200, ok: true, result: items });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 12) return undefined;
      return allPages.length + 1;
    },
    enabled: !!genreId,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}

// ─────────── Search ───────────
export function useSearch(query: string) {
  return useQuery<MediaListItem[]>({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const results = await searchTmdb(query);
      const items = results.map(tmdbMovieToFilmRail);
      return normalizeList<MediaListItem>({ status: 200, ok: true, result: items });
    },
    enabled: query.trim().length > 1,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

// ─────────── Details (with embedded download_links + videos) ───────────
export function useDetails(
  id?: number | null,
  type?: "movie" | "serie" | null,
  tmdbId?: number | null
) {
  return useQuery<MediaDetails>({
    queryKey: ["details", id, type, tmdbId],
    queryFn: async () => {
      // If we have a tmdbId, fetch from TMDB directly
      if (tmdbId) {
        const data =
          type === "serie"
            ? await fetchTmdbTvDetailsAsFilmRail(tmdbId)
            : await fetchTmdbMovieDetailsAsFilmRail(tmdbId);
        if (data) {
          return normalizeDetails({ status: 200, ok: true, result: data });
        }
      }
      // Fallback: empty details
      return {} as MediaDetails;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60, // 1h
    retry: 1,
  });
}

// ─────────── Episodes for a series season ───────────
export function useEpisodes(
  _imdbID?: string | null,
  season: number = 1,
  tvId?: number | null
) {
  return useQuery<Episode[]>({
    queryKey: ["episodes", tvId, season],
    queryFn: async () => {
      if (!tvId) return [];
      const data = await fetchTmdbSeasonEpisodesAsFilmRail(tvId, season);
      if (!data) return [];
      return normalizeEpisodes(data);
    },
    enabled: !!tvId,
    staleTime: 1000 * 60 * 60, // 1h
    retry: 1,
  });
}

// ─────────── Popular stars / actors ───────────
export interface Star {
  id: number;
  name: string;
  imageUrl?: string;
}

export function useStars() {
  return useQuery<Star[]>({
    queryKey: ["stars"],
    queryFn: async () => {
      const people = await fetchTmdbPopularPeople();
      return people.slice(0, 24).map((p) => ({
        id: p.id,
        name: p.name,
        imageUrl: p.profile_path
          ? `https://image.tmdb.org/t/p/w300${p.profile_path}`
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
              p.name
            )}&size=256&background=random&bold=true`,
      }));
    },
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}

// ─────────── Single star filmography ───────────
export interface StarFilmography {
  star_id: number;
  star_name: string;
  image_url?: string;
  bio?: string;
  birth_year?: number;
  nationality?: string;
  films: MediaListItem[];
}

export function useStar(starId?: number | null) {
  return useQuery<StarFilmography | null>({
    queryKey: ["star", starId],
    queryFn: async () => {
      if (!starId) return null;
      const data = await fetchTmdbPersonFilmographyAsFilmRail(starId);
      if (!data) return null;
      const films = normalizeList<MediaListItem>({
        status: 200,
        ok: true,
        result: data.films as Record<string, unknown>[],
      });
      return {
        star_id: Number(data.star_id),
        star_name: data.star_name,
        image_url: data.image_url,
        bio: data.bio,
        birth_year: data.birth_year,
        nationality: data.nationality,
        films,
      };
    },
    enabled: starId !== null && starId !== undefined,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}

// ─────────── Convenience: prefetch on hover ───────────
export function usePrefetch() {
  const queryClient = useQueryClient();
  return {
    prefetchDetails: (id: number, type?: "movie" | "serie", tmdbId?: number) =>
      queryClient.prefetchQuery({
        queryKey: ["details", id, type, tmdbId],
      }),
  };
}
