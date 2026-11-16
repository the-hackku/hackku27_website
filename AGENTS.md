# CLAUDE.md

Guidance for agents when working in this repo (HackKU hackathon platform). Stack: **Next.js 16 App Router, React 19, TypeScript 6, Tailwind 4, shadcn/ui (+ Base UI), Drizzle ORM (v1 RC, relations v2) on PostgreSQL, Better Auth, Zod 4, react-hook-form, Biome**. Details on auth live in `docs/auth.md` — read it before touching auth/RBAC.

## Commands & Workflow

Bun is the package manager and runtime. Scripts load `.env` and run with `--bun`; always use `bun run <script>` (not npm/npx). Copy `.env.example` → `.env` first.

```bash
bun install
bun run dev            # next dev
bun run build          # next build
bun run start          # next start
bun run fix            # biome check --write . (lint + format; there is no separate lint/format script)
bun run fix:error      # same, errors only
bun run db:up          # docker compose up -d (local Postgres)
bun run db:down        # docker compose down -v  (DESTROYS volumes/data)
bun run db:dev         # drizzle-kit push (sync schema directly; local dev only)
bun run db:generate    # drizzle-kit generate (create SQL migration from schema diff)
bun run db:migrate     # drizzle-kit migrate (apply migrations)
bun run db:studio      # drizzle-kit studio
bun run db:seed        # bun ./db/seed.ts
```

