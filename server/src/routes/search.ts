import { Router } from "express";
import { tmdbService } from "../services/TmdbService.js";
import { ValidationError } from "../errors/AppError.js";

export const searchRouter = Router();

searchRouter.get("/", async (req, res, next) => {
  try {
    const query = String(req.query.q ?? "");
    if (!query.trim()) {
      throw new ValidationError("Query parameter 'q' is required");
    }
    const results = await tmdbService.search(query);
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

searchRouter.get("/details/:type/:id", async (req, res, next) => {
  try {
    const type = req.params.type;
    if (type !== "movie" && type !== "tv") {
      throw new ValidationError("Type must be 'movie' or 'tv'");
    }
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      throw new ValidationError("Invalid TMDB id");
    }
    const details = await tmdbService.getDetails(type, id);
    res.json(details);
  } catch (error) {
    next(error);
  }
});
