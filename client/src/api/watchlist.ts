import { api } from "./client";
import type {
  BackupStatus,
  CreateItemPayload,
  CustomCategory,
  MediaDetails,
  PublicSettings,
  SearchResult,
  Stats,
  WatchItem,
} from "../types";

export function searchMedia(query: string) {
  return api.get<{ results: SearchResult[] }>(
    `/api/search?q=${encodeURIComponent(query)}`
  );
}

export function fetchMediaDetails(type: "movie" | "tv", id: number) {
  return api.get<MediaDetails>(`/api/search/details/${type}/${id}`);
}

export function fetchItems(params: {
  mediaType?: string;
  status?: string;
  rankedOnly?: boolean;
  customCategoryId?: string;
} = {}) {
  const search = new URLSearchParams();
  if (params.mediaType) search.set("mediaType", params.mediaType);
  if (params.status) search.set("status", params.status);
  if (params.rankedOnly) search.set("rankedOnly", "true");
  if (params.customCategoryId) search.set("customCategoryId", params.customCategoryId);
  const qs = search.toString();
  return api.get<{ items: WatchItem[] }>(`/api/items${qs ? `?${qs}` : ""}`);
}

export function createItem(payload: CreateItemPayload) {
  return api.post<WatchItem>("/api/items", payload);
}

export function updateItem(id: string, payload: Partial<CreateItemPayload> & {
  rankingOrder?: number | null;
  sortOrder?: number;
  customCategoryId?: string | null;
}) {
  return api.patch<WatchItem>(`/api/items/${id}`, payload);
}

export function deleteItem(id: string) {
  return api.delete<void>(`/api/items/${id}`);
}

export function reorderItems(
  items: Array<{ id: string; sortOrder?: number; rankingOrder?: number | null }>
) {
  return api.post<{ ok: boolean }>("/api/items/reorder", { items });
}

export function fetchStats() {
  return api.get<Stats>("/api/items/stats");
}

export function fetchCategories() {
  return api.get<{ categories: CustomCategory[] }>("/api/categories");
}

export function createCategory(data: { name: string; color?: string; icon?: string }) {
  return api.post<CustomCategory>("/api/categories", data);
}

export function deleteCategory(id: string) {
  return api.delete<void>(`/api/categories/${id}`);
}

export function fetchSettings() {
  return api.get<PublicSettings>("/api/settings");
}

export function updateSettings(data: {
  tmdbApiKey?: string;
  githubRepoUrl?: string;
  githubPat?: string;
  githubBranch?: string;
}) {
  return api.put<PublicSettings>("/api/settings", data);
}

export function fetchBackupStatus() {
  return api.get<BackupStatus>("/api/backup/status");
}

export function runBackup() {
  return api.post<{ ok: boolean; message: string }>("/api/backup/run");
}

export function exportWatchlistUrl() {
  return "/api/backup/export";
}
