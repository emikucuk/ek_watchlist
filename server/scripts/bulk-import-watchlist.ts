/**
 * Bulk import watchlist items from TMDB.
 * Usage: npm run bulk:import -w server
 */
import { prisma } from "../src/lib/prisma.js";
import { watchlistRepository } from "../src/repositories/WatchlistRepository.js";
import { tmdbService } from "../src/services/TmdbService.js";

const SERIES_TYPES = new Set(["TV", "ANIME", "MINI_SERIES"]);

interface ImportEntry {
  query: string;
  preferMediaType: "movie" | "tv";
  year?: number;
}

const ITEMS: ImportEntry[] = [
  { query: "Interstellar", preferMediaType: "movie", year: 2014 },
  { query: "The Dark Knight", preferMediaType: "movie", year: 2008 },
  { query: "Fight Club", preferMediaType: "movie", year: 1999 },
  { query: "Shutter Island", preferMediaType: "movie", year: 2010 },
  { query: "The Matrix", preferMediaType: "movie", year: 1999 },
  { query: "Titanic", preferMediaType: "movie", year: 1997 },
  { query: "Forrest Gump", preferMediaType: "movie", year: 1994 },
  { query: "Joker", preferMediaType: "movie", year: 2019 },
  { query: "Avengers Endgame", preferMediaType: "movie", year: 2019 },
  { query: "Harry Potter and the Philosopher's Stone", preferMediaType: "movie", year: 2001 },
  { query: "The Lord of the Rings The Fellowship of the Ring", preferMediaType: "movie", year: 2001 },
  { query: "The Hunger Games", preferMediaType: "movie", year: 2012 },
  { query: "The Maze Runner", preferMediaType: "movie", year: 2014 },
  { query: "John Wick", preferMediaType: "movie", year: 2014 },
  { query: "Fast Five", preferMediaType: "movie", year: 2011 },
  { query: "Get Out", preferMediaType: "movie", year: 2017 },
  { query: "The Godfather", preferMediaType: "movie", year: 1972 },
  { query: "The Conjuring", preferMediaType: "movie", year: 2013 },
  { query: "It", preferMediaType: "movie", year: 2017 },
  { query: "A Quiet Place", preferMediaType: "movie", year: 2018 },
  { query: "Inside Out", preferMediaType: "movie", year: 2015 },
  { query: "Recep İvedik", preferMediaType: "movie", year: 2008 },
  { query: "G.O.R.A", preferMediaType: "movie", year: 2004 },
  { query: "A.R.O.G", preferMediaType: "movie", year: 2008 },
  { query: "Organize İşler", preferMediaType: "movie", year: 2005 },
  { query: "Breaking Bad", preferMediaType: "tv", year: 2008 },
  { query: "Stranger Things", preferMediaType: "tv", year: 2016 },
  { query: "Sherlock", preferMediaType: "tv", year: 2010 },
  { query: "Squid Game", preferMediaType: "tv", year: 2021 },
  { query: "The Last of Us", preferMediaType: "tv", year: 2023 },
  { query: "La Casa de Papel", preferMediaType: "tv", year: 2017 },
  { query: "Peaky Blinders", preferMediaType: "tv", year: 2013 },
  { query: "Rick and Morty", preferMediaType: "tv", year: 2013 },
  { query: "The Witcher", preferMediaType: "tv", year: 2019 },
  { query: "The Walking Dead", preferMediaType: "tv", year: 2010 },
  { query: "Narcos", preferMediaType: "tv", year: 2015 },
  { query: "Çukur", preferMediaType: "tv", year: 2017 },
  { query: "Ezel", preferMediaType: "tv", year: 2009 },
  { query: "Medcezir", preferMediaType: "tv", year: 2013 },
  { query: "Behzat Ç. Bir Ankara Polisiyesi", preferMediaType: "tv", year: 2010 },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pickMatch(
  results: Awaited<ReturnType<typeof tmdbService.search>>,
  entry: ImportEntry
) {
  let candidates = results.filter((r) => r.tmdbMediaType === entry.preferMediaType);
  if (!candidates.length) candidates = results;

  if (entry.year) {
    const yearStr = String(entry.year);
    const byYear = candidates.filter((r) => r.releaseDate?.startsWith(yearStr));
    if (byYear.length) candidates = byYear;
  }

  return candidates[0] ?? null;
}

async function main() {
  let added = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Importing ${ITEMS.length} items as WATCHED...\n`);

  for (const entry of ITEMS) {
    const label = `${entry.query}${entry.year ? ` (${entry.year})` : ""}`;
    try {
      const results = await tmdbService.search(entry.query);
      const match = pickMatch(results, entry);

      if (!match) {
        console.log(`✗ ${label} — TMDB sonucu bulunamadı`);
        failed++;
        await sleep(300);
        continue;
      }

      const details = await tmdbService.getDetails(match.tmdbMediaType, match.tmdbId);
      const series = SERIES_TYPES.has(details.mediaType);

      const existing = await prisma.watchItem.findUnique({
        where: {
          tmdbId_mediaType: { tmdbId: match.tmdbId, mediaType: details.mediaType },
        },
      });

      if (existing) {
        console.log(`○ ${label} — zaten listede: ${existing.title}`);
        skipped++;
        await sleep(300);
        continue;
      }

      await watchlistRepository.create({
        tmdbId: match.tmdbId,
        title: details.title,
        originalTitle: details.originalTitle,
        overview: details.overview,
        posterPath: details.posterPath,
        backdropPath: details.backdropPath,
        releaseDate: details.releaseDate,
        mediaType: details.mediaType,
        tmdbRating: details.tmdbRating,
        genres: details.genres ?? match.genres,
        status: "WATCHED",
        currentSeason: series ? details.numberOfSeasons : null,
        currentEpisode: series ? details.numberOfEpisodes : null,
        runtimeMinutes: series ? null : details.runtimeMinutes,
      });

      console.log(`✓ ${label} → ${details.title}`);
      added++;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`✗ ${label} — ${msg}`);
      failed++;
    }

    await sleep(350);
  }

  console.log(`\nBitti: ${added} eklendi, ${skipped} atlandı, ${failed} hata`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
