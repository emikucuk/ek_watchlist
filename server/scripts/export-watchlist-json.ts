/**
 * Full watchlist dump for migration (includes AppSetting secrets).
 * Usage: npx tsx -r ./scripts/load-root-env.cjs scripts/export-watchlist-json.ts [out.json]
 */
import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "../src/lib/prisma.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

async function main(): Promise<void> {
  const outPath = resolve(repoRoot, process.argv[2] ?? "watchlist-export.json");

  const [items, categories, tags, settings] = await Promise.all([
    prisma.watchItem.findMany({
      include: {
        tags: { include: { tag: true } },
        customCategory: true,
      },
    }),
    prisma.customCategory.findMany(),
    prisma.tag.findMany(),
    prisma.appSetting.findMany(),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    categories,
    tags,
    settings,
    items: items.map((item) => ({
      ...item,
      tags: item.tags.map((t) => t.tag.name),
      customCategory: undefined,
    })),
  };

  await writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(
    `Exported ${items.length} items, ${categories.length} categories, ${tags.length} tags, ${settings.length} settings → ${outPath}`
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
