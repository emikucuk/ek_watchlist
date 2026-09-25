import { mkdir, writeFile, rm, readdir, unlink } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { simpleGit } from "simple-git";
import { prisma } from "../lib/prisma.js";
import { settingsRepository } from "../repositories/SettingsRepository.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ValidationError } from "../errors/AppError.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = resolve(__dirname, "../../data/backup-repo");
const BACKUPS_SUBDIR = "backups";
const MAX_BACKUP_FILES = 5;
const MAX_BACKUP_LOGS = 20;
const LEGACY_BACKUP_FILE = "watchlist-backup.json";

export class BackupService {
  private intervalTimer: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  startScheduler(): void {
    if (this.intervalTimer) return;

    const hours = env.backupIntervalHours;
    if (hours <= 0) {
      logger.info("Backup scheduler disabled (BACKUP_INTERVAL_HOURS <= 0)");
      return;
    }

    const intervalMs = hours * 60 * 60 * 1000;
    this.intervalTimer = setInterval(() => {
      void this.runBackup("watchlist: scheduled backup");
    }, intervalMs);

    logger.info("Backup scheduler started", { intervalHours: hours });
  }

  stopScheduler(): void {
    if (!this.intervalTimer) return;
    clearInterval(this.intervalTimer);
    this.intervalTimer = null;
    logger.info("Backup scheduler stopped");
  }

  async runShutdownBackup(): Promise<void> {
    this.stopScheduler();
    const result = await this.runBackup("watchlist: shutdown backup");
    if (!result.ok) {
      logger.warn("Shutdown backup did not complete", { message: result.message });
      return;
    }
    logger.info("Shutdown backup completed", { message: result.message });
  }

  async runBackup(message: string): Promise<{ ok: boolean; message: string }> {
    if (this.isRunning) {
      return { ok: false, message: "Backup already in progress" };
    }

    this.isRunning = true;
    try {
      const settings = await settingsRepository.getAll();
      if (!settings.githubRepoUrl || !settings.githubPat) {
        throw new ValidationError(
          "GitHub repo URL and PAT are required for backup. Configure them in Settings."
        );
      }

      const exportData = await this.buildExportPayload();
      const authUrl = this.buildAuthUrl(settings.githubRepoUrl, settings.githubPat);
      await this.ensureRepo(authUrl, settings.githubBranch);

      const repoGit = simpleGit(BACKUP_DIR);
      await repoGit.addConfig("user.name", "EK Watchlist", false, "local");
      await repoGit.addConfig("user.email", "watchlist@local", false, "local");

      try {
        await repoGit.pull("origin", settings.githubBranch);
      } catch {
        logger.warn("Pull failed, continuing with push");
      }

      const backupsDir = resolve(BACKUP_DIR, BACKUPS_SUBDIR);
      await mkdir(backupsDir, { recursive: true });
      await this.removeLegacyRootBackup();

      const fileName = this.buildBackupFileName();
      await writeFile(
        resolve(backupsDir, fileName),
        JSON.stringify(exportData, null, 2),
        "utf-8"
      );
      const kept = await this.pruneBackupFiles(backupsDir);

      await this.commitAndPush(repoGit, settings.githubBranch, message);
      await this.pruneBackupLogs();
      await this.resetLocalClone();

      await this.logBackup("success", `${message} (${kept.length} files kept)`);
      logger.info("Backup completed", { message, kept: kept.length, fileName });
      return { ok: true, message: `Backup pushed: ${fileName} (kept ${kept.length})` };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.logBackup("error", msg);
      logger.error("Backup failed", { error: msg });
      return { ok: false, message: msg };
    } finally {
      this.isRunning = false;
    }
  }

  async getStatus() {
    const latest = await prisma.backupLog.findFirst({
      orderBy: { createdAt: "desc" },
    });
    const publicSettings = await settingsRepository.getPublicSettings();
    return {
      configured: publicSettings.hasGithubRepo && publicSettings.hasGithubPat,
      lastBackup: latest,
      schedulerActive: this.intervalTimer !== null,
      intervalHours: env.backupIntervalHours,
      keepCount: MAX_BACKUP_FILES,
    };
  }

  async exportJson() {
    return this.buildExportPayload();
  }

  private buildBackupFileName(): string {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `watchlist-backup-${stamp}.json`;
  }

  private async ensureRepo(authUrl: string, branch: string): Promise<void> {
    await mkdir(BACKUP_DIR, { recursive: true });
    const git = simpleGit();
    const isRepo = await this.isGitRepo(BACKUP_DIR);
    if (isRepo) return;

    await rm(BACKUP_DIR, { recursive: true, force: true });
    await mkdir(BACKUP_DIR, { recursive: true });
    await git.clone(authUrl, BACKUP_DIR, ["--depth", "1", "--branch", branch]);
  }

  private async removeLegacyRootBackup(): Promise<void> {
    try {
      await unlink(resolve(BACKUP_DIR, LEGACY_BACKUP_FILE));
    } catch {
      // absent is fine
    }
  }

  private async pruneBackupFiles(backupsDir: string): Promise<string[]> {
    const entries = (await readdir(backupsDir))
      .filter((name) => name.startsWith("watchlist-backup-") && name.endsWith(".json"))
      .sort()
      .reverse();

    const keep = entries.slice(0, MAX_BACKUP_FILES);
    const remove = entries.slice(MAX_BACKUP_FILES);
    await Promise.all(remove.map((name) => unlink(resolve(backupsDir, name))));
    return keep;
  }

  /** Commit only backups/ (never rewrite branch history). */
  private async commitAndPush(
    repoGit: ReturnType<typeof simpleGit>,
    branch: string,
    message: string
  ): Promise<void> {
    await repoGit.add(["-A", BACKUPS_SUBDIR, LEGACY_BACKUP_FILE]);
    const status = await repoGit.status();
    if (status.files.length === 0) {
      return;
    }
    await repoGit.commit(message);
    await repoGit.push("origin", branch);
  }

  private async resetLocalClone(): Promise<void> {
    await rm(BACKUP_DIR, { recursive: true, force: true });
  }

  private async pruneBackupLogs(): Promise<void> {
    const keep = await prisma.backupLog.findMany({
      orderBy: { createdAt: "desc" },
      take: MAX_BACKUP_LOGS,
      select: { id: true },
    });
    if (keep.length === 0) return;

    await prisma.backupLog.deleteMany({
      where: { id: { notIn: keep.map((row) => row.id) } },
    });
  }

  private async buildExportPayload() {
    const [items, categories, tags, settings] = await Promise.all([
      prisma.watchItem.findMany({
        include: {
          tags: { include: { tag: true } },
          customCategory: true,
        },
      }),
      prisma.customCategory.findMany(),
      prisma.tag.findMany(),
      settingsRepository.getPublicSettings(),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      version: 1,
      settings: {
        githubRepoUrl: settings.githubRepoUrl,
        githubBranch: settings.githubBranch,
      },
      categories,
      tags,
      items: items.map((item) => ({
        ...item,
        tags: item.tags.map((t) => t.tag.name),
      })),
    };
  }

  private buildAuthUrl(repoUrl: string, pat: string): string {
    const url = new URL(repoUrl.replace(/\.git$/, "") + ".git");
    url.username = pat;
    url.password = "";
    return url.toString();
  }

  private async isGitRepo(path: string): Promise<boolean> {
    try {
      const git = simpleGit(path);
      return await git.checkIsRepo();
    } catch {
      return false;
    }
  }

  private async logBackup(status: string, message: string) {
    await prisma.backupLog.create({ data: { status, message } });
  }
}

export const backupService = new BackupService();
