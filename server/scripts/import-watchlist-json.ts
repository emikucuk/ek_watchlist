/**
 * Import watchlist-export.json into PostgreSQL (idempotent upsert).
 * Usage: npx tsx -r ./scripts/load-root-env.cjs scripts/import-watchlist-json.ts [path]
 */
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { MediaType, WatchStatus } from "@prisma/client";
import { prisma } from "../src/lib/prisma.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

interface ExportCategory {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ExportTag {
  id: string;
  name: string;
  createdAt?: string;
}

interface ExportSetting {
  key: string;
  value: string;
  updatedAt?: string;
}

interface ExportItem {
  id: string;
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
  status: WatchStatus;
  notes?: string | null;
  sortOrder?: number;
  rankingOrder?: number | null;
  currentSeason?: number | null;
  currentEpisode?: number | null;
  runtimeMinutes?: number | null;
  genres?: string | null;
  customCategoryId?: string | null;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ExportPayload {
  version: number;
  categories?: ExportCategory[];
  tags?: ExportTag[];
  settings?: ExportSetting[];
  items?: ExportItem[];
}

async function main(): Promise<void> {
  const inPath = resolve(repoRoot, process.argv[2] ?? "watchlist-export.json");
  const raw = await readFile(inPath, "utf8");
  const payload = JSON.parse(raw) as ExportPayload;

  const categories = payload.categories ?? [];
  const tags = payload.tags ?? [];
  const settings = payload.settings ?? [];
  const items = payload.items ?? [];

  let categoryCount = 0;
  for (const category of categories) {
    await prisma.customCategory.upsert({
      where: { id: category.id },
      create: {
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        ...(category.createdAt ? { createdAt: new Date(category.createdAt) } : {}),
        ...(category.updatedAt ? { updatedAt: new Date(category.updatedAt) } : {}),
      },
      update: {
        name: category.name,
        color: category.color,
        icon: category.icon,
      },
    });
    categoryCount += 1;
  }

  let tagCount = 0;
  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      create: {
        id: tag.id,
        name: tag.name,
        ...(tag.createdAt ? { createdAt: new Date(tag.createdAt) } : {}),
      },
      update: {},
    });
    tagCount += 1;
  }

  let settingCount = 0;
  for (const setting of settings) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      create: {
        key: setting.key,
        value: setting.value,
        ...(setting.updatedAt ? { updatedAt: new Date(setting.updatedAt) } : {}),
      },
      update: { value: setting.value },
    });
    settingCount += 1;
  }

  let itemCount = 0;
  for (const item of items) {
    const tagNames = item.tags ?? [];
    const tagRecords = await Promise.all(
      tagNames.map((name) =>
        prisma.tag.upsert({
          where: { name },
          create: { name },
          update: {},
        })
      )
    );

    const existing = await prisma.watchItem.findUnique({
      where: {
        tmdbId_mediaType: { tmdbId: item.tmdbId, mediaType: item.mediaType },
      },
    });

    const data = {
      title: item.title,
      originalTitle: item.originalTitle ?? null,
      overview: item.overview ?? null,
      posterPath: item.posterPath ?? null,
      backdropPath: item.backdropPath ?? null,
      releaseDate: item.releaseDate ?? null,
      tmdbRating: item.tmdbRating ?? null,
      personalRating: item.personalRating ?? null,
      status: item.status,
      notes: item.notes ?? null,
      sortOrder: item.sortOrder ?? 0,
      rankingOrder: item.rankingOrder ?? null,
      currentSeason: item.currentSeason ?? null,
      currentEpisode: item.currentEpisode ?? null,
      runtimeMinutes: item.runtimeMinutes ?? null,
      genres: item.genres ?? null,
      customCategoryId: item.customCategoryId ?? null,
    };

    if (existing) {
      await prisma.$transaction(async (tx) => {
        await tx.itemTag.deleteMany({ where: { itemId: existing.id } });
        await tx.watchItem.update({
          where: { id: existing.id },
          data: {
            ...data,
            tags: {
              create: tagRecords.map((tag) => ({ tagId: tag.id })),
            },
          },
        });
      });
    } else {
      await prisma.watchItem.create({
        data: {
          id: item.id,
          tmdbId: item.tmdbId,
          mediaType: item.mediaType,
          ...data,
          ...(item.createdAt ? { createdAt: new Date(item.createdAt) } : {}),
          ...(item.updatedAt ? { updatedAt: new Date(item.updatedAt) } : {}),
          tags: {
            create: tagRecords.map((tag) => ({ tagId: tag.id })),
          },
        },
      });
    }
    itemCount += 1;
  }

  console.log(
    `Imported ${itemCount} items, ${categoryCount} categories, ${tagCount} tags, ${settingCount} settings from ${inPath}`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
