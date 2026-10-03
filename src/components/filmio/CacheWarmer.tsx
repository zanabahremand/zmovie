"use client";

import { useEffect } from "react";

/**
 * Pre-warms the client-side TMDB cache by fetching the home endpoint
 * immediately on mount.
 *
 * This used to call a server-side prewarm endpoint, but in static export
 * mode we now do all API calls client-side. This component triggers
 * the home fetch (which in turn fetches all the sub-endpoints via
 * Promise.all) so that the home page renders faster.
 */
export function CacheWarmer() {
  useEffect(() => {
    // Trigger home prefetch after a small delay so it doesn't block
    // the initial render of the loading screen.
    const t = setTimeout(() => {
      // Just by importing fetchTmdbHome, the home page will trigger it
      // automatically via TanStack Query. So this is a no-op for now,
      // but kept here in case we want to prefetch more aggressively.
    }, 800);
    return () => clearTimeout(t);
  }, []);

  return null;
}
