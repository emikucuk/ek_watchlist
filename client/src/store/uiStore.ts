import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  viewMode: "grid" | "list";
  mediaFilters: string[];
  statusFilters: string[];
  genreFilters: string[];
  setViewMode: (mode: "grid" | "list") => void;
  setMediaFilters: (value: string[]) => void;
  setStatusFilters: (value: string[]) => void;
  setGenreFilters: (value: string[]) => void;
  clearFilters: () => void;
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      viewMode: "grid",
      mediaFilters: [],
      statusFilters: [],
      genreFilters: [],
      setViewMode: (viewMode) => set({ viewMode }),
      setMediaFilters: (mediaFilters) => set({ mediaFilters }),
      setStatusFilters: (statusFilters) => set({ statusFilters }),
      setGenreFilters: (genreFilters) => set({ genreFilters }),
      clearFilters: () =>
        set({ mediaFilters: [], statusFilters: [], genreFilters: [] }),
    }),
    {
      name: "ek-watchlist-ui-v2",
      version: 2,
    }
  )
);

export { toggleValue };
