import { NotFoundError } from "../errors/AppError.js";
import { watchlistRepository } from "../repositories/WatchlistRepository.js";
import { tmdbService } from "../services/TmdbService.js";
import { prisma } from "../lib/prisma.js";

const SERIES_TYPES = new Set(["TV", "ANIME", "MINI_SERIES"]);

export class VoiceService {
  async addBySearchQuery(query: string) {
    const results = await tmdbService.search(query);
    if (!results.length) {
      throw new NotFoundError(`"${query}" için sonuç bulunamadı`);
    }

    const match = results[0]!;
    const details = await tmdbService.getDetails(match.tmdbMediaType, match.tmdbId);
    const mediaType = details.mediaType;
    const series = SERIES_TYPES.has(mediaType);

    const existing = await prisma.watchItem.findUnique({
      where: {
        tmdbId_mediaType: { tmdbId: match.tmdbId, mediaType },
      },
    });

    if (existing) {
      return {
        ok: true as const,
        alreadyExists: true,
        message: `Zaten listede: ${existing.title}`,
        title: existing.title,
        mediaType: existing.mediaType,
      };
    }

    const item = await watchlistRepository.create({
      tmdbId: match.tmdbId,
      title: details.title,
      originalTitle: details.originalTitle,
      overview: details.overview,
      posterPath: details.posterPath,
      backdropPath: details.backdropPath,
      releaseDate: details.releaseDate,
      mediaType,
      tmdbRating: details.tmdbRating,
      genres: details.genres ?? match.genres,
      status: "PLAN_TO_WATCH",
      currentSeason: series ? details.numberOfSeasons : null,
      currentEpisode: series ? details.numberOfEpisodes : null,
      runtimeMinutes: series ? null : details.runtimeMinutes,
    });

    return {
      ok: true as const,
      alreadyExists: false,
      message: `Eklendi: ${item.title}`,
      title: item.title,
      mediaType: item.mediaType,
    };
  }
}

export const voiceService = new VoiceService();
