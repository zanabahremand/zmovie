"use client";

import { Bookmark, Clock } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { useZmovieStore } from "@/lib/store";
import type { MediaListItem } from "@/lib/majidapi";

/** Combined watchlist + history row — uses store items as MediaListItem. */
export function WatchlistRow({
  variant,
  onItemClick,
}: {
  variant: "watchlist" | "history";
  onItemClick: (item: MediaListItem) => void;
}) {
  const items = useZmovieStore((s) =>
    variant === "watchlist" ? s.watchlist : s.history
  );

  if (items.length === 0) {
    return (
      <section className="py-6">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <h2 className="text-base sm:text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            {variant === "watchlist" ? (
              <>
                <span className="h-5 w-1 rounded bg-primary" />
                <Bookmark className="h-5 w-5 text-primary" />
                لیست زدموویی من
              </>
            ) : (
              <>
                <span className="h-5 w-1 rounded bg-primary" />
                <Clock className="h-5 w-5 text-primary" />
                اخیراً دیده شده
              </>
            )}
          </h2>
          <div className="grid place-items-center h-32 rounded-xl bg-secondary/30 border border-dashed border-border/60">
            <div className="text-center">
              <p className="text-sm text-foreground mb-1">
                {variant === "watchlist"
                  ? "لیست زدموویی شما خالی است."
                  : "هنوز چیزی زدمووی نکرده‌اید."}
              </p>
              <p className="text-xs text-muted-foreground">
                با کلیک روی هر فیلم یا سریال می‌توانید آن را اضافه کنید.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 fade-up">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <h2 className="text-base sm:text-xl font-bold text-foreground mb-3 flex items-center gap-2">
          <span className="h-5 w-1 rounded bg-primary" />
          {variant === "watchlist" ? (
            <>
              <Bookmark className="h-5 w-5 text-primary" />
              لیست زدموویی من
            </>
          ) : (
            <>
              <Clock className="h-5 w-5 text-primary" />
              اخیراً دیده شده
            </>
          )}
          <span className="text-xs text-muted-foreground font-normal">
            ({items.length})
          </span>
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-4">
          {items.map((item) => (
            <MovieCard
              key={item.id}
              item={{
                id: item.id,
                title: item.title,
                poster: item.poster,
                type: item.type,
                year: item.year,
              }}
              onClick={() =>
                onItemClick({
                  id: item.id,
                  title: item.title,
                  poster: item.poster,
                  type: item.type,
                  year: item.year,
                })
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
