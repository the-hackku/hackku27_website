# Authentication System

This document covers the identity model, session lifecycle, caching boundaries, and Role-Based Access Control (RBAC) implementation for the HackKU platform.

## Architecture Overview

HackKU uses **Better Auth** as its core authentication library. User identity centers on a single canonical User record tied to a unique email address.

```
[ Incoming Request ] 
        │
        ▼
[ Proxy (proxy.ts) ] ── (Cookie check for optimistic redirects)
        │
        ▼
[ Application Server ] ─── (Validates session state & RBAC rules against DB/Cache)
```

### Key Technical Constraints

* Canonical Identity: Email addresses are strictly unique across all authentication methods.

* Authentication Options: Users can sign in via Email OTP or OAuth. Passkeys are supported as a passwordless secondary option, but must be linked to an existing account prior to use.

* Admin Security: Two-Factor Authentication (TOTP) is strictly enforced for admin role members.

## Authentication Flows
### 1. Unified Sign-In / Sign-Up

The user-facing authentication flow treats sign-ins and sign-ups identically. If an email address does not exist during an Email OTP or OAuth attempt, a new account is automatically provisioned and linked.
### 2. Passkey Authentication

Passkeys require explicit account association. Unauthenticated users cannot register a new account using a passkey alone; they must first authenticate via Email OTP or OAuth and register the passkey from their account settings.
### 3. Two-Factor Authentication

* Users can optionally register time-based OTP (TOTP) authenticators.

* Accounts flagged with the admin role are blocked from executing administrative operations until 2FA is configured and verified.

## Session Management & Cookie Caching

To minimize database overhead on high-traffic routes, the platform uses an encrypted cookie caching layer alongside database session tracking.
### Session Lifecycle

* Duration: Sessions are valid for 7 days.

* Sliding Window: Active sessions extend by 24 hours after every 24-hour window of continuous activity.

* Source of Truth: The database remains the final authority for session validity and rights verification.

### Cookie Cache Rules

Encrypted session payloads are cached in the browser cookie for up to 5 minutes to speed up standard page loads.

> [!WARNING]
> ⚠️ SECURITY BOUNDARY: Edge Proxy & Cache Bypass
> 
> proxy.ts Limitations: The proxy performs optimistic checks using cached cookies for fast UX redirects. proxy.ts is never an authority for access control. All API endpoints and protected server components must validate sessions on the server.
> 
> Mandatory Cache Bypass: The 5-minute cookie cache must be bypassed—forcing a direct database lookup—for:
> 
> 1. Any state-changing request (Data writes/deletes).
> 
> 2. Any action executed by a volunteer role.
> 
> 3. Any action executed by an admin role.

## Authorization Model (RBAC)

Access control is governed by permissions.ts, mapping application Roles to explicit Resources and Actions.

### Resources and Supported Actions

| Resource | Supported Actions | Description |
| :--- | :--- | :--- |
| `mentor_tickets` | `create`, `manage`, `claim`, `view` | Support requests submitted by hackers to mentors. |
| `organizer_tickets` | `create`, `manage`, `claim`, `view` | Internal operational tickets for event staff. |
| `travel_reimbursements` | `request`, `manage`, `invite`, `view`, `delete` | Travel stipend applications and approvals. |
| `room_reservations` | `create`, `manage`, `view`, `delete` | Booking requests for physical event spaces. |
| `themed_rooms` | `create`, `manage`, `view`, `delete` | Special room assignments and theme management. |
| `projects` | `create`, `disqualify`, `view`, `delete` | Hackathon project submissions and moderation. |
| `teams` | `create`, `view`, `invite` | Organization and team collaboration boundaries. |
| `quests` | `create`, `view`, `complete`, `force_complete` | Event gamification tasks and completion tracking. |
| `info_pages` | `manage` | System documentation and public information pages. |
| `blog_posts` | `create`, `manage`, `delete` | Announcements and editorial content. |
| `checkins` | `perform`, `view`, `manage`, `delete` | Event check-in and QR scan operations. |
| `events` | `create`, `manage`, `delete` | Hackathon schedule and activity records. |
| `organizer_tasks` | `create`, `view`, `manage` | Internal task delegation for staff. |
| `judging` | `participate`, `manage`, `view` | Project scoring and judge management. |
| `user_data` | `view_resumes`, `view`, `manage` | PII access, including hacker resume reviews. |
| `mass_registrations` | `create`, `view`, `manage` | Bulk registration tools for schools and groups. |

