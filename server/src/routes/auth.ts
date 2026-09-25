import { Router } from "express";
import {
  buildAuthorizeUrl,
  exchangeCodeForProfile,
  isLoginAllowed,
  isOAuthConfigured,
} from "../auth/github.js";
import {
  clearSessionCookie,
  consumeOAuthState,
  createOAuthState,
  readSessionUser,
  setOAuthStateCookie,
  setSessionCookie,
} from "../auth/session.js";
import { logger } from "../config/logger.js";

export const authRouter = Router();

authRouter.get("/github", (_req, res) => {
  if (!isOAuthConfigured()) {
    res.status(503).json({ error: { message: "GitHub OAuth is not configured" } });
    return;
  }

  const state = createOAuthState();
  setOAuthStateCookie(res, state);
  res.redirect(buildAuthorizeUrl(state));
});

authRouter.get("/github/callback", async (req, res) => {
  try {
    if (!isOAuthConfigured()) {
      res.status(503).send("OAuth not configured");
      return;
    }

    const code = String(req.query.code ?? "");
    const state = String(req.query.state ?? "");
    if (!code || !consumeOAuthState(req, res, state)) {
      res.status(400).send("Invalid OAuth state");
      return;
    }

    const profile = await exchangeCodeForProfile(code);
    if (!isLoginAllowed(profile.login)) {
      logger.warn("OAuth login denied", { login: profile.login });
      res.status(403).send("Bu GitHub hesabının erişim izni yok.");
      return;
    }

    setSessionCookie(res, { id: profile.id, login: profile.login });
    res.redirect("/");
  } catch (error) {
    logger.error("OAuth callback failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).send("GitHub girişi başarısız.");
  }
});

authRouter.get("/me", (req, res) => {
  if (!isOAuthConfigured()) {
    res.json({ authRequired: false, user: null });
    return;
  }

  const user = readSessionUser(req);
  if (!user) {
    res.status(401).json({ authRequired: true, user: null });
    return;
  }

  res.json({ authRequired: true, user });
});

authRouter.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});
