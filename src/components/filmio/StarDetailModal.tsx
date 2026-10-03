"use client";

import { X, Star as StarIcon, Film, Tv, Loader2, ExternalLink, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useZmovieStore } from "@/lib/store";
import { useStar } from "@/hooks/use-majidapi";
import { MovieCard } from "./MovieCard";
import { cn } from "@/lib/utils";
import type { MediaListItem } from "@/lib/majidapi";

/** Full modal showing a single star's bio + filmography. */
export function StarDetailModal() {
  const starId = useZmovieStore((s) => s.activeStarId);
  const setStarId = useZmovieStore((s) => s.setActiveStarId);
  const setActiveId = useZmovieStore((s) => s.setActiveId);
  const { data, isLoading, isError, error } = useStar(starId);

  return (
    <Dialog open={starId !== null} onOpenChange={(v) => !v && setStarId(null)}>
      <DialogContent
        className="top-[5vh] translate-y-0 max-w-5xl w-[95vw] max-h-[90vh] p-0 gap-0 overflow-hidden bg-background border-border/40 flex flex-col"
        aria-describedby="star-detail-modal-desc"
      >
        <DialogTitle className="sr-only">جزئیات ستاره</DialogTitle>

        {/* Header with backdrop */}
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-background">
            <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_25%_25%,hsl(var(--primary)/0.35),transparent_50%),radial-gradient(circle_at_75%_60%,hsl(var(--primary)/0.25),transparent_50%)]" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          {/* Star avatar + name */}
          <div className="relative h-full flex items-end gap-4 p-4 sm:p-6">
            <div className="relative shrink-0">
              {data?.image_url ? (
                <img
                  src={data.image_url}
                  alt={data.star_name}
                  className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl ring-4 ring-background shadow-lg object-cover bg-muted"
                />
              ) : (
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl bg-muted grid place-items-center">
                  <StarIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl sm:text-3xl font-extrabold text-foreground drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
                  {data?.star_name || (isLoading ? "در حال بارگذاری..." : "ستاره نامشخص")}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 -mr-2 -mt-2"
                  onClick={() => setStarId(null)}
                  aria-label="بستن"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {data?.nationality && (
                <p className="text-xs sm:text-sm text-foreground/70 mt-1">
                  {data.nationality}
                  {data.birth_year ? ` · متولد ${data.birth_year}` : ""}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6">
          {isLoading ? (
            <StarDetailSkeleton />
          ) : isError ? (
            <div className="text-center py-10">
              <p className="text-sm text-destructive mb-3">
                {(error as Error).message || "خطا در بارگذاری اطلاعات ستاره"}
              </p>
              <Button variant="secondary" size="sm" onClick={() => setStarId(null)}>
                بستن
              </Button>
            </div>
          ) : data ? (
            <>
              {/* Bio */}
              {data.bio && (
                <div className="mb-6 p-4 rounded-lg bg-secondary/40 border border-border/30">
                  <p className="text-sm sm:text-base text-foreground/85 leading-relaxed">
                    {data.bio}
                  </p>
                </div>
              )}

              {/* Filmography */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="h-5 w-1 rounded bg-primary" />
                  <Film className="h-5 w-5 text-primary" />
                  فیلم‌شناسی
                  {data.films?.length ? (
                    <span className="text-xs text-muted-foreground font-normal">
                      ({data.films.length} اثر)
                    </span>
                  ) : null}
                </h3>

                {!data.films || data.films.length === 0 ? (
                  <div className="grid place-items-center h-32 text-center text-sm text-muted-foreground">
                    اثری برای این ستاره یافت نشد.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                    {data.films.map((film, i) => (
                      <MovieCard
                        key={`${film.id}-${i}`}
                        item={film as MediaListItem}
                        onClick={() => {
                          // Close this modal & open the detail modal
                          setStarId(null);
                          setActiveId((film as MediaListItem).id);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              اطلاعاتی یافت نشد.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StarDetailSkeleton() {
  return (
    <div>
      <Skeleton className="h-20 w-full mb-6" />
      <Skeleton className="h-6 w-1/3 mb-3" />
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <Skeleton className="h-3 w-3/4 mt-2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
