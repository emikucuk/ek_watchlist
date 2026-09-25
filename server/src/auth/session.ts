import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { env } from "../config/env.js";

export interface SessionUser {
  id: number;
  login: string;
}

const SESSION_COOKIE = "wl_session";
const STATE_COOKIE = "wl_oauth_state";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function b64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", env.sessionSecret).update(payload).digest("base64url");
}

function cookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeMs,
  };
}

export function createOAuthState(): string {
  return randomBytes(24).toString("hex");
}

export function setOAuthStateCookie(res: Response, state: string): void {
  res.cookie(STATE_COOKIE, state, cookieOptions(1000 * 60 * 10));
}

export function consumeOAuthState(req: Request, res: Response, state: string): boolean {
  const expected = req.cookies?.[STATE_COOKIE];
  res.clearCookie(STATE_COOKIE, { path: "/" });
  if (!expected || typeof expected !== "string" || !state) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(state);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function setSessionCookie(res: Response, user: SessionUser): void {
  const body = b64url(
    JSON.stringify({
      id: user.id,
      login: user.login,
      exp: Date.now() + MAX_AGE_MS,
    })
  );
  const token = `${body}.${sign(body)}`;
  res.cookie(SESSION_COOKIE, token, cookieOptions(MAX_AGE_MS));
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.clearCookie(STATE_COOKIE, { path: "/" });
}

export function readSessionUser(req: Request): SessionUser | null {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token || typeof token !== "string") return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      id: number;
      login: string;
      exp: number;
    };
    if (!parsed?.id || !parsed?.login || !parsed?.exp) return null;
    if (Date.now() > parsed.exp) return null;
    return { id: parsed.id, login: parsed.login };
  } catch {
    return null;
  }
}
