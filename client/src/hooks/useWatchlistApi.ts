import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  createItem,
  deleteCategory,
  deleteItem,
  fetchBackupStatus,
  fetchCategories,
  fetchItems,
  fetchMediaDetails,
  fetchSettings,
  fetchStats,
  reorderItems,
  runBackup,
  searchMedia,
  updateItem,
  updateSettings,
} from "../api/watchlist";
import type { CreateItemPayload } from "../types";

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchMedia(query),
    enabled: query.trim().length >= 2,
    staleTime: 60_000,
  });
}

export function useMediaDetails(
  type: "movie" | "tv" | undefined,
  id: number | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: ["media-details", type, id],
    queryFn: () => fetchMediaDetails(type!, id!),
    enabled: enabled && Boolean(type && id),
    staleTime: 5 * 60_000,
  });
}

export function useWatchlist(params: {
  mediaType?: string;
  status?: string;
  rankedOnly?: boolean;
} = {}) {
  return useQuery({
    queryKey: ["items", params],
    queryFn: () => fetchItems(params),
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });
}

export function useBackupStatus() {
  return useQuery({
    queryKey: ["backup-status"],
    queryFn: fetchBackupStatus,
    refetchInterval: 30_000,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateItemPayload) => createItem(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["items"] });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: string } & Parameters<typeof updateItem>[1]) => updateItem(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["items"] });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["items"] });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useReorderItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderItems,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
      void queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["settings"] });
      void queryClient.invalidateQueries({ queryKey: ["backup-status"] });
    },
  });
}

export function useRunBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: runBackup,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["backup-status"] });
    },
  });
}
