# HackKU Management System

## Overview

The **HackKU Management System** manages hackathon logistics for HackKU 2027, from participant registration to event check-ins. It provides organizers and admins with tools to manage users, events, and real-time attendance through a web interface.

## Features

- **User Registration & Login**: Sign in using email magic links or OAuth (Google, GitHub, Discord, MyMLH).
- **QR Code Check-Ins**: Participants receive QR codes to check into events.
- **Admin Dashboard**: Full control over users, events, and check-in stats.
- **Real-time Tracking**: Track attendance and check-ins in real time.
- **Data Export**: Back up registration data to Google Sheets; download resume PDFs.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js server actions, Prisma ORM, PostgreSQL
- **Auth**: Better Auth v1.6 — email magic links + Google / GitHub / Discord OAuth
- **Storage**: Vercel Blob (resume PDFs)
- **Email**: Resend
- **Deployment**: Vercel

## Development Setup

See [CONTRIBUTING.md](CONTRIBUTING.md) for instructions on setting up a development environment.

## Important Files

### `constants.ts` (root)

**The primary file to update when preparing for a new hackathon year.** Contains site-wide values used across pages, emails, and registration logic:

```ts
const constants = {
  hackathonName: "HackKU27",
  dates: "April 17th - 19th, 2027",
  location: "The University of Kansas",
  discordInvite: "https://discord.gg/...",
  instagramUrl: "https://instagram.com/hackku",
  supportEmail: "hack@ku.edu",
  cutoffDate: "2026-04-17T00:00:00.000Z", // registration closes
  startDate: "2026-04-17T22:00:00.000Z", // check-in opens (5 PM CDT Friday)
  endDate: "2026-04-19T20:00:00.000Z", // closing ceremony ends (3 PM CDT Sunday)
};
```

### `prisma/schema.prisma`

Database schema. After edits, run `npx prisma migrate dev` to apply changes and regenerate the client.

### `app/actions/`

Server actions called directly from client components. Key actions:

- `register.ts` — creates `ParticipantInfo`, exports row to Google Sheets
- `checkin.ts` — validates QR codes and records `Scan` / `Checkin` entries

### `middlewares/`

`isAdmin()` and `isAdminOrVolunteer()` helpers that guard server actions and admin pages.
