export type MediaType =
  | "MOVIE"
  | "TV"
  | "ANIME"
  | "ANIMATION"
  | "DOCUMENTARY"
  | "MINI_SERIES";

export type WatchStatus = "WATCHING" | "WATCHED" | "PLAN_TO_WATCH" | "DROPPED";

export interface Tag {
  id: string;
  name: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  _count?: { items: number };
}

export interface WatchItem {
  id: string;
  tmdbId: number;
  title: string;
  originalTitle: string | null;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  mediaType: MediaType;
  tmdbRating: number | null;
  personalRating: number | null;
  status: WatchStatus;
  notes: string | null;
  sortOrder: number;
  rankingOrder: number | null;
  currentSeason: number | null;
  currentEpisode: number | null;
  runtimeMinutes: number | null;
  genres: string | null;
  customCategoryId: string | null;
  customCategory: CustomCategory | null;
  tags: Array<{ tag: Tag }>;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  tmdbId: number;
  title: string;
  originalTitle: string | null;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  tmdbRating: number | null;
  mediaType: MediaType;
  tmdbMediaType: "movie" | "tv";
  genres: string | null;
}

export interface MediaDetails {
  tmdbId: number;
  title: string;
  originalTitle: string | null;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  tmdbRating: number | null;
  mediaType: MediaType;
  genres: string | null;
  numberOfSeasons: number | null;
  numberOfEpisodes: number | null;
  runtimeMinutes: number | null;
}

export interface Stats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  averagePersonalRating: number | null;
  ratedCount: number;
  addedThisMonth: number;
  addedThisYear: number;
  recent: Array<{
    id: string;
    title: string;
    mediaType: MediaType;
    posterPath: string | null;
    createdAt: string;
    status: WatchStatus;
  }>;
}

export interface PublicSettings {
  hasTmdbApiKey: boolean;
  hasGithubRepo: boolean;
  hasGithubPat: boolean;
  githubRepoUrl: string;
  githubBranch: string;
}

export interface BackupStatus {
  configured: boolean;
  schedulerActive: boolean;
  intervalHours: number;
  lastBackup: {
    id: string;
    status: string;
    message: string | null;
    createdAt: string;
  } | null;
}

export interface CreateItemPayload {
  tmdbId: number;
  title: string;
  originalTitle?: string | null;
  overview?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  mediaType: MediaType;
  tmdbRating?: number | null;
  personalRating?: number | null;
  status?: WatchStatus;
  notes?: string | null;
  genres?: string | null;
  customCategoryId?: string | null;
  tags?: string[];
  currentSeason?: number | null;
  currentEpisode?: number | null;
  runtimeMinutes?: number | null;
}
