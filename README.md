# EK Watchlist

Kişisel film / dizi watchlist — React + Express + PostgreSQL + Docker.

Production: [ekwl.eminkucuk.online](https://ekwl.eminkucuk.online)

## Stack

- Client: Vite, React, Chakra, TanStack Query / Router
- Server: Express, Prisma, Zod
- DB: PostgreSQL (Docker `postgres` on Oracle)
- Edge: Caddy reverse proxy → `wl-api:8080`

## Environment Variables

Uygulama secret’ları **yalnızca sunucuda** `/opt/apps/.env` içinde tutulur; bu public repo’ya gitmez.

| Variable | Where | Description |
| --- | --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | `/opt/apps/.env` | Shared Postgres |
| `WATCHLIST_TMDB_API_KEY` | `/opt/apps/.env` | TMDB |
| `WATCHLIST_VOICE_API_KEY` | `/opt/apps/.env` | Voice / Siri endpoint |
| `WATCHLIST_GITHUB_*` | `/opt/apps/.env` | Optional JSON backup |
| `WATCHLIST_BACKUP_INTERVAL_HOURS` | `/opt/apps/.env` | Default `12` |
| `DATABASE_URL` | Compose | Built from Postgres creds → `watchlist` DB |
| `CLIENT_ORIGIN` | Compose | `https://ekwl.eminkucuk.online` |
| `PORT` | Compose | `8080` |

`.env.example` yalnızca isimleri belgelemek içindir; gerçek değer koyma.

## Docker

```bash
docker build -t wl-api .
```

Container `8080` dinler; host’ta publish edilmez. Caddy `wl-api:8080` proxy eder.

Entrypoint: `prisma migrate deploy` → `node server/dist/index.js`.

## Deploy (manuel)

Sunucu: `/opt/apps`

```bash
cd /opt/apps
docker compose build wl-api
docker compose up -d wl-api
docker compose logs --tail=100 wl-api
```

## Health

```bash
curl https://ekwl.eminkucuk.online/health
curl https://ekwl.eminkucuk.online/api/health
```

## Data export / import

```bash
npm run export:json -w server
npm run import:json -w server
```

Çıktı `watchlist-export.json` secret içerebilir — commit etme (gitignore’da).

GitHub otomatik yedek: `backups/` altında en fazla **5** snapshot tutulur; eski dosyalar silinir, repo history force-push ile sadeleştirilir.

## Troubleshooting

| Belirti | Kontrol |
| --- | --- |
| Restart loop | `docker compose logs --tail=100 wl-api` |
| DB refused | Host `postgres`, `backend` network |
| Caddy 502 | `docker compose ps` — `wl-api` healthy mi? |
| HTTPS | DNS `ekwl.eminkucuk.online` → Oracle IP |

## CI/CD

`main` push → GitHub Actions:

1. `npm ci` + Prisma generate + `npm run build`
2. `rsync` → `/opt/apps/apps/watchlist`
3. `docker compose build wl-api && up -d`
4. HTTPS health check

**GitHub Secrets** (Settings → Secrets and variables → Actions), environment: `production`:

| Secret | Value |
| --- | --- |
| `SSH_HOST` | Oracle public IP / hostname |
| `SSH_USER` | `ubuntu` |
| `SSH_PRIVATE_KEY` | Deploy private key (full PEM) |
| `SSH_PORT` | Optional, default `22` |

App secrets stay on the server (`/opt/apps/.env`) — never in GitHub.

## Auth (GitHub OAuth)

Production UI/API GitHub OAuth ile korunur. Allowlist: `GITHUB_OAUTH_ALLOWED_LOGINS`.

Açık kalanlar:
- `/health`, `/api/health`
- `/api/voice/*` (ayrı `VOICE_API_KEY`)
- `/auth/*`
