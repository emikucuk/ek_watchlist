import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { env } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { voiceService } from "../services/VoiceService.js";

export const voiceRouter = Router();

function requireVoiceKey(req: Request, res: Response, next: NextFunction) {
  if (!env.voiceApiKey) {
    res.status(503).json({
      ok: false,
      message: "Voice API kapalı. .env dosyasına VOICE_API_KEY ekle.",
    });
    return;
  }

  const key = String(req.query.key ?? req.headers["x-voice-key"] ?? "");
  if (key !== env.voiceApiKey) {
    res.status(401).json({
      ok: false,
      message: "Geçersiz API anahtarı",
    });
    return;
  }

  next();
}

voiceRouter.get("/add", requireVoiceKey, async (req, res, next) => {
  try {
    const query = String(req.query.q ?? "").trim();
    if (!query) {
      res.status(400).json({ ok: false, message: "Arama metni (q) gerekli" });
      return;
    }

    const result = await voiceService.addBySearchQuery(query);
    res.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        ok: false,
        message: error.message,
      });
      return;
    }
    next(error);
  }
});
