# Zmovie — پلتفرم فیلم و سریال

پلتفرم تماشای آنلاین فیلم و سریال با تجربه‌ای مدرن و حرفه‌ای. پشتیبانی از زیرنویس فارسی و کردی.

## ✨ ویژگی‌ها

- 🎬 تماشای آنلاین فیلم و سریال (با 2Embed, MultiEmbed, VidSrc)
- 🌐 زیرنویس فارسی و کردی (SubtitleCat, OpenSubtitles, YIFY)
- 📺 لیست قسمت‌ها برای سریال‌ها (با TMDB season API)
- ⭐ صفحه‌ی اختصاصی برای هر ستاره با filmography کامل
- 🎭 جستجوی پیشرفته با TMDB API
- 🎥 انتخاب کیفیت پخش (480p, 720p, 1080p)
- 📱 نصب روی آیفون/آیپد (PWA — Add to Home Screen)
- 🚀 لودینگ اسکرین با Z قرمز
- 🌙 تم تیره‌ی سینمایی

## 🚀 Deploy روی GitHub Pages

این پروژه به‌صورت **static export** طراحی شده تا روی GitHub Pages به‌صورت رایگان deploy بشه.

### مرحله‌ی ۱: آماده‌سازی Repository

1. وارد GitHub بشید
2. یک repository جدید بسازید (اگه می‌خواید root URL داشته باشید، اسمش رو `username.github.io` بذارید)
3. کد پروژه رو push کنید:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO-NAME.git
   git push -u origin main
   ```

### مرحله‌ی ۲: تنظیم GitHub Secrets

1. وارد repository بشید → **Settings** → **Secrets and variables** → **Actions**
2. روی **New repository secret** کلیک کنید و این‌ها رو اضافه کنید:

   | نام Secret | مقدار |
   |------------|-------|
   | `NEXT_PUBLIC_TMDB_API_KEY` | `7002cc3c7359bcbecc0ff8317e3e820a` (یا API key خودتون) |
   | `NEXT_PUBLIC_TMDB_API_READ_TOKEN` | `eyJhbGciOiJIUzI1NiJ9...` (یا Read Access Token خودتون) |

   برای گرفتن API key رایگان از TMDB:
   1. به https://www.themoviedb.org/signup برید و ثبت‌نام کنید
   2. به https://www.themoviedb.org/settings/api برید
   3. روی «Request API Key» کلیک کنید → نوع «Developer»
   4. فرم رو پر کنید → API Key و API Read Access Token رو کپی کنید

### مرحله‌ی ۳: فعال‌سازی GitHub Pages

1. وارد repository بشید → **Settings** → **Pages**
2. در بخش **Build and deployment**:
   - **Source**: GitHub Actions
3. حالا هر بار push کنید به main، GitHub Actions خودکار build و deploy می‌کنه

### مرحله‌ی ۴: دریافت آدرس

بعد از اولین deploy موفق، آدرس شما یکی از موارد زیر خواهد بود:
- اگه repo name = `username.github.io`: → `https://username.github.io/`
- در غیر این‌صورت: → `https://username.github.io/REPO-NAME/`

## 📋 توسعه محلی (Local Development)

```bash
# نصب dependencies
bun install

# اجرای dev server
bun run dev

# build static export
bun run build

# خروجی در فولدر out/ ساخته می‌شه
```

## 🛠️ Stack تکنولوژی

- **Framework**: Next.js 16 (static export)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State Management**: Zustand (client) + TanStack Query (server)
- **Fonts**: Vazirmatn (Persian) + Geist
- **Animations**: Framer Motion
- **API**: TMDB (رایگان)
- **Streaming**: 2Embed, MultiEmbed, VidSrc
- **Subtitles**: SubtitleCat, OpenSubtitles, YIFY

## 📦 Deploy روی هاست‌های دیگه (cPanel، Cloudflare Pages و...)

فایل‌های فولدر `out/` (بعد از `bun run build`) رو در هر هاست static آپلود کنید.

## 🔐 امنیت

- تمام TMDB API keys در `NEXT_PUBLIC_*` هستند (در client bundle قرار می‌گیرن)
- چون TMDB رایگان و rate-limited هست، این مشکلی نداره
- اگه می‌خواید token رو مخفی نگه دارید، باید از server-side (Vercel یا similar) استفاده کنید

## 📄 لایسنس

استفاده‌ی شخصی — رایگان

## 🎯 برای آینده

- [ ] Service Worker برای کارکرد آفلاین جزئی
- [ ] Push notifications
- [ ] Splash screen اختصاصی برای هر مدل iPhone
- [ ] بخش پخش زنده تلویزیون
- [ ] صفحه‌ی اختصاصی هر ژانر
