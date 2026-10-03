"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bookmark, Bell, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "./BrandMark";
import { useZmovieStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Navigation tabs in the navbar — premium streaming-service style. */
const NAV_TABS = [
  { id: "home", label: "خانه" },
  { id: "movies", label: "فیلم‌ها" },
  { id: "series", label: "سریال‌ها" },
  { id: "newest", label: "تازه‌ها" },
  { id: "watchlist", label: "لیست من" },
];

export function Navbar({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const setSearchOpen = useZmovieStore((s) => s.setSearchOpen);
  const setAboutOpen = useZmovieStore((s) => s.setAboutOpen);
  const setStarsOpen = useZmovieStore((s) => s.setStarsOpen);
  const watchlistCount = useZmovieStore((s) => s.watchlist.length);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-[0_4px_24px_-8px_hsl(0_0%_0%/0.4)] border-b border-border/40"
          : "bg-gradient-to-b from-black/70 via-black/30 to-transparent"
      )}
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <nav className="flex h-16 items-center justify-between gap-4">
          {/* Left: brand + nav tabs (desktop) */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onTabChange("home")}
              className="focus-brand rounded-md"
              aria-label="زدمووی - خانه"
            >
              <BrandMark />
            </button>
            <ul className="hidden lg:flex items-center gap-1">
              {NAV_TABS.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      "hover:bg-primary/10 hover:text-primary focus-brand",
                      activeTab === tab.id
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-foreground/80"
                    )}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-primary focus-brand"
              onClick={() => setSearchOpen(true)}
              aria-label="جستجو"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-primary focus-brand"
              onClick={() => setStarsOpen(true)}
              aria-label="ستاره‌های محبوب"
            >
              <Star className="h-5 w-5" />
            </Button>

            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onTabChange("watchlist");
              }}
              className="hidden sm:flex relative p-2 rounded-md text-foreground hover:text-primary hover:bg-primary/10 transition-colors focus-brand"
              aria-label="لیست زدمووی"
            >
              <Bookmark className="h-5 w-5" />
              {watchlistCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-5 min-w-5 px-1 grid place-items-center text-[10px] bg-primary text-primary-foreground"
                >
                  {watchlistCount}
                </Badge>
              )}
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex text-foreground hover:text-primary focus-brand"
              aria-label="اعلان‌ها"
            >
              <Bell className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-primary focus-brand"
              onClick={() => setAboutOpen(true)}
              aria-label="درباره"
            >
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </nav>

        {/* Mobile tab strip — scrollable */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "shrink-0 px-3 py-1 rounded-md text-xs font-medium transition-colors",
                activeTab === tab.id
                  ? "text-primary font-semibold bg-primary/10"
                  : "text-foreground/70 hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
