/**
 * TMDB Configuration Guide
 * ========================
 *
 * زدمووی supports TMDB (The Movie Database) as an optional rich data source.
 * When configured, TMDB provides:
 *   - Higher-quality images (image.tmdb.org)
 *   - Detailed movie/series info with trailers
 *   - Cast lists with photos
 *   - Season/episode metadata
 *   - Popular people search with full filmographies
 *
 * To enable TMDB:
 * ----------------
 * 1. Register a FREE account at https://www.themoviedb.org/signup
 * 2. Visit https://www.themoviedb.org/settings/api and request an API key
 *    - Choose "Developer" use case
 *    - Fill out the form (any URL works, e.g. https://example.com)
 * 3. Copy your API Key (v3) — it looks like: 4a2c8d7e9f1b3a5c6e8d7f9a1b2c3d4e
 * 4. Add it to your .env file:
 *      TMDB_API_KEY=your_api_key_here
 * 5. (Optional) Set language to Persian for localized data:
 *      TMDB_LANG=fa-IR
 * 6. Restart the dev server:
 *      bun run dev
 *
 * Without TMDB_API_KEY, the app continues to work using OMDb as fallback.
 *
 * Note: image.tmdb.org may be slow or unreachable from Iran — in that case,
 * consider using a VPN/proxy for image URLs, or keep using OMDb/Amazon
 * images which are accessible.
 */

export const TMDB_DOCS_URL = "https://www.themoviedb.org/settings/api";
export const TMDB_SIGNUP_URL = "https://www.themoviedb.org/signup";
