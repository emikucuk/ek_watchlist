import { Router } from "express";
import { createCategorySchema } from "../schemas/watchlist.js";
import { categoryRepository } from "../repositories/CategoryRepository.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (_req, res, next) => {
  try {
    const categories = await categoryRepository.list();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

categoriesRouter.post("/", async (req, res, next) => {
  try {
    const input = createCategorySchema.parse(req.body);
    const category = await categoryRepository.create(input);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

categoriesRouter.patch("/:id", async (req, res, next) => {
  try {
    const input = createCategorySchema.partial().parse(req.body);
    const category = await categoryRepository.update(req.params.id, input);
    res.json(category);
  } catch (error) {
    next(error);
  }
});

categoriesRouter.delete("/:id", async (req, res, next) => {
  try {
    await categoryRepository.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
