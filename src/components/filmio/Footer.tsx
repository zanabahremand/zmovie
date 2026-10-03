"use client";

import { Bookmark, Clock, Film, Tv, Star } from "lucide-react";
import { BrandMark } from "./BrandMark";

/** Footer — sticky to bottom with brand info and feature highlights. */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <BrandMark className="text-lg" />
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              پلتفرم زدموویی آنلاین فیلم و سریال. تجربه‌ای مدرن و حرفه‌ای برای
              علاقه‌مندان سینما.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              امکانات
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="inline-flex items-center gap-1.5">
                <Film className="h-3 w-3" /> هزاران فیلم
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Tv className="h-3 w-3" /> سریال‌های روز
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Star className="h-3 w-3" /> امتیاز و اطلاعات کامل
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Bookmark className="h-3 w-3" /> لیست زدموویی شخصی
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> تاریخچه‌ی زدمووی
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              درباره زدمووی
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              زدمووی یک پلتفرم نمایش فیلم و سریال با تجربه‌ای شبیه به سرویس‌های
              جهانی است. در حال توسعه‌ی مداوم و افزودن امکانات جدید هستیم.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} زدمووی — تمامی حقوق محفوظ است.
          </p>
          <p className="text-xs text-muted-foreground">
            ساخته‌شده با ❤️ برای علاقه‌مندان سینما
          </p>
        </div>
      </div>
    </footer>
  );
}
