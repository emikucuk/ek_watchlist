import { z } from "zod";

export const mediaTypeSchema = z.enum([
  "MOVIE",
  "TV",
  "ANIME",
  "ANIMATION",
  "DOCUMENTARY",
  "MINI_SERIES",
]);

export const watchStatusSchema = z.enum([
  "WATCHING",
  "WATCHED",
  "PLAN_TO_WATCH",
  "DROPPED",
]);

export const createItemSchema = z.object({
  tmdbId: z.number().int().positive(),
  title: z.string().min(1),
  originalTitle: z.string().optional().nullable(),
  overview: z.string().optional().nullable(),
  posterPath: z.string().optional().nullable(),
  backdropPath: z.string().optional().nullable(),
  releaseDate: z.string().optional().nullable(),
  mediaType: mediaTypeSchema,
  tmdbRating: z.number().min(0).max(10).optional().nullable(),
  personalRating: z.number().min(0).max(10).optional().nullable(),
  status: watchStatusSchema.optional(),
  notes: z.string().optional().nullable(),
  genres: z.string().optional().nullable(),
  customCategoryId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  currentSeason: z.number().int().min(0).optional().nullable(),
  currentEpisode: z.number().int().min(0).optional().nullable(),
  runtimeMinutes: z.number().int().min(1).optional().nullable(),
});

export const updateItemSchema = createItemSchema.partial().omit({ tmdbId: true, mediaType: true }).extend({
  mediaType: mediaTypeSchema.optional(),
  rankingOrder: z.number().int().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int().optional(),
      rankingOrder: z.number().int().nullable().optional(),
    })
  ),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional().nullable(),
});

export const createTagSchema = z.object({
  name: z.string().min(1).max(40),
});

export const settingsSchema = z.object({
  tmdbApiKey: z.string().optional(),
  githubRepoUrl: z.string().optional(),
  githubPat: z.string().optional(),
  githubBranch: z.string().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
