import type { NextFunction, Request, Response } from "express";
import { isOAuthConfigured } from "../auth/github.js";
import { readSessionUser } from "../auth/session.js";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!isOAuthConfigured()) {
    next();
    return;
  }

  const user = readSessionUser(req);
  if (!user) {
    res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Login required" },
    });
    return;
  }

  req.user = user;
  next();
}
