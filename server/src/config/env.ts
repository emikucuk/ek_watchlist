import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootEnvPath = resolve(__dirname, "../../../.env");
const localEnvPath = resolve(__dirname, "../../.env");

config({ path: rootEnvPath });
config({ path: localEnvPath });

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production" || nodeEnv === "Production";

function parseAllowList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

export const env = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT ?? (isProduction ? 8080 : 3100)),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5170",
  tmdbApiKey: process.env.TMDB_API_KEY ?? "",
  githubRepoUrl: process.env.GITHUB_REPO_URL ?? "",
  githubPat: process.env.GITHUB_PAT ?? "",
  githubBranch: process.env.GITHUB_BRANCH ?? "main",
  /** 0 = scheduler off. Default 12 = twice daily. Use 24 for once daily. */
  backupIntervalHours: Number(process.env.BACKUP_INTERVAL_HOURS ?? 12),
  databaseUrl: process.env.DATABASE_URL ?? "",
  voiceApiKey: process.env.VOICE_API_KEY ?? "",
  githubOAuthClientId: process.env.GITHUB_OAUTH_CLIENT_ID ?? "",
  githubOAuthClientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET ?? "",
  githubOAuthCallbackUrl:
    process.env.GITHUB_OAUTH_CALLBACK_URL ??
    `${(process.env.CLIENT_ORIGIN ?? "http://localhost:5170").replace(/\/$/, "")}/auth/github/callback`,
  githubOAuthAllowedLogins: parseAllowList(
    process.env.GITHUB_OAUTH_ALLOWED_LOGINS ?? "emikucuk"
  ),
  sessionSecret:
    process.env.SESSION_SECRET ??
    (isProduction ? "" : randomBytes(32).toString("hex")),
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is required (postgresql://...)");
}

if (isProduction && !env.sessionSecret) {
  throw new Error("SESSION_SECRET is required in production");
}
