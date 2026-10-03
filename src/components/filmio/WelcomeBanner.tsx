"use client";

import { motion } from "framer-motion";
import { Sparkles, Film, Tv, Search, Star } from "lucide-react";
import { BrandMark } from "./BrandMark";

/**
 * Welcome banner — shown when data is still loading or in initial state.
 * No token references; pure brand experience.
 */
export function WelcomeBanner() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative h-[85vh] min-h-[600px] w-full overflow-hidden"
    >
      {/* Cinematic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-background">
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_25%_25%,hsl(var(--primary)/0.35),transparent_50%),radial-gradient(circle_at_75%_60%,hsl(var(--primary)/0.25),transparent_50%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(hsl(var(--primary)/0.4)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.4)_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto">
        <div className="mb-8">
          <BrandMark className="text-3xl" />
        </div>

        <motion.div
          initial={{ scale: 0.92 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid place-items-center h-20 w-20 rounded-2xl bg-primary/15 text-primary mb-6 shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.5)]"
        >
          <Sparkles className="h-10 w-10" />
        </motion.div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 tracking-tight">
          به <span className="text-primary brand-glow">زدمووی</span> خوش آمدی
        </h1>

        <p className="text-sm sm:text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl">
          هزاران فیلم و سریال را با تجربه‌ای مدرن و حرفه‌ای زدمووی کن. جستجو
          کن، لیست دلخواه بساز و جزئیات کامل هر اثر را ببین.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 max-w-2xl">
          {[
            { icon: <Film className="h-4 w-4" />, label: "فیلم‌ها" },
            { icon: <Tv className="h-4 w-4" />, label: "سریال‌ها" },
            { icon: <Search className="h-4 w-4" />, label: "جستجوی هوشمند" },
            { icon: <Star className="h-4 w-4" />, label: "امتیاز و اطلاعات" },
          ].map((f, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/60 backdrop-blur border border-border/40 text-sm font-medium text-foreground"
            >
              <span className="text-primary">{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground"
        >
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          در حال بارگذاری محتوا…
        </motion.div>
      </div>
    </motion.section>
  );
}

/**
 * Error banner — shown when content can't be loaded.
 * Friendly, no implementation details exposed.
 */
export function ErrorBanner({ onRetry }: { onRetry?: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative h-[60vh] min-h-[400px] w-full overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-destructive/20 via-background to-background" />

      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto">
        <div className="mb-6">
          <BrandMark className="text-2xl" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          محتوا در حال حاضر در دسترس نیست
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md leading-relaxed">
          لطفاً چند لحظه دیگر تلاش کنید. اگر مشکل ادامه داشت، ممکن است سرویس
          موقتاً در حال به‌روزرسانی باشد.
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors focus-brand"
          >
            تلاش دوباره
          </button>
        )}
      </div>
    </motion.section>
  );
}
