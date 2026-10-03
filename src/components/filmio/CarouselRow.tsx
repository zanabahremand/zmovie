"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieCard } from "./MovieCard";
import { cn } from "@/lib/utils";
import type { MediaListItem } from "@/lib/majidapi";

/** A horizontally scrolling row of movie/serie cards. */
export function CarouselRow({
  title,
  items,
  loading,
  onItemClick,
  onItemHover,
  showRank = false,
  rankStart = 1,
  accentColor,
}: {
  title: string;
  items: MediaListItem[];
  loading?: boolean;
  onItemClick: (item: MediaListItem) => void;
  onItemHover?: (item: MediaListItem) => void;
  showRank?: boolean;
  rankStart?: number;
  accentColor?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [items.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section className="relative py-4 sm:py-6 fade-up">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-xl font-bold text-foreground flex items-center gap-2">
            {accentColor && (
              <span className="h-5 w-1 rounded bg-primary" />
            )}
            {title}
          </h2>
          {!loading && items.length > 0 && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              {items.length} مورد
            </span>
          )}
        </div>

        <div className="relative group/row">
          {/* Left arrow */}
          {canLeft && (
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "absolute -left-2 top-1/2 -translate-y-1/2 z-20 hidden sm:grid place-items-center",
                "h-10 w-10 rounded-full bg-background/85 backdrop-blur border border-border/50",
                "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] hover:bg-background hover:scale-105 transition-all"
              )}
              onClick={() => scrollBy(-1)}
              aria-label="قبلی"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}

          {/* Right arrow */}
          {canRight && items.length > 0 && (
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "absolute -right-2 top-1/2 -translate-y-1/2 z-20 hidden sm:grid place-items-center",
                "h-10 w-10 rounded-full bg-background/85 backdrop-blur border border-border/50",
                "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] hover:bg-background hover:scale-105 transition-all"
              )}
              onClick={() => scrollBy(1)}
              aria-label="بعدی"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          {/* Scroller */}
          <div
            ref={scrollerRef}
            className={cn(
              "flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide",
              "scroll-smooth snap-x snap-mandatory",
              "pb-2"
            )}
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
              : items.length === 0
                ? <EmptyRow />
                : items.map((item, idx) => (
                    <MovieCard
                      key={`${item.id}-${idx}`}
                      item={item}
                      onClick={() => onItemClick(item)}
                      onHover={onItemHover}
                      rank={showRank ? rankStart + idx : undefined}
                    />
                  ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CardSkeleton() {
  return (
    <div className="shrink-0 w-32 sm:w-40 lg:w-44 snap-start">
      <div className="aspect-[2/3] rounded-lg shimmer" />
      <div className="h-3 w-3/4 mt-2 rounded shimmer" />
    </div>
  );
}

function EmptyRow() {
  return (
    <div className="w-full text-center text-sm text-muted-foreground py-8">
      موردی یافت نشد.
    </div>
  );
}
