import type { MediaType, Prisma, WatchStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../errors/AppError.js";
import type { CreateItemInput, UpdateItemInput } from "../schemas/watchlist.js";

const itemInclude = {
  customCategory: true,
  tags: { include: { tag: true } },
} satisfies Prisma.WatchItemInclude;

export type WatchItemWithRelations = Prisma.WatchItemGetPayload<{
  include: typeof itemInclude;
}>;

export interface ListFilters {
  mediaType?: MediaType;
  status?: WatchStatus;
  customCategoryId?: string;
  rankedOnly?: boolean;
}

export class WatchlistRepository {
  async list(filters: ListFilters = {}): Promise<WatchItemWithRelations[]> {
    const where: Prisma.WatchItemWhereInput = {};

    if (filters.mediaType) {
      where.mediaType = filters.mediaType;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.customCategoryId) {
      where.customCategoryId = filters.customCategoryId;
    }
    if (filters.rankedOnly) {
      where.rankingOrder = { not: null };
    }

    return prisma.watchItem.findMany({
      where,
      include: itemInclude,
      orderBy: filters.rankedOnly
        ? [{ rankingOrder: "asc" }, { updatedAt: "desc" }]
        : [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  }

  async findById(id: string): Promise<WatchItemWithRelations> {
    const item = await prisma.watchItem.findUnique({
      where: { id },
      include: itemInclude,
    });
    if (!item) {
      throw new NotFoundError("Watch item not found");
    }
    return item;
  }

  async create(input: CreateItemInput): Promise<WatchItemWithRelations> {
    const maxOrder = await prisma.watchItem.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    const tagNames = input.tags ?? [];

    return prisma.$transaction(async (tx) => {
      const tagRecords = await Promise.all(
        tagNames.map((name) =>
          tx.tag.upsert({
            where: { name },
            create: { name },
            update: {},
          })
        )
      );

      return tx.watchItem.create({
        data: {
          tmdbId: input.tmdbId,
          title: input.title,
          originalTitle: input.originalTitle,
          overview: input.overview,
          posterPath: input.posterPath,
          backdropPath: input.backdropPath,
          releaseDate: input.releaseDate,
          mediaType: input.mediaType,
          tmdbRating: input.tmdbRating,
          personalRating: input.personalRating,
          status: input.status ?? "PLAN_TO_WATCH",
          notes: input.notes,
          genres: input.genres,
          customCategoryId: input.customCategoryId,
          currentSeason: input.currentSeason,
          currentEpisode: input.currentEpisode,
          runtimeMinutes: input.runtimeMinutes,
          sortOrder: nextOrder,
          tags: {
            create: tagRecords.map((tag) => ({ tagId: tag.id })),
          },
        },
        include: itemInclude,
      });
    });
  }

  async update(id: string, input: UpdateItemInput): Promise<WatchItemWithRelations> {
    await this.findById(id);

    return prisma.$transaction(async (tx) => {
      if (input.tags) {
        await tx.itemTag.deleteMany({ where: { itemId: id } });
        const tagRecords = await Promise.all(
          input.tags.map((name) =>
            tx.tag.upsert({
              where: { name },
              create: { name },
              update: {},
            })
          )
        );
        await tx.itemTag.createMany({
          data: tagRecords.map((tag) => ({ itemId: id, tagId: tag.id })),
        });
      }

      const { tags: _tags, ...rest } = input;
      return tx.watchItem.update({
        where: { id },
        data: rest,
        include: itemInclude,
      });
    });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await prisma.watchItem.delete({ where: { id } });
  }

  async reorder(
    items: Array<{ id: string; sortOrder?: number; rankingOrder?: number | null }>
  ): Promise<void> {
    await prisma.$transaction(
      items.map((item) =>
        prisma.watchItem.update({
          where: { id: item.id },
          data: {
            ...(item.sortOrder !== undefined ? { sortOrder: item.sortOrder } : {}),
            ...(item.rankingOrder !== undefined ? { rankingOrder: item.rankingOrder } : {}),
          },
        })
      )
    );
  }

  async getStats() {
    const [total, byStatus, byType, rated, recent] = await Promise.all([
      prisma.watchItem.count(),
      prisma.watchItem.groupBy({ by: ["status"], _count: true }),
      prisma.watchItem.groupBy({ by: ["mediaType"], _count: true }),
      prisma.watchItem.aggregate({
        where: { personalRating: { not: null } },
        _avg: { personalRating: true },
        _count: true,
      }),
      prisma.watchItem.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          mediaType: true,
          posterPath: true,
          createdAt: true,
          status: true,
        },
      }),
    ]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [addedThisMonth, addedThisYear] = await Promise.all([
      prisma.watchItem.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.watchItem.count({ where: { createdAt: { gte: startOfYear } } }),
    ]);

    return {
      total,
      byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
      byType: Object.fromEntries(byType.map((t) => [t.mediaType, t._count])),
      averagePersonalRating: rated._avg.personalRating,
      ratedCount: rated._count,
      addedThisMonth,
      addedThisYear,
      recent,
    };
  }
}

export const watchlistRepository = new WatchlistRepository();
