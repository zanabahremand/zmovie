"use client";

import { X, Sparkles, Shield, Film, Tv, Star, KeyRound, ExternalLink, CheckCircle2, Smartphone, Share } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useZmovieStore } from "@/lib/store";
import { BrandMark } from "./BrandMark";

/** About modal — brand info + PWA installation guide + TMDB setup. */
export function AboutModal() {
  const open = useZmovieStore((s) => s.aboutOpen);
  const setOpen = useZmovieStore((s) => s.setAboutOpen);
  const watchlist = useZmovieStore((s) => s.watchlist);
  const history = useZmovieStore((s) => s.history);
  const clearHistory = useZmovieStore((s) => s.clearHistory);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md w-[92vw] p-0 gap-0 overflow-hidden bg-background border-border/40">
        <div className="relative">
          {/* Top accent */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent pointer-events-none" />

          <div className="relative p-5 max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-start gap-3 mb-5">
              <div className="flex-1">
                <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <BrandMark className="text-base" />
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  پلتفرم آنلاین فیلم و سریال
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-1 shrink-0"
                onClick={() => setOpen(false)}
                aria-label="بستن"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <div className="rounded-lg bg-secondary/60 p-3 ring-1 ring-border/30">
                <p className="text-xs text-muted-foreground">لیست تماشا</p>
                <p className="text-xl font-bold text-foreground">
                  {watchlist.length}
                </p>
              </div>
              <div className="rounded-lg bg-secondary/60 p-3 ring-1 ring-border/30">
                <p className="text-xs text-muted-foreground">تاریخچه</p>
                <p className="text-xl font-bold text-foreground">
                  {history.length}
                </p>
              </div>
            </div>

            {/* Features list */}
            <div className="space-y-2 mb-5">
              {[
                {
                  icon: <Film className="h-4 w-4" />,
                  text: "هزاران فیلم و سریال با پوستر و جزئیات کامل",
                },
                {
                  icon: <Tv className="h-4 w-4" />,
                  text: "دسته‌بندی بر اساس ژانر و تازه‌ترین‌ها",
                },
                {
                  icon: <Star className="h-4 w-4" />,
                  text: "امتیازدهی و اطلاعات کامل بازیگران",
                },
                {
                  icon: <Shield className="h-4 w-4" />,
                  text: "لیست تماشا و تاریخچه‌ی شخصی شما روی همین دستگاه",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-2.5 rounded-md bg-secondary/40 hover:bg-secondary/70 transition-colors"
                >
                  <span className="grid place-items-center h-7 w-7 rounded-md bg-primary/15 text-primary shrink-0">
                    {f.icon}
                  </span>
                  <p className="text-sm text-foreground/85 leading-relaxed flex-1">
                    {f.text}
                  </p>
                </div>
              ))}
            </div>

            {/* iOS / Add to Home Screen section */}
            <div className="mb-5 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-bold text-foreground">
                  نصب روی آیفون / آیپد
                </h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Zmovie رو می‌تونید مثل یک اپلیکیشن واقعی روی آیفون یا آیپد نصب
                کنید:
              </p>
              <ol className="text-xs text-foreground/80 space-y-1.5 mb-3 list-decimal list-inside leading-relaxed">
                <li>در مرورگر Safari این صفحه رو باز کنید</li>
                <li>
                  روی دکمه‌ی{" "}
                  <span className="inline-flex items-center gap-0.5 font-semibold text-primary">
                    Share
                    <Share className="h-3 w-3 inline" />
                  </span>{" "}
                  پایین صفحه بزنید
                </li>
                <li>گزینه‌ی «Add to Home Screen» رو انتخاب کنید</li>
                <li>روی «Add» بزنید — همین!</li>
              </ol>
              <p className="text-xs text-muted-foreground leading-relaxed">
                حالا Zmovie با آیکون خودش روی صفحه‌ی اصلی آیفون شماست و مثل یک
                اپ معمولی باز می‌شه (بدون نوار مرورگر، تمام صفحه).
              </p>
            </div>

            {/* TMDB setup section */}
            <div className="mb-5 p-4 rounded-lg bg-secondary/40 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-bold text-foreground">
                  فعال‌سازی داده‌ی غنی (اختیاری)
                </h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                برای دسترسی به داده‌های کامل‌تر (عکس‌های با کیفیت، تریلرها،
                فیلم‌شناسی کامل هر ستاره)، می‌تونید TMDB API رایگان رو فعال کنید:
              </p>
              <ol className="text-xs text-foreground/80 space-y-1.5 mb-3 list-decimal list-inside leading-relaxed">
                <li>
                  در{" "}
                  <a
                    href="https://www.themoviedb.org/signup"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-0.5"
                  >
                    themoviedb.org
                    <ExternalLink className="h-3 w-3 inline" />
                  </a>{" "}
                  ثبت‌نام کنید (رایگان)
                </li>
                <li>از تنظیمات → API یک API key رایگان بگیرید</li>
                <li>
                  فایل <code className="px-1 py-0.5 rounded bg-secondary text-primary text-[10px]">.env</code> را ویرایش و خط زیر را اضافه کنید:
                </li>
              </ol>
              <div className="bg-background/60 rounded-md p-2 mb-3 font-mono text-[10px] text-foreground/80" dir="ltr">
                TMDB_API_KEY=your_api_key_here
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                بدون TMDB هم برنامه با داده‌های OMDb کار می‌کنه.
              </p>
            </div>

            {/* Clear history */}
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full mb-4"
                onClick={() => clearHistory()}
              >
                پاک کردن تاریخچه
              </Button>
            )}

            {/* Badges */}
            <div className="pt-4 border-t border-border/40 flex items-center justify-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-[10px]">
                <Sparkles className="h-3 w-3 mr-1" />
                نسخه 1.0
              </Badge>
              <Badge variant="outline" className="text-[10px] border-border/60">
                رایگان
              </Badge>
              <Badge variant="outline" className="text-[10px] border-border/60 inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                آماده‌ی TMDB
              </Badge>
              <Badge variant="outline" className="text-[10px] border-border/60 inline-flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                PWA
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
