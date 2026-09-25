import { ExternalApiError, ValidationError } from "../errors/AppError.js";
import { settingsRepository } from "../repositories/SettingsRepository.js";
import type { MediaType } from "@prisma/client";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

interface TmdbSearchResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  origin_country?: string[];
}

interface TmdbGenre {
  id: number;
  name: string;
}

const ANIMATION_GENRE_ID = 16;
const DOCUMENTARY_GENRE_ID = 99;

export class TmdbService {
  private genreMap: Map<number, string> | null = null;
  private genreMapLoadedAt = 0;

  private async getApiKey(): Promise<string> {
    const key = await settingsRepository.get("tmdbApiKey");
    if (!key || key === "your_tmdb_api_key_here") {
      throw new ValidationError(
        "TMDB API key is not configured. Add it in Settings or .env"
      );
    }
    return key;
  }

  private async fetchTmdb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const apiKey = await this.getApiKey();
    const url = new URL(`${TMDB_BASE}${path}`);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("language", "tr-TR");
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new ExternalApiError(`TMDB request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  private async getGenreMap(): Promise<Map<number, string>> {
    const stale = Date.now() - this.genreMapLoadedAt > 24 * 60 * 60 * 1000;
    if (this.genreMap && !stale) {
      return this.genreMap;
    }

    const [movies, tv] = await Promise.all([
      this.fetchTmdb<{ genres: TmdbGenre[] }>("/genre/movie/list"),
      this.fetchTmdb<{ genres: TmdbGenre[] }>("/genre/tv/list"),
    ]);

    const map = new Map<number, string>();
    for (const genre of [...movies.genres, ...tv.genres]) {
      map.set(genre.id, genre.name);
    }
    this.genreMap = map;
    this.genreMapLoadedAt = Date.now();
    return map;
  }

  private async resolveGenreNames(genreIds: number[]): Promise<string | null> {
    if (!genreIds.length) return null;
    const map = await this.getGenreMap();
    const names = genreIds
      .map((id) => map.get(id))
      .filter((name): name is string => Boolean(name));
    return names.length ? [...new Set(names)].join(", ") : null;
  }

  async search(query: string) {
    if (!query.trim()) {
      return [];
    }

    const data = await this.fetchTmdb<{ results: TmdbSearchResult[] }>("/search/multi", {
      query: query.trim(),
      include_adult: "false",
    });

    const results = data.results.filter(
      (r) => r.media_type === "movie" || r.media_type === "tv"
    );

    return Promise.all(results.map((r) => this.mapSearchResult(r)));
  }

  async getDetails(mediaType: "movie" | "tv", id: number) {
    const data = await this.fetchTmdb<{
      id: number;
      title?: string;
      name?: string;
      original_title?: string;
      original_name?: string;
      overview?: string;
      poster_path?: string | null;
      backdrop_path?: string | null;
      release_date?: string;
      first_air_date?: string;
      vote_average?: number;
      genres?: TmdbGenre[];
      origin_country?: string[];
      type?: string;
      number_of_seasons?: number;
      number_of_episodes?: number;
      episode_run_time?: number[];
      runtime?: number;
    }>(`/${mediaType}/${id}`);

    const genres = data.genres ?? [];
    const resolvedType = this.resolveMediaType(
      mediaType,
      genres.map((g) => g.id),
      data.origin_country,
      data.type
    );

    return {
      tmdbId: data.id,
      title: data.title ?? data.name ?? "Untitled",
      originalTitle: data.original_title ?? data.original_name ?? null,
      overview: data.overview ?? null,
      posterPath: data.poster_path ? `${IMAGE_BASE}/w500${data.poster_path}` : null,
      backdropPath: data.backdrop_path
        ? `${IMAGE_BASE}/w1280${data.backdrop_path}`
        : null,
      releaseDate: data.release_date ?? data.first_air_date ?? null,
      tmdbRating: data.vote_average ?? null,
      mediaType: resolvedType,
      genres: genres.map((g) => g.name).join(", ") || null,
      numberOfSeasons: data.number_of_seasons ?? null,
      numberOfEpisodes: data.number_of_episodes ?? null,
      runtimeMinutes: mediaType === "movie" ? (data.runtime ?? null) : null,
    };
  }

  private async mapSearchResult(result: TmdbSearchResult) {
    const isMovie = result.media_type === "movie";
    const genreIds = result.genre_ids ?? [];
    const mediaType = this.resolveMediaType(
      result.media_type as "movie" | "tv",
      genreIds,
      result.origin_country
    );

    return {
      tmdbId: result.id,
      title: result.title ?? result.name ?? "Untitled",
      originalTitle: result.original_title ?? result.original_name ?? null,
      overview: result.overview ?? null,
      posterPath: result.poster_path
        ? `${IMAGE_BASE}/w342${result.poster_path}`
        : null,
      backdropPath: result.backdrop_path
        ? `${IMAGE_BASE}/w780${result.backdrop_path}`
        : null,
      releaseDate: result.release_date ?? result.first_air_date ?? null,
      tmdbRating: result.vote_average ?? null,
      mediaType,
      tmdbMediaType: (isMovie ? "movie" : "tv") as "movie" | "tv",
      genres: await this.resolveGenreNames(genreIds),
    };
  }

  private resolveMediaType(
    base: "movie" | "tv",
    genreIds: number[],
    originCountry?: string[],
    tvType?: string
  ): MediaType {
    const isAnimation = genreIds.includes(ANIMATION_GENRE_ID);
    const isDocumentary = genreIds.includes(DOCUMENTARY_GENRE_ID);
    const isAnime =
      base === "tv" &&
      isAnimation &&
      (originCountry?.includes("JP") ?? false);

    if (isAnime) {
      return "ANIME";
    }
    if (isDocumentary) {
      return "DOCUMENTARY";
    }
    if (isAnimation) {
      return "ANIMATION";
    }
    if (base === "tv" && (tvType === "Miniseries" || tvType === "Limited")) {
      return "MINI_SERIES";
    }
    return base === "movie" ? "MOVIE" : "TV";
  }
}

export const tmdbService = new TmdbService();
