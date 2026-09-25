import { Router } from "express";
import type { MediaType, WatchStatus } from "@prisma/client";
import {
  createItemSchema,
  reorderSchema,
  updateItemSchema,
} from "../schemas/watchlist.js";
import { watchlistRepository } from "../repositories/WatchlistRepository.js";

export const itemsRouter = Router();

itemsRouter.get("/", async (req, res, next) => {
  try {
    const items = await watchlistRepository.list({
      mediaType: req.query.mediaType as MediaType | undefined,
      status: req.query.status as WatchStatus | undefined,
      customCategoryId: req.query.customCategoryId as string | undefined,
      rankedOnly: req.query.rankedOnly === "true",
    });
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

itemsRouter.get("/stats", async (_req, res, next) => {
  try {
    const stats = await watchlistRepository.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

itemsRouter.post("/reorder", async (req, res, next) => {
  try {
    const input = reorderSchema.parse(req.body);
    await watchlistRepository.reorder(input.items);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

itemsRouter.get("/:id", async (req, res, next) => {
  try {
    const item = await watchlistRepository.findById(req.params.id);
    res.json(item);
  } catch (error) {
    next(error);
  }
});

itemsRouter.post("/", async (req, res, next) => {
  try {
    const input = createItemSchema.parse(req.body);
    const item = await watchlistRepository.create(input);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

itemsRouter.patch("/:id", async (req, res, next) => {
  try {
    const input = updateItemSchema.parse(req.body);
    const item = await watchlistRepository.update(req.params.id, input);
    res.json(item);
  } catch (error) {
    next(error);
  }
});

itemsRouter.delete("/:id", async (req, res, next) => {
  try {
    await watchlistRepository.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
