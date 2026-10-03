"use client";

import { useState, useEffect, useCallback } from "react";
import { useZmovieStore } from "@/lib/store";
import {
  useHome,
  useMovies,
  useSeries,
  useGenres,
  useByGenre,
} from "@/hooks/use-majidapi";
import { Navbar } from "@/components/filmio/Navbar";
import { HeroBanner } from "@/components/filmio/HeroBanner";
import { CarouselRow } from "@/components/filmio/CarouselRow";
import { MovieCard } from "@/components/filmio/MovieCard";
import { DetailModal } from "@/components/filmio/DetailModal";
import { PlayerModal } from "@/components/filmio/PlayerModal";
import { SearchOverlay } from "@/components/filmio/SearchOverlay";
import { AboutModal } from "@/components/filmio/AboutModal";
import { StarsModal } from "@/components/filmio/StarsModal";
import { StarDetailModal } from "@/components/filmio/StarDetailModal";
import { WelcomeBanner, ErrorBanner } from "@/components/filmio/WelcomeBanner";
import { WatchlistRow } from "@/components/filmio/WatchlistRow";
import { Footer } from "@/components/filmio/Footer";
import type { MediaListItem } from "@/lib/majidapi";

/** Home page of زدمووی — premium streaming-service layout, RTL Persian. */
export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const setActiveId = useZmovieStore((s) => s.setActiveId);
  const setSearchOpen = useZmovieStore((s) => s.setSearchOpen);

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  const {
    data: homeData,
    isLoading: homeLoading,
    isError: homeError,
    refetch: refetchHome,
  } = useHome();
  const moviesQuery = useMovies();
  const seriesQuery = useSeries();
  const { data: genres } = useGenres();

  const onItemClicked = useCallback(
    (item: MediaListItem) => {
      setActiveId(item.id);
    },
    [setActiveId]
  );

  // If home is loading and we're on home → show welcome banner
  const isInitialLoading = homeLoading && !homeData;
  const hasError = homeError && !homeData;

  // ──────── Home tab ────────
  if (activeTab === "home") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 pt-0">
          {isInitialLoading ? (
            <WelcomeBanner />
          ) : hasError ? (
            <ErrorBanner
              onRetry={() => {
                refetchHome();
                moviesQuery.refetch();
                seriesQuery.refetch();
              }}
            />
          ) : (
            <>
              <HeroBanner slides={homeData?.slider ?? []} />

              {/* Latest movies (from home) */}
              {homeData?.latestMovies && homeData.latestMovies.length > 0 && (
                <CarouselRow
                  title="جدیدترین فیلم‌ها"
                  items={homeData.latestMovies}
                  onItemClick={onItemClicked}
                  accentColor
                />
              )}

              {/* Latest series (from home) */}
              {homeData?.latestSeries && homeData.latestSeries.length > 0 && (
                <CarouselRow
                  title="جدیدترین سریال‌ها"
                  items={homeData.latestSeries}
                  onItemClick={onItemClicked}
                  accentColor
                />
              )}

              {/* Featured (from home) */}
              {homeData?.featuredMovies && homeData.featuredMovies.length > 0 && (
                <CarouselRow
                  title="پیشنهادها"
                  items={homeData.featuredMovies}
                  onItemClick={onItemClicked}
                  showRank
                  accentColor
                />
              )}

              {/* Per-genre selections (rich, from home endpoint) */}
              {homeData?.featuresGenreAndMovie?.map((section) => (
                <CarouselRow
                  key={section.genreId}
                  title={section.name}
                  items={section.videos ?? []}
                  onItemClick={onItemClicked}
                  accentColor
                />
              ))}

              {/* Movies — first page flattened (browse-all) */}
              <CarouselRow
                title="همه‌ی فیلم‌ها"
                items={moviesQuery.data?.pages?.flat() ?? []}
                loading={moviesQuery.isLoading}
                onItemClick={onItemClicked}
                accentColor
              />

              {/* Series — first page flattened (browse-all) */}
              <CarouselRow
                title="همه‌ی سریال‌ها"
                items={seriesQuery.data?.pages?.flat() ?? []}
                loading={seriesQuery.isLoading}
                onItemClick={onItemClicked}
                accentColor
              />

              {/* History (if any) */}
              <WatchlistRow variant="history" onItemClick={onItemClicked} />

              {/* Personal watchlist (if any) */}
              <WatchlistRow variant="watchlist" onItemClick={onItemClicked} />

              {/* Genre spotlight rows — pick first 3 genres not in featuresGenreAndMovie */}
              {(genres ?? [])
                .filter(
                  (g) =>
                    !homeData?.featuresGenreAndMovie?.some(
                      (fg) => fg.genreId === g.id
                    )
                )
                .slice(0, 3)
                .map((g) => (
                  <GenreRow
                    key={g.id}
                    genreId={g.id}
                    genreName={g.name}
                    onItemClick={onItemClicked}
                  />
                ))}

              {/* Load more movies if available */}
              {moviesQuery.hasNextPage && (
                <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-4">
                  <button
                    onClick={() => moviesQuery.fetchNextPage()}
                    disabled={moviesQuery.isFetchingNextPage}
                    className="w-full text-sm py-3 rounded-md bg-secondary/60 hover:bg-secondary text-foreground transition-colors focus-brand"
                  >
                    {moviesQuery.isFetchingNextPage
                      ? "در حال بارگذاری…"
                      : "بارگذاری فیلم‌های بیشتر"}
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        <Footer />
        <DetailModal />
        <PlayerModal />
        <StarsModal />
        <StarDetailModal />
        <SearchOverlay />
        <AboutModal />
      </div>
    );
  }

  // ──────── Movies tab ────────
  if (activeTab === "movies") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 pt-20 sm:pt-24">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-6 flex items-center gap-3">
              <span className="h-7 w-1.5 rounded bg-primary" />
              فیلم‌ها
            </h1>
            <PaginatedGrid
              query={moviesQuery}
              onItemClick={onItemClicked}
              emptyText="فیلمی یافت نشد."
            />
          </div>
        </main>
        <Footer />
        <DetailModal />
        <PlayerModal />
        <StarsModal />
        <StarDetailModal />
        <SearchOverlay />
        <AboutModal />
      </div>
    );
  }

  // ──────── Series tab ────────
  if (activeTab === "series") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 pt-20 sm:pt-24">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-6 flex items-center gap-3">
              <span className="h-7 w-1.5 rounded bg-primary" />
              سریال‌ها
            </h1>
            <PaginatedGrid
              query={seriesQuery}
              onItemClick={onItemClicked}
              emptyText="سریالی یافت نشد."
            />
          </div>
        </main>
        <Footer />
        <DetailModal />
        <PlayerModal />
        <StarsModal />
        <StarDetailModal />
        <SearchOverlay />
        <AboutModal />
      </div>
    );
  }

  // ──────── Newest tab (uses home data) ────────
  if (activeTab === "newest") {
    const latest = [
      ...(homeData?.latestMovies ?? []),
      ...(homeData?.latestSeries ?? []),
    ];
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 pt-20 sm:pt-24">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-6 flex items-center gap-3">
              <span className="h-7 w-1.5 rounded bg-primary" />
              تازه‌ترین‌ها
            </h1>
            <SimpleGrid
              items={latest}
              loading={homeLoading}
              onItemClick={onItemClicked}
            />
          </div>
        </main>
        <Footer />
        <DetailModal />
        <PlayerModal />
        <StarsModal />
        <StarDetailModal />
        <SearchOverlay />
        <AboutModal />
      </div>
    );
  }

  // ──────── Watchlist tab ────────
  if (activeTab === "watchlist") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 pt-20 sm:pt-24">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-6 flex items-center gap-3">
              <span className="h-7 w-1.5 rounded bg-primary" />
              لیست زدموویی من
            </h1>
            <WatchlistRow variant="watchlist" onItemClick={onItemClicked} />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-6 mt-8 flex items-center gap-3">
              <span className="h-7 w-1.5 rounded bg-primary" />
              اخیراً دیده شده
            </h1>
            <WatchlistRow variant="history" onItemClick={onItemClicked} />
          </div>
        </main>
        <Footer />
        <DetailModal />
        <PlayerModal />
        <StarsModal />
        <StarDetailModal />
        <SearchOverlay />
        <AboutModal />
      </div>
    );
  }

  // Fallback (should never reach)
  return null;
}

