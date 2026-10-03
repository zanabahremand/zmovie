"use client";

import { useEffect, useState } from "react";
import {
  X,
  Play,
  Star,
  Calendar,
  Clock,
  Download,
  Bookmark,
  Check,
  Share2,
  Film,
  Tv,
  ExternalLink,
  Subtitles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDetails, useEpisodes } from "@/hooks/use-majidapi";
import { useZmovieStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { EpisodeList } from "./EpisodeList";

/** Subtitle sources — Persian + Kurdish (and others). */
const SUBTITLE_SOURCES = (title: string) => [
  {
    name: "SubtitleCat",
    url: `https://www.subtitlecat.com/index.php?search=${encodeURIComponent(title)}`,
    langs: ["فارسی", "کردی", "انگلیسی"],
  },
  {
    name: "OpenSubtitles",
    url: `https://www.opensubtitles.org/en/search2/moviename-${encodeURIComponent(title)}`,
    langs: ["فارسی", "کردی", "انگلیسی"],
  },
  {
    name: "YIFY Subtitles",
    url: `https://yifysubtitles.org/search?q=${encodeURIComponent(title)}`,
    langs: ["فارسی", "انگلیسی"],
  },
];

/** Hash an imdbID string to a numeric id (so episodes can be tracked). */
function hashImdbIdNum(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) + 1;
}

