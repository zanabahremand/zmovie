"use client";

import { useState } from "react";
import { X, Star, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useZmovieStore } from "@/lib/store";
import { useStars } from "@/hooks/use-majidapi";

/** Popular stars modal — shows a curated list + search. */
export function StarsModal() {
  const open = useZmovieStore((s) => s.starsOpen);
  const setOpen = useZmovieStore((s) => s.setStarsOpen);
  const setActiveStarId = useZmovieStore((s) => s.setActiveStarId);
  const [query, setQuery] = useState("");
  const { data, isLoading, isError } = useStars();

  const stars = data || [];

  // Filter by query
  const filtered = query.trim()
    ? stars.filter((s) =>
        s.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : stars;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="top-[5vh] translate-y-0 max-w-5xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden bg-background border-border/40 flex flex-col"
        aria-describedby="stars-modal-desc"
      >
        <DialogTitle className="sr-only">ستاره‌های محبوب</DialogTitle>

        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/40">
          <Star className="h-5 w-5 text-primary shrink-0" />
          <h2 className="text-lg font-bold text-foreground flex-1">
            ستاره‌های محبوب
          </h2>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی ستاره..."
              className="pr-8 bg-secondary/40 border-border/40"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setOpen(false)}
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
          {isLoading ? (
            <StarsGridSkeleton />
          ) : isError ? (
            <div className="grid place-items-center h-full text-center">
              <p className="text-sm text-muted-foreground">
                در حال بارگذاری ستاره‌ها، لطفاً دوباره تلاش کنید.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid place-items-center h-full text-center">
              <Star className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                ستاره‌ای با این نام پیدا نشد.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filtered.map((star) => (
                <button
                  key={star.id}
                  onClick={() => {
                    setOpen(false);
                    setActiveStarId(star.id);
                  }}
                  className="flex flex-col items-center text-center group cursor-pointer focus-brand rounded-lg p-2"
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-muted ring-2 ring-border/40 group-hover:ring-primary transition-all mb-3">
                    {star.imageUrl ? (
                      <img
                        src={star.imageUrl}
                        alt={star.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid place-items-center h-full text-3xl font-bold text-muted-foreground">
                        {star.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {star.name}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StarsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mb-3" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
