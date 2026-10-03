"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** A media item reference stored locally — used in watchlist + history. */
interface MediaItem {
  id: number;
  title: string;
  poster?: string;
  type?: "movie" | "serie";
  year?: string | number;
  imdbID?: string; // preserved for streaming embeds + subtitle search
}

interface ZmovieState {
  /** Local watchlist — saved in localStorage. */
  watchlist: MediaItem[];
  addToWatchlist: (item: MediaItem) => void;
  removeFromWatchlist: (id: number) => void;
  isInWatchlist: (id: number) => boolean;
  toggleWatchlist: (item: MediaItem) => void;

  /** Recently viewed items. */
  history: MediaItem[];
  addToHistory: (item: MediaItem) => void;
  clearHistory: () => void;

  /** Active media id (controls the detail modal). */
  activeId: number | null;
  setActiveId: (id: number | null) => void;

  /** Active TMDB id (when the active item is a TMDB source). */
  activeTmdbId: number | null;
  setActiveTmdbId: (id: number | null) => void;

  /** Search overlay visibility. */
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  /** Info/about modal visibility. */
  aboutOpen: boolean;
  setAboutOpen: (open: boolean) => void;

  /** Stars (popular actors) modal visibility. */
  starsOpen: boolean;
  setStarsOpen: (open: boolean) => void;

  /** Active star id (controls the star detail modal). */
  activeStarId: number | null;
  setActiveStarId: (id: number | null) => void;
  setStarId: (id: number | null) => void; // alias for setActiveStarId

  /** Player modal — when set, opens PlayerModal with the given item. */
  playerItem: MediaItem | null;
  setPlayerItem: (item: MediaItem | null) => void;

  /** Active genre filter (null = all). */
  genreFilter: number | null;
  setGenreFilter: (id: number | null) => void;
}

export const useZmovieStore = create<ZmovieState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      addToWatchlist: (item) => {
        const exists = get().watchlist.some((w) => w.id === item.id);
        if (exists) return;
        set({ watchlist: [...get().watchlist, item] });
      },
      removeFromWatchlist: (id) =>
        set({ watchlist: get().watchlist.filter((w) => w.id !== id) }),
      isInWatchlist: (id) => get().watchlist.some((w) => w.id === id),
      toggleWatchlist: (item) => {
        const exists = get().watchlist.some((w) => w.id === item.id);
        if (exists) {
          set({ watchlist: get().watchlist.filter((w) => w.id !== item.id) });
        } else {
          set({ watchlist: [...get().watchlist, item] });
        }
      },

      history: [],
      addToHistory: (item) => {
        const filtered = get().history.filter((h) => h.id !== item.id);
        set({ history: [item, ...filtered].slice(0, 24) });
      },
      clearHistory: () => set({ history: [] }),

      activeId: null,
      setActiveId: (id) => set({ activeId: id }),

      activeTmdbId: null,
      setActiveTmdbId: (id) => set({ activeTmdbId: id }),

      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),

      aboutOpen: false,
      setAboutOpen: (open) => set({ aboutOpen: open }),

      starsOpen: false,
      setStarsOpen: (open) => set({ starsOpen: open }),

      activeStarId: null,
      setActiveStarId: (id) => set({ activeStarId: id }),
      setStarId: (id) => set({ activeStarId: id }),

      playerItem: null,
      setPlayerItem: (item) => set({ playerItem: item }),

      genreFilter: null,
      setGenreFilter: (id) => set({ genreFilter: id }),
    }),
    {
      name: "zmovie-store",
      partialize: (state) => ({
        watchlist: state.watchlist,
        history: state.history,
      }),
    }
  )
);
