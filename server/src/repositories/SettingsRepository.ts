import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";

const SETTINGS_KEYS = [
  "tmdbApiKey",
  "githubRepoUrl",
  "githubPat",
  "githubBranch",
] as const;

export type SettingKey = (typeof SETTINGS_KEYS)[number];

export class SettingsRepository {
  async getAll(): Promise<Record<SettingKey, string>> {
    const rows = await prisma.appSetting.findMany({
      where: { key: { in: [...SETTINGS_KEYS] } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Partial<
      Record<SettingKey, string>
    >;

    return {
      tmdbApiKey: map.tmdbApiKey ?? env.tmdbApiKey,
      githubRepoUrl: map.githubRepoUrl ?? env.githubRepoUrl,
      githubPat: map.githubPat ?? env.githubPat,
      githubBranch: map.githubBranch ?? env.githubBranch,
    };
  }

  async get(key: SettingKey): Promise<string> {
    const all = await this.getAll();
    return all[key];
  }

  async setMany(values: Partial<Record<SettingKey, string>>): Promise<void> {
    const entries = Object.entries(values).filter(
      ([, v]) => v !== undefined
    ) as Array<[SettingKey, string]>;

    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.appSetting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        })
      )
    );
  }

  async getPublicSettings() {
    const all = await this.getAll();
    return {
      hasTmdbApiKey: Boolean(all.tmdbApiKey && all.tmdbApiKey !== "your_tmdb_api_key_here"),
      hasGithubRepo: Boolean(all.githubRepoUrl),
      hasGithubPat: Boolean(all.githubPat),
      githubRepoUrl: all.githubRepoUrl,
      githubBranch: all.githubBranch,
    };
  }
}

export const settingsRepository = new SettingsRepository();
