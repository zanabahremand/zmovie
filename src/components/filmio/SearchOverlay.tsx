"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@/hooks/use-majidapi";
import { useZmovieStore } from "@/lib/store";
import { BrandMark } from "./BrandMark";

/** Full-screen search overlay — debounced, with clear results. */
export function SearchOverlay() {
  const open = useZmovieStore((s) => s.searchOpen);
  const setOpen = useZmovieStore((s) => s.setSearchOpen);
  const setActiveId = useZmovieStore((s) => s.setActiveId);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce 350ms
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  // Autofocus on open + reset state on close
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    if (!open) {
      const t = setTimeout(() => {
        setQuery("");
        setDebounced("");
      }, 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  const { data, isLoading, isError, error } = useSearch(debounced);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="top-[10vh] translate-y-0 max-w-3xl w-[92vw] p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/40 max-h-[85vh] flex flex-col"
        aria-describedby="search-modal-desc"
      >
        <DialogTitle className="sr-only">جستجو</DialogTitle>

        {/* Search header */}
        <div className="flex items-center gap-2 p-3 border-b border-border/40">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="نام فیلم یا سریال را بنویسید…"
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base placeholder:text-muted-foreground"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 min-h-[200px]">
          {!debounced ? (
            <EmptyHint />
          ) : isLoading ? (
            <GridSkeleton />
          ) : isError ? (
            <ErrorCard msg={(error as Error).message} />
          ) : !data || data.length === 0 ? (
            <NoResult />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.map((item, idx) => (
                <button
                  key={`${item.id}-${idx}`}
                  className="group flex gap-3 p-2 rounded-lg text-right hover:bg-secondary/60 transition-colors focus-brand"
                  onClick={() => {
                    setOpen(false);
                    setActiveId(item.id);
                  }}
                >
                  <div className="h-24 w-16 shrink-0 rounded-md overflow-hidden bg-muted ring-1 ring-border/30">
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid place-items-center h-full text-xs text-muted-foreground p-1">
                        بدون پوستر
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.year || "—"}
                      {item.type
                        ? ` · ${item.type === "movie" ? "فیلم" : "سریال"}`
                        : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-3 py-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <BrandMark className="text-xs" showGlyph={false} />
          <span>Esc برای بستن</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EmptyHint() {
  return (
    <div className="grid place-items-center h-full py-10 text-center">
      <div>
        <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          شروع به تایپ کنید تا نتایج نمایش داده شوند.
        </p>
      </div>
    </div>
  );
}

function NoResult() {
  return (
    <div className="grid place-items-center h-full py-10 text-center">
      <div>
        <p className="text-base text-foreground mb-1">نتیجه‌ای پیدا نشد.</p>
        <p className="text-sm text-muted-foreground">
          کلمه‌ی دیگری را امتحان کنید.
        </p>
      </div>
    </div>
  );
}

function ErrorCard({ msg }: { msg: string }) {
  return (
    <div className="grid place-items-center h-full py-10 text-center">
      <AlertCircle className="h-8 w-8 text-destructive mb-2" />
      <p className="text-sm text-destructive max-w-sm">{msg}</p>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3 p-2">
          <Skeleton className="h-24 w-16 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