/** Full modal showing movie/serie details, cast, screenshots, and download links. */
export function DetailModal() {
  const activeId = useZmovieStore((s) => s.activeId);
  const activeTmdbId = useZmovieStore((s) => s.activeTmdbId);
  const setActiveId = useZmovieStore((s) => s.setActiveId);
  const addToHistory = useZmovieStore((s) => s.addToHistory);
  const setPlayerItem = useZmovieStore((s) => s.setPlayerItem);

  // Try to infer type from watchlist/history
  const knownItem = useZmovieStore((s) =>
    [...s.watchlist, ...s.history].find((w) => w.id === activeId)
  );
  const type = knownItem?.type ?? null;

  const { data, isLoading, isError, error } = useDetails(activeId, type, activeTmdbId);

  useEffect(() => {
    if (data && activeId) {
      addToHistory({
        id: activeId,
        title: data.title || "بدون عنوان",
        poster: data.poster,
        type: data.type,
        year: data.year,
        imdbID: data.imdbID,
      });
    }
  }, [data, activeId, addToHistory]);

  return (
    <Dialog
      open={activeId !== null}
      onOpenChange={(v) => !v && setActiveId(null)}
    >
      <DialogContent
        className="max-w-5xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden bg-background border-border/40"
        aria-describedby="detail-modal-desc"
      >
        <DialogTitle className="sr-only">جزئیات اثر</DialogTitle>
        <ScrollArea className="h-full w-full">
          {isLoading ? (
            <DetailSkeleton />
          ) : isError ? (
            <DetailError msg={(error as Error).message} />
          ) : data ? (
            <DetailContent
              data={data}
              onPlay={(item) =>
                setPlayerItem({
                  id: item.id,
                  title: item.title,
                  poster: item.poster,
                  type: item.type,
                  year: item.year,
                  imdbID: item.imdbID,
                })
              }
            />
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function DetailContent({
  data,
  onPlay,
}: {
  data: NonNullable<ReturnType<typeof useDetails>["data"]>;
  onPlay: (item: {
    id: number;
    title: string;
    poster?: string;
    type?: "movie" | "serie";
    year?: string | number;
    imdbID?: string;
  }) => void;
}) {
  const toggleWatchlist = useZmovieStore((s) => s.toggleWatchlist);
  const isInWatchlist = useZmovieStore((s) =>
    s.watchlist.some((w) => w.id === (data.id ?? 0))
  );

  const poster = data.poster ?? data.thumbnail;
  const rate = data.rate ?? data.imdb;
  const year = data.year;
  const genres = Array.isArray(data.genres) ? data.genres : [];
  const cast = Array.isArray(data.cast)
    ? data.cast.map((c) => c.name).filter(Boolean)
    : [];
  const description = data.description ?? "";
  const director = data.director;
  const duration = data.duration ?? data.time;
  const country = Array.isArray(data.countries)
    ? data.countries.map((c) => c.name).filter(Boolean).join("، ")
    : "";
  const downloadLinks = data.downloadLinks ?? [];
  const videos = data.videos ?? [];
  const imdbID = data.imdbID;
  const [activeTab, setActiveTab] = useState<"downloads" | "stream">(
    downloadLinks.length > 0 ? "downloads" : "stream"
  );

  const subtitles = SUBTITLE_SOURCES(data.title || "");

  return (
    <div className="relative">
      {/* Backdrop poster */}
      <div className="relative h-[40vh] sm:h-[50vh] w-full overflow-hidden">
        {poster ? (
          <img
            src={poster}
            alt={data.title}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/30 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        <div className="absolute -top-20 right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

        {/* Title overlay */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 left-4 sm:left-6">
          <Badge className="mb-2 bg-primary text-primary-foreground shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.7)]">
            {data.type === "serie" ? (
              <span className="inline-flex items-center gap-1">
                <Tv className="h-3 w-3" /> سریال
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Film className="h-3 w-3" /> فیلم
              </span>
            )}
          </Badge>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground drop-shadow-[0_2px_20px_rgba(0,0,0,0.7)]">
            {data.title || "بدون عنوان"}
          </h2>
          {data.persianTitle && data.persianTitle !== data.title && (
            <p className="text-sm sm:text-base text-foreground/70 mt-1">
              {data.persianTitle}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 sm:px-6 lg:px-8 pb-12 -mt-8 relative">
        {/* Action bar — PLAY ONLINE is the primary CTA */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.6)] hover:scale-105 transition-transform"
            onClick={() =>
              onPlay({
                id: data.id ?? 0,
                title: data.title || "",
                poster: data.poster,
                type: data.type,
                year: data.year,
                imdbID,
              })
            }
          >
            <Play className="h-5 w-5 fill-current" />
            پخش آنلاین
          </Button>

          {downloadLinks[0]?.url && (
            <a
              href={downloadLinks[0].url || "#"}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold",
                "bg-foreground/15 backdrop-blur text-foreground hover:bg-foreground/25",
                "border border-foreground/10 hover:scale-105 transition-transform"
              )}
            >
              <Download className="h-4 w-4" />
              دانلود
            </a>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              toggleWatchlist({
                id: data.id ?? 0,
                title: data.title || "",
                poster: data.poster,
                type: data.type,
                year: data.year,
                imdbID,
              })
            }
            className="bg-foreground/10 hover:bg-foreground/20"
          >
            {isInWatchlist ? (
              <Check className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            {isInWatchlist ? "افزوده شد" : "افزودن به لیست"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (navigator.share) {
                navigator
                  .share({ title: data.title, text: data.title })
                  .catch(() => {});
              } else if (navigator.clipboard) {
                navigator.clipboard.writeText(data.title || "");
              }
            }}
            className="hover:bg-foreground/10"
          >
            <Share2 className="h-4 w-4" />
            اشتراک‌گذاری
          </Button>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mb-6 text-sm">
          {rate !== undefined && (
            <Meta
              label="امتیاز IMDb"
              value={`★ ${rate}`}
              icon={<Star className="h-4 w-4 text-yellow-400" />}
            />
          )}
          {year && (
            <Meta
              label="سال انتشار"
              value={String(year)}
              icon={<Calendar className="h-4 w-4" />}
            />
          )}
          {duration && (
            <Meta
              label="مدت"
              value={duration}
              icon={<Clock className="h-4 w-4" />}
            />
          )}
          {country && (
            <Meta
              label="کشور"
              value={country}
              icon={<Film className="h-4 w-4" />}
            />
          )}
          {director && (
            <Meta
              label="کارگردان"
              value={director}
              icon={<Tv className="h-4 w-4" />}
            />
          )}
          {data.quality && (
            <Meta
              label="کیفیت"
              value={data.quality}
              icon={<Film className="h-4 w-4" />}
            />
          )}
        </div>

        {/* Genres */}
        {genres.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-1.5">
            {genres.map((g, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="bg-secondary/80 border border-border/30"
              >
                {g}
              </Badge>
            ))}
          </div>
        )}

        {/* Synopsis */}
        {description && (
          <div className="mb-8">
            <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
              <span className="h-4 w-1 rounded bg-primary" />
              خلاصه داستان
            </h3>
            <p className="text-sm sm:text-base text-foreground/85 leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {/* Subtitle section — Persian + Kurdish */}
        <div className="mb-8">
          <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="h-4 w-1 rounded bg-primary" />
            <Subtitles className="h-5 w-5 text-primary" />
            زیرنویس فارسی و کردی
          </h3>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            روی هر منبع کلیک کنید تا به سایت زیرنویس برید و زیرنویس فارسی یا
            کردی رو دانلود کنید. بعد از دانلود، فایل زیرنویس رو کنار فیلم قرار
            بدید تا پلیر شما خودکار اون رو نشون بده.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {subtitles.map((source) => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium bg-secondary/60 hover:bg-secondary border border-border/40 transition-colors"
              >
                <Subtitles className="h-3 w-3 text-primary" />
                <span>{source.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  ({source.langs.join("، ")})
                </span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <div className="mb-8">
            <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="h-4 w-1 rounded bg-primary" />
              بازیگران
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {cast.slice(0, 8).map((c, i) => {
                const member = data.cast?.[i];
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-md bg-secondary/40 hover:bg-secondary/70 transition-colors"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-muted ring-1 ring-border/30">
                      {member?.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt={c}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid place-items-center h-full text-xs text-muted-foreground">
                          {c.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/85 line-clamp-1">
                      {c}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Episodes — only for series */}
        {data.type === "serie" && data.tmdb_id && (
          <div className="mb-8">
            <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="h-4 w-1 rounded bg-primary" />
              <Tv className="h-5 w-5 text-primary" />
              قسمت‌ها
            </h3>
            <EpisodeList
              tvId={data.tmdb_id}
              totalSeasons={data.totalSeasons}
              onPlayEpisode={(_episodeId, _episodeTitle) => {
                // Episodes can't currently be played in static export mode
                // (no IMDb id for the episode). Show a toast.
                // Could be enhanced later by fetching episode's external_ids
              }}
            />
          </div>
        )}

        {/* Tab switch: Downloads / Stream (only when available) */}
        {(downloadLinks.length > 0 || videos.length > 0) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setActiveTab("downloads")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === "downloads"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 hover:bg-secondary text-foreground"
                )}
              >
                <Download className="h-4 w-4 inline ml-1" />
                لینک‌های دانلود
                {downloadLinks.length > 0 && (
                  <span className="mr-1.5 text-xs opacity-80">
                    ({downloadLinks.length})
                  </span>
                )}
              </button>
              {videos.length > 0 && (
                <button
                  onClick={() => setActiveTab("stream")}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    activeTab === "stream"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60 hover:bg-secondary text-foreground"
                  )}
                >
                  <Play className="h-4 w-4 inline ml-1" />
                  پخش آنلاین
                  <span className="mr-1.5 text-xs opacity-80">
                    ({videos.length})
                  </span>
                </button>
              )}
            </div>

            {/* Downloads tab */}
            {activeTab === "downloads" && (
              <div className="space-y-2">
                {downloadLinks.length > 0 ? (
                  downloadLinks.map((dl, i) => {
                    const label =
                      dl.label || dl.quality || dl.resolution || `لینک ${i + 1}`;
                    const sizeStr = dl.size ? ` · ${dl.size}` : "";
                    return (
                      <a
                        key={i}
                        href={dl.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          "flex items-center justify-between gap-3 p-3 rounded-lg",
                          "bg-card/60 hover:bg-card border border-border/50 hover:border-primary/40",
                          "transition-all hover:translate-x-1 focus-brand group"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="grid place-items-center h-9 w-9 rounded-md bg-primary/15 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Download className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {label}
                              {sizeStr}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {dl.resolution ? `${dl.resolution}` : ""}
                              {dl.resolution && dl.label ? " · " : ""}
                              {dl.label || "لینک مستقیم"}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                      </a>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-border/60 p-6 text-center">
                    <Download className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      لینک دانلودی برای این اثر موجود نیست.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      می‌تونید از دکمه‌ی «پخش آنلاین» در بالا استفاده کنید.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Stream tab (only when videos data available — filmrail upstream) */}
            {activeTab === "stream" && videos.length > 0 && (
              <div className="space-y-2">
                {videos.map((v, i) => {
                  const label = v.label || `نسخه ${i + 1}`;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-card/60 border border-border/50 hover:border-primary/40 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="grid place-items-center h-9 w-9 rounded-md bg-primary/15 text-primary shrink-0">
                          <Play className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {label}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {v.fileType?.toUpperCase() || "MKV"}
                            {v.streamKey
                              ? ` · کلید: ${v.streamKey.slice(0, 8)}…`
                              : ""}
                          </p>
                        </div>
                      </div>
                      {v.fileUrl && v.fileUrl !== "#" ? (
                        <a
                          href={v.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          پخش
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          در حال آماده‌سازی
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Meta({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-foreground">{value}</span>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <Skeleton className="h-8 w-2/3 mb-4" />
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
      <Skeleton className="h-24 w-full mb-6" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}

function DetailError({ msg }: { msg: string }) {
  const setActiveId = useZmovieStore((s) => s.setActiveId);
  return (
    <div className="p-8 text-center">
      <p className="text-sm text-destructive mb-4 max-w-sm mx-auto">{msg}</p>
      <Button variant="secondary" size="sm" onClick={() => setActiveId(null)}>
        بستن
      </Button>
    </div>
  );
}
