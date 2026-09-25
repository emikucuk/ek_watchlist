import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { existsSync } from "node:fs";
import type { Server } from "node:http";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { prisma } from "./lib/prisma.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { authRouter } from "./routes/auth.js";
import { searchRouter } from "./routes/search.js";
import { itemsRouter } from "./routes/items.js";
import { categoriesRouter } from "./routes/categories.js";
import { tagsRouter } from "./routes/tags.js";
import { settingsRouter, backupRouter } from "./routes/settings.js";
import { voiceRouter } from "./routes/voice.js";
import { backupService } from "./services/BackupService.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (origin === env.clientOrigin) return true;
  if (origin === "http://127.0.0.1:5170") return true;
  if (origin === "https://ekwl.eminkucuk.online") return true;

  try {
    const { hostname } = new URL(origin);
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    if (hostname.endsWith(".ts.net")) return true;
  } catch {
    return false;
  }

  return false;
}

function resolveClientDist(): string | null {
  const candidates = [
    resolve(__dirname, "../../client/dist"),
    resolve(__dirname, "../../../client/dist"),
    resolve(process.cwd(), "client/dist"),
  ];
  for (const candidate of candidates) {
    if (existsSync(join(candidate, "index.html"))) {
      return candidate;
    }
  }
  return null;
}

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: env.isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:", "https://image.tmdb.org", "https://avatars.githubusercontent.com"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "data:"],
            formAction: ["'self'", "https://github.com"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
          },
        }
      : false,
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "healthy", service: "ek-watchlist" });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ek-watchlist" });
});

app.use("/auth", authRouter);
app.use("/api/voice", voiceRouter);

app.use("/api/search", requireAuth, searchRouter);
app.use("/api/items", requireAuth, itemsRouter);
app.use("/api/categories", requireAuth, categoriesRouter);
app.use("/api/tags", requireAuth, tagsRouter);
app.use("/api/settings", requireAuth, settingsRouter);
app.use("/api/backup", requireAuth, backupRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Not found" },
  });
});

if (env.isProduction) {
  const clientDist = resolveClientDist();
  if (clientDist) {
    app.use(express.static(clientDist, { index: false, maxAge: "1h" }));
    app.get("*", (_req, res) => {
      res.sendFile(join(clientDist, "index.html"));
    });
    logger.info("Serving client static files", { clientDist });
  } else {
    logger.warn("client/dist not found; API-only mode");
  }
}

app.use(errorHandler);

const server: Server = app.listen(env.port, "0.0.0.0", () => {
  logger.info(`EK Watchlist server listening on http://0.0.0.0:${env.port}`);
  backupService.startScheduler();
});

let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`Received ${signal}, shutting down...`);

  await new Promise<void>((resolvePromise) => {
    server.close(() => {
      logger.info("HTTP server closed");
      resolvePromise();
    });
  });

  await backupService.runShutdownBackup();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
