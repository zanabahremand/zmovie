"use client";

import { useState } from "react";
import { X, Play, Server, Loader2, AlertCircle, Subtitles, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useZmovieStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Streaming sources — each takes an imdbID and returns an embeddable URL.
 * These are free public embed services that don't require an API key.
 *
 * Some sources support a `quality` query param to switch between 480p/720p/1080p.
 */
const STREAMING_SOURCES = [
  {
    id: "2embed",
    name: "2Embed",
    buildUrl: (imdbID: string, _type: "movie" | "serie", quality: string) =>
      `https://www.2embed.cc/embed/${imdbID}${quality !== "auto" ? `?quality=${quality}` : ""}`,
    description: "منبع اصلی پخش — پشتیبانی از کیفیت",
    supportsQuality: true,
  },
  {
    id: "multiembed",
    name: "MultiEmbed",
    buildUrl: (imdbID: string, _type: "movie" | "serie", _quality: string) =>
      `https://multiembed.mov/?video_id=${imdbID}`,
    description: "منبع جایگزین",
    supportsQuality: false,
  },
  {
    id: "vidsrc",
    name: "VidSrc",
    buildUrl: (imdbID: string, _type: "movie" | "serie", quality: string) =>
      `https://vidsrc.net/embed/movie/${imdbID}/${quality !== "auto" ? `?quality=${quality}` : ""}`,
    description: "منبع جایگزین",
    supportsQuality: true,
  },
];

/** Quality options. */
const QUALITIES = [
  { id: "auto", name: "خودکار", description: "بهترین کیفیت موجود" },
  { id: "1080p", name: "1080p Full HD", description: "کیفیت بالا (نیاز به اینترنت سریع)" },
  { id: "720p", name: "720p HD", description: "کیفیت متعادل" },
  { id: "480p", name: "480p", description: "مصرف کم (مناسب اینترنت کند)" },
  { id: "360p", name: "360p", description: "حداقل مصرف" },
];

/**
 * Subtitle sources — each takes a title and returns a search URL where the
 * user can download subtitle files in Persian/Kurdish/etc.
 */
const SUBTITLE_SOURCES = [
  {
    id: "subtitlecat",
    name: "SubtitleCat",
    url: (title: string) =>
      `https://www.subtitlecat.com/index.php?search=${encodeURIComponent(title)}`,
    description: "فارسی، کردی و دیگر زبان‌ها",
    langs: ["فارسی", "کردی", "انگلیسی"],
  },
  {
    id: "opensubtitles",
    name: "OpenSubtitles",
    url: (title: string) =>
      `https://www.opensubtitles.org/en/search2/moviename-${encodeURIComponent(title)}`,
    description: "بزرگترین آرشیو زیرنویس",
    langs: ["فارسی", "کردی", "انگلیسی"],
  },
  {
    id: "yifysubtitles",
    name: "YIFY Subtitles",
    url: (title: string) =>
      `https://yifysubtitles.org/search?q=${encodeURIComponent(title)}`,
    description: "زیرنویس فیلم‌های YIFY",
    langs: ["فارسی", "انگلیسی"],
  },
];

/** Player modal — opens an embedded streaming iframe with subtitle links + quality selector. */
export function PlayerModal() {
  const playerItem = useZmovieStore((s) => s.playerItem);
  const setPlayerItem = useZmovieStore((s) => s.setPlayerItem);
  const [activeSource, setActiveSource] = useState(0);
  const [quality, setQuality] = useState("auto");
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!playerItem) return null;

  const imdbID = playerItem.imdbID;
  const title = playerItem.title || "بدون عنوان";
  const type = playerItem.type ?? "movie";

  // No imdbID — show informative message
  if (!imdbID) {
    return (
      <Dialog open={!!playerItem} onOpenChange={(v) => !v && setPlayerItem(null)}>
        <DialogContent className="max-w-md w-[92vw] p-6 gap-0">
          <DialogTitle className="sr-only">پخش آنلاین</DialogTitle>
          <div className="text-center">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-2">
              پخش آنلاین در دسترس نیست
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              این اثر در منبع فعلی شناسه‌ی IMDb نداره. فقط آثار موجود در
              آرشیو IMDb قابل پخش آنلاین هستن. می‌تونید روی منابع دیگه امتحان کنید
              یا از لینک‌های دانلود استفاده کنید.
            </p>
            <Button variant="secondary" onClick={() => setPlayerItem(null)}>
              بستن
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentSource = STREAMING_SOURCES[activeSource];
  const streamUrl = currentSource.buildUrl(imdbID, type, quality);

  return (
    <Dialog open={!!playerItem} onOpenChange={(v) => !v && setPlayerItem(null)}>
      <DialogContent
        className="max-w-5xl w-[95vw] p-0 gap-0 overflow-hidden bg-background border-border/40"
        aria-describedby="player-modal-desc"
      >
        <DialogTitle className="sr-only">پخش آنلاین {title}</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between gap-2 p-3 border-b border-border/40">
          <div className="flex items-center gap-2 min-w-0">
            <Play className="h-5 w-5 text-primary shrink-0" />
            <h2 className="text-base font-bold text-foreground truncate">
              {title}
            </h2>
            {playerItem.year && (
              <span className="text-xs text-muted-foreground shrink-0">
                ({playerItem.year})
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setPlayerItem(null)}
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Source switcher + Quality selector */}
        <div className="flex items-center gap-3 px-3 py-2 border-b border-border/40 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Server className="h-3 w-3" />
              منبع:
            </span>
            {STREAMING_SOURCES.map((source, i) => (
              <button
                key={source.id}
                onClick={() => {
                  setActiveSource(i);
                  setLoading(true);
                  setHasError(false);
                }}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-colors shrink-0",
                  i === activeSource
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 hover:bg-secondary text-foreground"
                )}
              >
                {source.name}
              </button>
            ))}
          </div>
          {currentSource.supportsQuality && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">کیفیت:</span>
              <div className="relative">
                <select
                  value={quality}
                  onChange={(e) => {
                    setQuality(e.target.value);
                    setLoading(true);
                    setHasError(false);
                  }}
                  className="appearance-none bg-secondary/60 hover:bg-secondary text-foreground text-xs font-medium pr-7 pl-2 py-1 rounded-md border border-border/40 cursor-pointer focus-brand"
                >
                  {QUALITIES.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Player iframe */}
        <div className="relative bg-black aspect-video">
          {loading && !hasError && (
            <div className="absolute inset-0 grid place-items-center bg-black/80">
              <div className="text-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-3" />
                <p className="text-sm text-foreground/80">
                  در حال بارگذاری منبع {currentSource.name}…
                </p>
                <p className="text-xs text-foreground/60 mt-1">
                  اگر بیش از ۱۰ ثانیه طول کشید، منبع دیگه‌ای امتحان کنید
                </p>
              </div>
            </div>
          )}
          {hasError && (
            <div className="absolute inset-0 grid place-items-center bg-black/80">
              <div className="text-center px-4">
                <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                <p className="text-sm text-foreground/90 mb-2">
                  بارگذاری منبع ناموفق بود.
                </p>
                <p className="text-xs text-foreground/60 mb-4 max-w-md">
                  ممکن است این منبع در حال حاضر در دسترس نباشه. یک منبع دیگه
                  امتحان کنید یا از لینک‌های دانلود استفاده کنید.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setActiveSource((prev) => (prev + 1) % STREAMING_SOURCES.length);
                    setLoading(true);
                    setHasError(false);
                  }}
                >
                  منبع بعدی
                </Button>
              </div>
            </div>
          )}
          <iframe
            key={currentSource.id}
            src={streamUrl}
            className="absolute inset-0 h-full w-full"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            referrerPolicy="origin"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setHasError(true);
            }}
            title={`${title} — ${currentSource.name}`}
          />
        </div>

        {/* Footer — subtitle links */}
        <div className="p-3 border-t border-border/40">
          <div className="flex items-center gap-2 mb-2">
            <Subtitles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              زیرنویس فارسی و کردی
            </span>
            <Badge variant="secondary" className="text-[10px]">
              {playerItem.imdbID}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            روی هر منبع کلیک کنید تا به سایت مربوطه برید و زیرنویس فارسی یا
            کردی رو دانلود کنید. بعد از دانلود، فایل زیرنویس رو کنار فیلم
            قرار بدید تا پلیر شما خودکار اون رو نشون بده.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {SUBTITLE_SOURCES.map((source) => (
              <a
                key={source.id}
                href={source.url(title)}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium",
                  "bg-secondary/60 hover:bg-secondary border border-border/40",
                  "transition-colors focus-brand"
                )}
              >
                <Subtitles className="h-3 w-3 text-primary" />
                <span>{source.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  ({source.langs.join("، ")})
                </span>
              </a>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
