import type { Metadata, Viewport } from "next";
import { Geist, Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

// Vazirmatn is a high-quality Persian/Latin mixed-script font — perfect for Zmovie
const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zmovie — پلتفرم فیلم و سریال",
  description:
    "Zmovie: تماشای آنلاین فیلم و سریال با تجربه‌ای مدرن و حرفه‌ای. پشتیبانی از زیرنویس فارسی و کردی.",
  keywords: [
    "Zmovie",
    "زدمووی",
    "فیلم",
    "سریال",
    "دانلود فیلم",
    "تماشای آنلاین",
    "سینما",
  ],
  authors: [{ name: "Zmovie" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon-32.png"],
  },
  appleWebApp: {
    capable: true,
    title: "Zmovie",
    statusBarStyle: "black-translucent",
    startupImage: ["/icons/apple-touch-icon.png"],
  },
  openGraph: {
    title: "Zmovie",
    description: "پلتفرم آنلاین فیلم و سریال",
    siteName: "Zmovie",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zmovie",
    description: "پلتفرم آنلاین فیلم و سریال",
  },
};

export const viewport: Viewport = {
  themeColor: "#E50914",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

const loadingScreenStyle = `
  #zmovie-loading {
    position: fixed;
    inset: 0;
    background: #0a0a0a;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    transition: opacity 0.4s ease-out, visibility 0.4s ease-out;
  }
  #zmovie-loading.is-hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }
  .zmovie-loading-logo {
    width: 80px;
    height: 80px;
    border-radius: 18px;
    background: linear-gradient(135deg, #E50914 0%, #B20710 100%);
    color: white;
    display: grid;
    place-items: center;
    font-size: 56px;
    font-weight: 900;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    letter-spacing: -0.04em;
    box-shadow:
      0 8px 32px -8px rgba(229, 9, 20, 0.7),
      0 0 0 1px rgba(229, 9, 20, 0.3) inset;
    animation: zmovie-pulse 1.6s ease-in-out infinite;
  }
  .zmovie-loading-text {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.02em;
  }
  .zmovie-loading-text .red {
    color: #E50914;
  }
  .zmovie-loading-bar {
    width: 120px;
    height: 3px;
    border-radius: 3px;
    background: rgba(229, 9, 20, 0.2);
    overflow: hidden;
    position: relative;
  }
  .zmovie-loading-bar::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, #E50914, transparent);
    width: 40%;
    animation: zmovie-slide 1.2s ease-in-out infinite;
  }
  @keyframes zmovie-pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 8px 32px -8px rgba(229, 9, 20, 0.7), 0 0 0 1px rgba(229, 9, 20, 0.3) inset; }
    50% { transform: scale(1.06); box-shadow: 0 12px 40px -8px rgba(229, 9, 20, 0.9), 0 0 0 1px rgba(229, 9, 20, 0.5) inset; }
  }
  @keyframes zmovie-slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(300%); }
  }
  @media (prefers-color-scheme: dark) {
    #zmovie-loading { background: #0a0a0a; }
  }
`;

const loadingScript = `
  // Hide loading screen on page show (initial load) and after small delay
  // for hydration. We don't wait for window.load — that's too late for UX.
  window.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      var el = document.getElementById('zmovie-loading');
      if (el) {
        el.classList.add('is-hidden');
        // Remove from DOM after animation completes
        setTimeout(function() {
          if (el && el.parentNode) el.parentNode.removeChild(el);
        }, 500);
      }
    }, 600);
  });
  // Fallback: hide after 3s no matter what
  setTimeout(function() {
    var el = document.getElementById('zmovie-loading');
    if (el) {
      el.classList.add('is-hidden');
      setTimeout(function() {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }, 500);
    }
  }, 3000);
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: loadingScreenStyle }} />
        <meta name="application-name" content="Zmovie" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Zmovie" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple" content="app-id=zmovie" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-startup-image" href="/icons/apple-touch-icon.png" />
      </head>
      <body
        className={`${vazirmatn.variable} ${geistSans.variable} font-sans antialiased bg-background text-foreground`}
      >
        {/* Initial loading screen — shown before React hydration */}
        <div id="zmovie-loading" aria-hidden="true">
          <div className="zmovie-loading-logo">Z</div>
          <div className="zmovie-loading-text">
            <span className="red">Z</span>movie
          </div>
          <div className="zmovie-loading-bar" />
        </div>
        <script dangerouslySetInnerHTML={{ __html: loadingScript }} />
        <Providers>
          {children}
          <Toaster />
          <Sonner position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