/** Genre row sub-component — fetches its own data via the genre endpoint. */
function GenreRow({
  genreId,
  genreName,
  onItemClick,
}: {
  genreId: number;
  genreName: string;
  onItemClick: (item: MediaListItem) => void;
}) {
  const { data, isLoading } = useByGenre(genreId);
  // take first page only for the carousel
  const items = data?.pages?.flat() ?? [];
  return (
    <CarouselRow
      title={genreName}
      items={items}
      loading={isLoading}
      onItemClick={onItemClick}
      accentColor
    />
  );
}

/** Paginated grid (used by Movies and Series tabs). */
function PaginatedGrid({
  query,
  onItemClick,
  emptyText,
}: {
  query: ReturnType<typeof useMovies>;
  onItemClick: (item: MediaListItem) => void;
  emptyText: string;
}) {
  const items = query.data?.pages?.flat() ?? [];

  if (query.isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] rounded-lg shimmer" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="grid place-items-center h-64 text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-4">
        {items.map((item, idx) => (
          <MovieCard
            key={`${item.id}-${idx}`}
            item={item}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>

      {query.hasNextPage && (
        <div className="mt-6 text-center">
          <button
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
            className="px-6 py-3 rounded-md bg-secondary/60 hover:bg-secondary text-sm text-foreground transition-colors disabled:opacity-50 focus-brand"
          >
            {query.isFetchingNextPage
              ? "در حال بارگذاری…"
              : "بارگذاری موارد بیشتر"}
          </button>
        </div>
      )}
    </>
  );
}

/** Simple (non-paginated) grid — used by Newest tab. */
function SimpleGrid({
  items,
  loading,
  onItemClick,
}: {
  items: MediaListItem[];
  loading: boolean;
  onItemClick: (item: MediaListItem) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-4">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] rounded-lg shimmer" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="grid place-items-center h-64 text-sm text-muted-foreground">
        موردی یافت نشد.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-4">
      {items.map((item, idx) => (
        <MovieCard
          key={`${item.id}-${idx}`}
          item={item}
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  );
}
