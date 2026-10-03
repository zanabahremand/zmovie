"use client";

import { useState } from "react";
import { Play, ChevronDown, Clock, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEpisodes } from "@/hooks/use-majidapi";
import { cn } from "@/lib/utils";

/** Episode list for a series — shown in the DetailModal.
 *
 * In static-export mode, we use TMDB's tvId (numeric) instead of imdbID.
 * The TV show's TMDB id is passed via the `tvId` prop.
 */
export function EpisodeList({
  tvId,
  totalSeasons,
  onPlayEpisode,
}: {
  tvId?: number;
  totalSeasons?: number;
  onPlayEpisode: (episodeId: number, episodeTitle: string) => void;
}) {
  const maxSeason = totalSeasons && totalSeasons > 0 ? Math.min(totalSeasons, 20) : 5;
  const [season, setSeason] = useState(1);
  // tvId is required for the client-side TMDB call
  const { data: episodes, isLoading } = useEpisodes(undefined, season, tvId);

  return (
    <div>
      {/* Season selector */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground">فصل:</span>
        <div className="relative">
          <select
            value={season}
            onChange={(e) => setSeason(Number(e.target.value))}
            className="appearance-none bg-secondary/60 hover:bg-secondary text-foreground text-sm font-medium pr-8 pl-3 py-1.5 rounded-md border border-border/40 focus-brand cursor-pointer"
          >
            {Array.from({ length: maxSeason }, (_, i) => i + 1).map((s) => (
              <option key={s} value={s}>
                فصل {s}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        <span className="text-xs text-muted-foreground">
          {episodes?.length ? `${episodes.length} قسمت` : ""}
        </span>
      </div>

      {/* Episodes list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : !episodes || episodes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            قسمتی برای این فصل یافت نشد.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ممکن است این فصل هنوز پخش نشده باشه یا اطلاعات در دسترس نباشه.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin pr-1">
          {episodes.map((ep) => (
            <div
              key={ep.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                "bg-card/60 hover:bg-card border border-border/40 hover:border-primary/40",
                "transition-all focus-brand group"
              )}
            >
              <span className="grid place-items-center h-10 w-10 shrink-0 rounded-md bg-primary/15 text-primary font-bold text-sm">
                {ep.episode}
              </span>
              {ep.poster ? (
                <img
                  src={ep.poster}
                  alt={ep.title}
                  className="h-14 w-24 shrink-0 rounded-md object-cover bg-muted"
                  loading="lazy"
                />
              ) : (
                <div className="h-14 w-24 shrink-0 rounded-md bg-muted grid place-items-center">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {ep.title || `قسمت ${ep.episode}`}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>قسمت {ep.episode}</span>
                  {ep.released && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {ep.released}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onPlayEpisode(ep.id, ep.title || `قسمت ${ep.episode}`)}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium",
                  "bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground",
                  "transition-colors shrink-0"
                )}
              >
                <Play className="h-3 w-3 fill-current" />
                پخش
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