### Role Capabilities
| Role | Operational Scope |
| :--- | :--- |
| `hacker` | **Standard Participant.** Can create projects/teams, submit support requests, apply for travel reimbursements, and complete quests. |
| `mentor` | **Participant Support.** Can view, claim, and resolve `mentor_tickets`, and submit `organizer_tickets`. |
| `judge` | **Evaluator.** Access to judging workflows and project review tools. |
| `bronze_sponsor` | **Sponsor (Bronze Tier).** Can create organizer support tickets. |
| `silver_sponsor` | **Sponsor (Silver Tier).** Bronze permissions + access to view participant resumes (`user_data:view_resumes`). |
| `gold_sponsor` | **Sponsor (Gold Tier).** Bronze permissions + access to view participant resumes (`user_data:view_resumes`). |
| `volunteer` | **Event Operations.** Can execute attendee check-ins, oversee quests, view projects/teams, and manage ticketing. |
| `writer` | **Content Editor.** Can write and edit blog posts. |
| `admin` | **System Administrator.** Full platform access across all resources. Mandatory 2FA requirement. |

## Data Schema Reference
### Core Identity & Authentication
#### `User` (mapped to `user`)

Central identity model.
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Primary Key. |
| `name` | String | User display name. |
| `email` | String | Unique email address. |
| `role` | String? | Primary system role (Defaults to `HACKER`). |
| `emailVerified` | Boolean | Email verification status. |
| `image` | String? | Avatar image URL. |
| `twoFactorEnabled` | Boolean? | Flag indicating active 2FA. |
| `totpSecret` | String? | Encrypted TOTP secret key. |
| `totpBackupCodes` | String[] | Emergency account recovery codes. |
| `banned` / `banReason` / `banExpires` | Misc | Account ban tracking fields. |
| `isRegistered` | Boolean | Indicates completed event registration. |
| `prefillData` | Json? | Form pre-fill cache for onboarding. |
| `createdAt` / `updatedAt` | DateTime | Audit timestamps. |

#### `Account` (mapped to `account`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Primary Key. |
| `userId` | String | FK to `User`. |
| `providerId` | String | Auth provider name (`google`, `github`, `email`, etc.). |
| `accountId` | String | Provider's unique user identifier. |
| `accessToken` / `refreshToken` | String? | OAuth token storage. |
| `accessTokenExpiresAt` / `refreshTokenExpiresAt` | DateTime? | Token validity trackers. |
| `scope` / `idToken` | String? | OAuth metadata. |
| `password` | String? | Hashed password storage (not used). |

#### `Session` (mapped to `session`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Primary Key. |
| `userId` | String | FK to `User`. |
| `token` | String | Cookie bearer token value. |
| `expiresAt` | DateTime | Database expiration threshold. |
| `ipAddress` / `userAgent` | String? | Client request context. |
| `impersonatedBy` | String? | Admin ID if the session is an impersonation context. |
| `activeOrganizationId` / `activeTeamId` | String? | Active workspace context for multi-tenant views. |

> `Verification`, `TwoFactor`, and `Passkey` are managed by Better Auth and hold no relevance to developers

#### Groups & Organizations

Organizations represent teams, mass registration groups, and generic member collections.

* Organization: Group entity holding a slug, optional logo, creator reference (creatorId), and an optional linked hackathon `Project`.

* Member: Joins a User to an Organization with an assigned organization role.

* Invitation: Tracks pending invites via email and status (pending, accepted, expired).