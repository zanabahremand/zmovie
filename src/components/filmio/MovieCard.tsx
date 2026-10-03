"use client";

import { Star, Play, Plus, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useZmovieStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { MediaListItem } from "@/lib/majidapi";

/**
 * Poster card with rich hover treatment — inspired by Netflix/HBO Max
 * dribbble concepts: 2:3 poster, gradient overlay, quick "add to list" +
 * "play" buttons, rank badge support for Top 10 rows.
 */
export function MovieCard({
  item,
  onClick,
  onHover,
  rank,
}: {
  item: MediaListItem;
  onClick: () => void;
  onHover?: (item: MediaListItem) => void;
  rank?: number;
}) {
  const toggleWatchlist = useZmovieStore((s) => s.toggleWatchlist);
  const isInWatchlist = useZmovieStore((s) =>
    s.watchlist.some((w) => w.id === item.id)
  );

  const rate =
    typeof item.rate === "string" || typeof item.rate === "number"
      ? item.rate
      : item.imdb;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="shrink-0 w-32 sm:w-40 lg:w-44 snap-start group relative"
      onMouseEnter={() => onHover?.(item)}
    >
      {/* Rank badge — Netflix Top 10 style */}
      {rank !== undefined && (
        <div className="absolute -bottom-2 -left-2 z-10 select-none pointer-events-none">
          <span
            className={cn(
              "text-[5rem] sm:text-[6rem] font-black leading-none",
              "bg-gradient-to-br from-primary/90 to-primary/40 bg-clip-text text-transparent",
              "drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] tabular-nums"
            )}
            aria-hidden
          >
            {rank}
          </span>
        </div>
      )}

      <div
        className={cn(
          "relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer card-lift",
          "bg-muted ring-1 ring-border/30 focus-brand"
        )}
        onClick={() => {
          // If item has a tmdb_id, set both id (the TMDB id number) and tmdbId
          // The DetailModal will use tmdbId to send tmdb_ prefix to the proxy
          onClick();
          const tmdbId = (item as MediaListItem & { tmdb_id?: number }).tmdb_id;
          if (tmdbId) {
            useZmovieStore.getState().setActiveTmdbId(tmdbId);
          } else {
            useZmovieStore.getState().setActiveTmdbId(null);
          }
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        aria-label={`نمایش جزئیات ${item.title}`}
      >
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted-foreground text-xs p-2 text-center">
            بدون پوستر
          </div>
        )}

        {/* Always-on bottom gradient for title visibility */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Hover-only content layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

        <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 pointer-events-none">
          <p className="text-xs sm:text-sm font-semibold text-white line-clamp-2 leading-tight">
            {item.title}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[10px] sm:text-xs text-white/80">
            {rate !== undefined && (
              <span className="inline-flex items-center gap-0.5 text-yellow-400 font-semibold">
                <Star className="h-3 w-3 fill-yellow-400" />
                {rate}
              </span>
            )}
            {item.year && <span>{item.year}</span>}
            {item.quality && (
              <span className="px-1 rounded bg-white/20">{item.quality}</span>
            )}
          </div>
        </div>

        {/* Quick actions — visible on hover */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            className="h-7 w-7 grid place-items-center rounded-full bg-background/80 backdrop-blur text-foreground hover:bg-primary hover:text-primary-foreground transition-colors focus-brand"
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchlist({
                id: item.id,
                title: item.title,
                poster: item.poster,
                type: item.type,
                year: item.year,
              });
            }}
            aria-label={isInWatchlist ? "حذف از لیست" : "افزودن به لیست"}
          >
            {isInWatchlist ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Play overlay button — bottom center, desktop */}
        <button
          type="button"
          className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:grid"
          tabIndex={-1}
        >
          <span className="h-12 w-12 rounded-full bg-primary/95 backdrop-blur grid place-items-center text-primary-foreground shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.7)]">
            <Play className="h-5 w-5 fill-current" />
          </span>
        </button>
      </div>

      {/* Title below — always visible */}
      <p className="mt-2 text-xs sm:text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
        {rank !== undefined && (
          <span className="text-muted-foreground mr-1 tabular-nums">
            {rank}.
          </span>
        )}
        {item.title}
      </p>
    </motion.div>
  );
}
