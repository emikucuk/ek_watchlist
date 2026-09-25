export const MEDIA_TYPE_LABELS: Record<string, string> = {
  MOVIE: "Film",
  TV: "Dizi",
  ANIME: "Anime",
  ANIMATION: "Animasyon",
  DOCUMENTARY: "Belgesel",
  MINI_SERIES: "Mini Dizi",
};

export const STATUS_LABELS: Record<string, string> = {
  WATCHING: "İzliyorum",
  WATCHED: "İzledim",
  PLAN_TO_WATCH: "İzleyeceğim",
  DROPPED: "Bıraktım",
};

export const STATUS_COLORS: Record<string, string> = {
  WATCHING: "blue",
  WATCHED: "green",
  PLAN_TO_WATCH: "purple",
  DROPPED: "red",
};

export const MEDIA_TYPES = [
  "MOVIE",
  "TV",
  "ANIME",
  "ANIMATION",
  "DOCUMENTARY",
  "MINI_SERIES",
] as const;

export const WATCH_STATUSES = [
  "WATCHING",
  "WATCHED",
  "PLAN_TO_WATCH",
  "DROPPED",
] as const;

export function yearFromDate(date: string | null | undefined): string {
  if (!date) return "";
  return date.slice(0, 4);
}

export function formatRating(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value.toFixed(1);
}

export function isSeriesType(mediaType: string): boolean {
  return mediaType === "TV" || mediaType === "ANIME" || mediaType === "MINI_SERIES";
}

export function formatSeasonEpisode(
  seasons: number | null | undefined,
  episodes: number | null | undefined
): string | null {
  const parts: string[] = [];
  if (seasons != null) parts.push(`${seasons} sezon`);
  if (episodes != null) parts.push(`${episodes} bölüm`);
  return parts.length ? parts.join(" · ") : null;
}

export function formatRuntime(minutes: number | null | undefined): string | null {
  if (minutes == null || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} sa`);
  if (mins > 0 || hours === 0) parts.push(`${mins} dk`);
  return parts.join(" · ");
}

export function parseGenres(genres: string | null | undefined): string[] {
  if (!genres) return [];
  return genres
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
}
