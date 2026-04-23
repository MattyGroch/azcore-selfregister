# AzerothCore Self-Registration Portal

A Discord-gated account portal for a private AzerothCore WoW server. Players sign in with Discord, and if they're a member of your Discord server they can create a game account or change their password. Authenticated users also see a list of their characters.

## Architecture

Two services, typically on different hosts:

- **`selfregister`** — the web portal (Node/Express/EJS/Tailwind). Deployed on your Traefik VM.
- **`azcore-proxy`** — a locked-down REST API that sits alongside your AzerothCore containers and handles all database access. Only reachable via a Bearer token.

```
Browser → Traefik → selfregister → azcore-proxy → acore_auth / acore_characters DB
                                  ↗ Discord API
```

## Prerequisites

- Docker + Portainer (or plain Docker Compose)
- Traefik reverse proxy with a `websecure` entrypoint and working cert resolver
- A Discord application with OAuth2 configured ([discord.com/developers](https://discord.com/developers/applications))
- AzerothCore running in Docker with its DB accessible on a named network

## Deployment

### 1. azcore-proxy (AzerothCore VM)

Copy `azcore-proxy/` to your AzerothCore VM.

```sh
cp azcore-proxy/.env.example azcore-proxy/.env
# Edit .env with your DB credentials and a generated API key
```

Update `azcore-proxy/docker-compose.yml` — set `ac-network.name` to match your AzerothCore stack's Docker network (`docker network ls` to find it).

Copy `azcore-proxy/traefik-route.yml` to your Traefik dynamic config directory. Edit it with your real hostname and the AzerothCore VM's LAN IP.

```sh
cd azcore-proxy && docker compose up -d --build
```

### 2. selfregister (Traefik VM)

Deploy via Portainer GitOps pointing at this repo. Set the following environment variables in Portainer's UI:

| Variable | Description |
|---|---|
| `SESSION_SECRET` | Random 48-byte hex string |
| `DISCORD_CLIENT_ID` | From Discord developer portal |
| `DISCORD_CLIENT_SECRET` | From Discord developer portal |
| `DISCORD_REDIRECT_URI` | `https://your-domain.com/auth/discord/callback` |
| `DISCORD_GUILD_ID` | Right-click your Discord server → Copy Server ID |
| `PROXY_URL` | `https://ac-proxy.your-domain.com` |
| `PROXY_API_KEY` | Must match `API_KEY` in azcore-proxy `.env` |
| `PORTAL_HOST` | Public hostname, e.g. `join-wow.your-domain.com` |
| `CLIENT_DOWNLOAD_URL` | *(optional)* Link to your pre-configured WoW client |
| `CLIENT_DOWNLOAD_PASSWORD` | *(optional)* Shown next to the download link |

Generate secrets with:
```sh
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

In Discord's developer portal, add your redirect URI under **OAuth2 → Redirects**.

### 3. Discord OAuth2 scopes

The app requests `identify` and `guilds`. No bot permissions are required.

## Notes

- Accounts are linked to Discord users via the `email` field in AzerothCore's `account` table (`discord:{user_id}`). No schema changes required.
- Passwords use AzerothCore's SRP6 implementation (`salt` + `verifier` columns).
- Session files are stored in a named Docker volume (`sessions`).
