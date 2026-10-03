"use client";

import { cn } from "@/lib/utils";

/** Zmovie wordmark — bold red "Z" + "movie" in foreground color. */
export function BrandMark({
  className,
  showGlyph = true,
}: {
  className?: string;
  showGlyph?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 select-none font-extrabold tracking-tight",
        className
      )}
    >
      {showGlyph && (
        <span
          aria-hidden
          className="grid place-items-center h-7 w-7 rounded-md bg-primary text-primary-foreground text-lg font-black shadow-[0_4px_14px_-2px_hsl(var(--primary)/0.55)]"
        >
          Z
        </span>
      )}
      <span className="text-xl leading-none">
        <span className="text-primary brand-glow">Z</span>
        <span className="text-foreground">movie</span>
      </span>
    </span>
  );
}
