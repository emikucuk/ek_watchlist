import { Router } from "express";
import { settingsSchema } from "../schemas/watchlist.js";
import { settingsRepository } from "../repositories/SettingsRepository.js";
import { backupService } from "../services/BackupService.js";

export const settingsRouter = Router();
export const backupRouter = Router();

settingsRouter.get("/", async (_req, res, next) => {
  try {
    const settings = await settingsRepository.getPublicSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

settingsRouter.put("/", async (req, res, next) => {
  try {
    const input = settingsSchema.parse(req.body);
    const toSave: Record<string, string> = {};
    if (input.tmdbApiKey !== undefined) toSave.tmdbApiKey = input.tmdbApiKey;
    if (input.githubRepoUrl !== undefined) toSave.githubRepoUrl = input.githubRepoUrl;
    if (input.githubPat !== undefined) toSave.githubPat = input.githubPat;
    if (input.githubBranch !== undefined) toSave.githubBranch = input.githubBranch;
    await settingsRepository.setMany(toSave);
    const settings = await settingsRepository.getPublicSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

backupRouter.get("/status", async (_req, res, next) => {
  try {
    const status = await backupService.getStatus();
    res.json(status);
  } catch (error) {
    next(error);
  }
});

backupRouter.post("/run", async (_req, res, next) => {
  try {
    const result = await backupService.runBackup("watchlist: manual backup");
    res.json(result);
  } catch (error) {
    next(error);
  }
});

backupRouter.get("/export", async (_req, res, next) => {
  try {
    const data = await backupService.exportJson();
    res.setHeader("Content-Disposition", "attachment; filename=watchlist-export.json");
    res.json(data);
  } catch (error) {
    next(error);
  }
});