- No test framework is configured; verify with `bun run build` and `bun run fix`.
- Env: `DATABASE_URL` (app runtime), `DIRECT_URL` (Drizzle CLI, see `drizzle.config.ts`), `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `AUTH_{GOOGLE,GITHUB,DISCORD,MYMLH}_{ID,SECRET}`, `AUTH_RESEND_KEY`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_GOOGLE_API_KEY`, `NEXT_PUBLIC_OPENROUTESERVICE_API_KEY`.
- Bun gotchas: project is tuned for Bun 1.4+. The DB client uses `drizzle-orm/bun-sql`, so it only works under Bun (don't run db code via plain Node). If webpack/library breakage appears, check the Bun version first.
- Schema workflow: edit `db/schema.ts` → update `db/relations.ts` if relations change → `bun run db:generate` (commit migration) or `db:dev` locally.
- Path alias: `@/` = repo root. Biome formatting: 2 spaces, double quotes, imports auto-sorted — run `bun run fix` before finishing.

## Architecture & Project Layout

- `app/` — routes (`admin`, `profile`, `register`, `schedule`, `scanner`, `signin`, `signout`, `rules`, `legal`, `auth-error`), `app/api/auth` (Better Auth handler), `app/api/upload` (resume upload to Vercel Blob).
- `app/actions/` — Server Actions (`register.ts`, `events.ts`, `infoPage.ts`, `reservationRequest.ts`, `admin.ts`, `admin/`, `analytics/`). New mutations go here, one domain per file.
- `components/`
  - `ui/` — shadcn primitives; don't put app logic here.
  - `customui/` — app-wide custom inputs (`CountrySelect`, `PhoneInput`, `TimeInput`) and `customui/form-inputs/` (`FormInputField`, `FormSelectField`, `FormCheckboxField`, `FormCombobox`, `FormCountryField`, `FormPhoneField`, `OTPInput`) — react-hook-form-bound field wrappers; reuse these instead of raw inputs.
  - `forms/` — form components (`GenericForm` config-driven, `RegistrationForm`, `eventForm`) plus option data (`predefinedOptions.ts`, `schools.ts`).
  - `admin/` — admin dashboard pieces (tables, editable cells, dialogs, `charts/`, `ManualCheckin`, `EventEditor`).
  - `pages/` — page-level client views (`home`, `register`, `signin_verify`) composed by thin `app/**/page.tsx` files.
  - `email/` — React Email-style templates (`MagicLink.tsx`).
  - `hooks/` — client hooks (`use-mobile`).
  - Root-level shared components: `Header`, `Footer`, `ScheduleGrid`, `ScannerComponent`, `UserQRCode`, etc.
- `lib/` — `db.ts` (Drizzle client w/ relations), `auth/` (`auth.ts` server, `auth-client.ts` client, `permissions.ts` RBAC), `resend.ts`, `utils.ts`.
- `db/` — `schema.ts`, `relations.ts`, `seed.ts`. `types/` — shared types and Zod schemas (`types/schemas/participant.ts`, `types/form.ts`, `types/oauth/`). `constants.ts` — app constants (e.g. `supportEmail`). `scripts/` — one-off exports. `docs/` — reference docs.
- Placement: a new feature = route in `app/<feature>/page.tsx` (server component, does auth) → UI in `components/pages/` or a feature folder → mutations in `app/actions/<feature>.ts` → Zod schema in `types/schemas/` → tables in `db/schema.ts`.

## Authentication & Authorization

Better Auth (Drizzle adapter, `relations-v2`) in `lib/auth/auth.ts`. Sign-in: Email OTP, Google/GitHub/Discord OAuth, MyMLH (generic OAuth); passkeys must be linked to an existing account; TOTP 2FA mandatory for admins. Sign-in and sign-up are unified. Sessions last 7 days (sliding 24h); a 5-minute encrypted cookie cache exists.

**Roles** (lowercase, Better Auth admin plugin, default `hacker`): `hacker`, `mentor`, `judge`, `bronze_sponsor`, `silver_sponsor`, `gold_sponsor`, `volunteer`, `writer`, `admin`. Permission statements (resource → actions) live in `lib/auth/permissions.ts` (`ac`, `roles`); add new resources/actions there and grant them in each role. Silver/gold sponsors get `user_data:view_resumes`.

Retrieving sessions:
```ts
// Server Component / Server Action / route handler
import { headers } from "next/headers";
import { auth, hasPermissions } from "@/lib/auth/auth";
const session = await auth.api.getSession({ headers: await headers() });
// bypass cookie cache for sensitive reads:
// auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } })

// Client Component
import { useSession, authClient } from "@/lib/auth/auth-client";
const { data: session } = useSession();
```
`session.user` includes additional fields `role`, `isRegistered`, `prefillData`.

**Guard rules (required):**
1. `proxy.ts` (Next 16 replacement for middleware) only does optimistic redirects using `getSessionCookie` — it is **never** an authority. Never rely on it for access control.
2. Every protected Server Component/page and every Server Action must validate server-side: get the session, then `await hasPermissions(session, { <resource>: ["<action>"] })`. `hasPermissions` calls `unauthorized()` (no session) or `forbidden()` (insufficient rights) from `next/navigation` and returns `true` otherwise — do not wrap it in a try/catch that swallows these.
3. State-changing requests and any volunteer/admin action must bypass the cookie cache (DB lookup). `hasPermissions` uses `auth.api.userHasPermission` by userId, which checks against the DB; for role/identity data read from the session in these paths, pass `disableCookieCache`.
4. Admin operations also require 2FA to be set up.
5. Organizations/teams use the Better Auth organization plugin (`organization`, `member`, `invitation` tables).

## Data Mutations & Validation

- Mutations are `"use server"` functions in `app/actions/*.ts`, called directly from client components (no REST layer, except `/api/upload` for files).
- Order inside every action: (1) session via `auth.api.getSession` → (2) `hasPermissions` (or explicit ownership/`isRegistered` checks) → (3) validate input → (4) DB write (use `db.transaction` for multi-table writes) → (5) `revalidatePath(...)` for affected pages → (6) return.
- Validation: Zod 4 schemas shared between client form and server live in `types/schemas/` (e.g. `RegistrationData` from `types/schemas/participant.ts`). Client forms validate with `zodResolver`; **re-validate in the action with `schema.parse/safeParse`** — don't trust client types alone (some existing actions, e.g. `register.ts`/`events.ts`, only type-check; new/edited actions should parse).
- Return/error conventions in the existing code are not uniform: `registerUser` returns `{ success: true }` and `throw new Error("...")` on failure; `updateEvent` returns void and relies on `unauthorized()`/`forbidden()`. For new actions prefer returning `{ success: true, data? }` for expected outcomes, and throw (or call `unauthorized()`/`forbidden()`) for auth failures; client callers wrap calls in try/catch and surface errors via `sonner` toasts.
- Reads: use `db.query.<table>.findFirst/findMany` with relational-v2 object filters (`where: { id }`, `orderBy: { startDate: "asc" }`, `columns: {...}`); use `db.insert/update/delete` with `eq()` from `drizzle-orm` for writes.
- Forms: `components/forms/GenericForm.tsx` takes `{ schema, config, onSubmit, defaultValues, localStorageKey }` and uses react-hook-form (`mode: "onChange"`, `zodResolver`), with progress tracking and optional localStorage persistence. `RegistrationForm` uploads the resume to `POST /api/upload` first, then calls `registerUser(finalData, resumeUrl)`.

## Database & Schema

Drizzle on Postgres via `lib/db.ts` (`drizzle-orm/bun-sql`, `relations` from `db/relations.ts`). Table/enum names are camelCase exports in `db/schema.ts`, each with `XSelect`/`XInsert` inferred types; enums are `pgEnum` (e.g. `EventType`, `TicketType`, `TicketStatus`, `TimeSlot`, `RoomTheme`, `ReimbursementInviteStatus`) with exported union types.

- Better Auth tables: `user`, `account`, `session`, `verification`, `twoFactor`, `passkey` (managed by the library; don't hand-edit semantics). `user` carries `role`, `isRegistered`, `prefillData`, ban + 2FA fields.
- Domain: `participantInfo` (1:1 registration data for a user), `event`, `checkin` (attendance per user/event), `scanAttempt` (QR scan log), `travelReimbursement` + `reimbursementInvite`, `organization`/`member`/`invitation` (teams), `project`, `themedRoom`/`reservationRequest`/`themedRoomReservation`, `ticket`, `infoPageContent`.
- Conventions: every new table must be registered in the `schema` object **and** given relations in `db/relations.ts` (`defineRelations` with `r.one`/`r.many`), otherwise `db.query.<table>` won't work. Don't use `.references`-less FKs silently—mirror existing patterns when adding tables.
- Auth-adjacent tables passed to the adapter in `lib/auth/auth.ts` must be added there if Better Auth needs them.

## Integrations & Emails

- **Vercel Blob** — resume PDFs, uploaded via `app/api/upload` (`BLOB_READ_WRITE_TOKEN`); the resulting URL is stored in `participantInfo.resumeUrl`.
- **Resend** — email delivery (`lib/resend.ts`, `AUTH_RESEND_KEY`; `@react-email/render` to render templates). Used by Better Auth Email OTP: `components/email/MagicLink.tsx` takes `{ email, otp }`, builds a `${BETTER_AUTH_URL}/signin/verify?email=…&otp=…` link plus the PIN. Email conventions: plain table-free JSX with **inline styles** (no Tailwind/CSS classes from the app), a header, content, footer, support address from `constants.supportEmail`. (Mailgun from the old setup is gone.)
- **Google APIs / Sheets** — `googleapis` used for Sheets backup/export (admin page, `app/actions/reservationRequest.ts`) and public Google Maps key; `scripts/emailExporter.ts` for one-off exports. Verify current usage before relying on it.
- **MyMLH / OAuth providers** — configured in `lib/auth/auth.ts`; profile mapping fills `prefillData` for registration.
- **OpenRouteService / Leaflet** — maps/travel features (public key env var).
- Analytics: `@vercel/analytics`, `@vercel/speed-insights`.
