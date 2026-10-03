"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, Star, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useZmovieStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { HomeSlide } from "@/lib/majidapi";

/**
 * Cinematic hero carousel — auto-rotating featured slides.
 * Uses HomeSlide objects from the filmrail `home` endpoint, which already
 * provide poster, description, trailer URL, and action_id (used to open
 * the detail modal).
 */
const SLIDE_INTERVAL = 7000; // ms between auto-advances

export function HeroBanner({ slides }: { slides: HomeSlide[] }) {
  const setActiveId = useZmovieStore((s) => s.setActiveId);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Take up to 5 featured items
  const featured = slides.slice(0, 5);

  const advance = useCallback(
    (dir: 1 | -1) => {
      setDirection(dir);
      setIndex((prev) => {
        const next = prev + dir;
        if (next >= featured.length) return 0;
        if (next < 0) return featured.length - 1;
        return next;
      });
    },
    [featured.length]
  );

  // Auto-advance
  useEffect(() => {
    if (featured.length <= 1) return;
    const t = setInterval(() => advance(1), SLIDE_INTERVAL);
    return () => clearInterval(t);
  }, [featured.length, advance]);

  if (featured.length === 0) {
    return <HeroSkeleton />;
  }

  const current = featured[index];

  return (
    <section className="relative w-full overflow-hidden bg-background" style={{ height: "70vh", minHeight: "540px", maxHeight: "760px" }}>
      {/* Animated backdrop layer */}
      <AnimatePresence mode="sync" custom={direction}>
        <motion.div
          key={current.id}
          custom={direction}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {current.poster ? (
            <img
              src={current.poster}
              alt={current.title}
              className="absolute inset-0 h-full w-full object-cover object-top"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-primary/40 via-background to-background" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradient masks for cinematic depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />

      {/* Glow accent — primary brand color */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

      {/* Content overlay */}
      <div className="relative h-full flex flex-col justify-end pb-16 sm:pb-20 px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Badge
              variant="default"
              className="self-start mb-3 bg-primary text-primary-foreground hover:bg-primary shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.7)]"
            >
              ✨ پیشنهاد ویژه
            </Badge>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight max-w-3xl leading-[1.05] drop-shadow-[0_2px_30px_rgba(0,0,0,0.9)]">
              {current.title}
            </h1>

            {/* Description (truncated) */}
            {current.description && (
              <p className="mt-3 max-w-2xl text-sm sm:text-base text-foreground/80 line-clamp-2 sm:line-clamp-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                {current.description}
              </p>
            )}

            {/* Type badge */}
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <Badge
                variant="outline"
                className="bg-transparent border-foreground/40 text-foreground backdrop-blur"
              >
                {current.type === "serie" ? "سریال" : "فیلم"}
              </Badge>
              {current.actionBtnText && (
                <span className="text-xs text-foreground/60 hidden sm:inline">
                  آماده برای {current.actionBtnText}
                </span>
              )}
            </div>

            {/* CTA buttons */}
            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.7)] hover:scale-105 transition-transform"
                onClick={() => setActiveId(current.id)}
              >
                <Play className="h-5 w-5 fill-current" />
                زدمووی
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className={cn(
                  "bg-foreground/15 backdrop-blur text-foreground hover:bg-foreground/25",
                  "border border-foreground/10 hover:scale-105 transition-transform"
                )}
                onClick={() => setActiveId(current.id)}
              >
                <Info className="h-5 w-5" />
                جزئیات بیشتر
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide indicators + controls */}
        {featured.length > 1 && (
          <div className="absolute bottom-8 right-4 sm:right-8 lg:right-12 flex items-center gap-3">
            <button
              onClick={() => advance(-1)}
              aria-label="اسلاید قبلی"
              className="grid place-items-center h-9 w-9 rounded-full bg-background/40 backdrop-blur border border-foreground/20 hover:bg-background/80 transition-colors focus-brand"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {featured.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index
                      ? "w-8 bg-primary"
                      : "w-1.5 bg-foreground/40 hover:bg-foreground/60"
                  )}
                  aria-label={`اسلاید ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => advance(1)}
              aria-label="اسلاید بعدی"
              className="grid place-items-center h-9 w-9 rounded-full bg-background/40 backdrop-blur border border-foreground/20 hover:bg-background/80 transition-colors focus-brand"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <section
      className="relative w-full overflow-hidden bg-muted"
      style={{ height: "70vh", minHeight: "540px", maxHeight: "760px" }}
    >
      <div className="shimmer h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-10 left-8 right-8 space-y-3">
        <div className="h-10 w-2/3 bg-foreground/10 rounded shimmer" />
        <div className="h-4 w-1/3 bg-foreground/10 rounded shimmer" />
        <div className="h-10 w-48 bg-foreground/10 rounded shimmer" />
      </div>
    </section>
  );
}
