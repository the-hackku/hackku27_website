# Developer Environment

> [!WARNING]
> **Bun version**: Use Bun v1.4. Many issues are caused by a mismatched Bun version.
> You can find the command to install Bun on your device on the [official Bun.js website](https://bun.com).

## 1. Clone and install

```bash
git clone https://github.com/the-hackku/hackku27_website
cd hackku27_website
```

## 2. Configure environment variables

Copy the example file and fill in values:

```bash
cp .env.example .env
```

Required variables:

| Variable                                  | Description                                                                               |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| `DATABASE_URL`                            | Database connection URL used by code                                                      |
| `DIRECT_URL`                              | Database connection URL used by CLI tools                                                 |
| `BETTER_AUTH_URL`                         | Full URL of the app (e.g. `http://localhost:3000`)                                        |
| `BETTER_AUTH_SECRET`                      | Random secret for Better Auth (generate with `bunx --bun @better-auth/cli@latest secret`) |
| `AUTH_RESEND_KEY`                         | API key for Resend                                                                        |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`   | Google OAuth app credentials                                                              |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`   | GitHub OAuth app credentials                                                              |
| `AUTH_DISCORD_ID` / `AUTH_DISCORD_SECRET` | Discord OAuth app credentials                                                             |
| `AUTH_MYMLH_ID` / `AUTH_MYMLH_SECRET`     | MyMLH OAuth app credentials                                                               |
| `GOOGLE_SERVICE_ACCOUNT_KEY`              | JSON key for Google Sheets export (base64 or raw)                                         |
| `NEXT_PUBLIC_GOOGLE_API_KEY`              | Google API key (public, used client-side)                                                 |
| `BLOB_READ_WRITE_TOKEN`                   | Vercel Blob token for resume uploads                                                      |

## 3. Install packages

Install packages using Bun:

```bash
bun i
```

## 4. Start the database

A Docker Compose file is included for local Postgres:

```bash
bun run db:up
```

This starts a `postgres:18` container on port `5432` with:

- User: `hackku`, Password: `hackku`, Database: `hackku_dev`

Set `DATABASE_URL` accordingly:

```
DATABASE_URL="postgresql://hackku:hackku@localhost:5432/hackku_dev"
```

## 5. Run database migrations

```bash
bun run db:dev
```

This applies all migrations to the database defined in .env. Run this after schema changes before running the server.

## 6. Start the development server

```bash
bun run dev
```

Visit `http://localhost:3000`.

## Other useful commands

```bash
bun run build          # Production build
bun run biome          # Runs Biome.js checks and writes safe fixes/formatting
bun run generate       # Generates the Prisma client (use for typechecking, before running the server)
bun run db:down        # Stop the local Postgres container
bun run db:studio      # Browse the database in a GUI

cwebp -preset drawing -q 50 -m 6 -af -sns 80 -alpha_q 50 -mt doodle.png -o doodle.webp # Compress doodle to WEBP
```
