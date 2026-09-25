import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { createTagSchema } from "../schemas/watchlist.js";

export const tagsRouter = Router();

tagsRouter.get("/", async (_req, res, next) => {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
    res.json({ tags });
  } catch (error) {
    next(error);
  }
});

tagsRouter.post("/", async (req, res, next) => {
  try {
    const input = createTagSchema.parse(req.body);
    const tag = await prisma.tag.upsert({
      where: { name: input.name },
      create: { name: input.name },
      update: {},
    });
    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
});
