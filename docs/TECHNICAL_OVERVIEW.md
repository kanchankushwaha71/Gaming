## EpicEsports Technical Overview (Onboarding Guide)

This document helps new developers quickly understand how the EpicEsports project is structured and how its core systems work: authentication, data model, API routes, emails, payments, uploads, deployment, and common pitfalls.

### Tech Stack
- **Framework**: Next.js (App Router, TypeScript)
- **Auth**: NextAuth.js
- **Database/Storage**: Supabase (Postgres, Auth, Storage)
- **Emails**: Resend
- **Payments**: Razorpay
- **Deployment**: Vercel

### Repository Layout (key paths)
- `src/app/` App Router pages and API routes
  - `src/app/(...)/page.tsx` UI pages
  - `src/app/api/**/route.ts` API endpoints
- `src/components/` Shared components (admin, member, UI)
- `src/lib/` Service clients and utilities (`supabase.ts`, `resend.ts`)
- `public/` Static assets
- `docs/` Project docs
- `next.config.mjs` Next.js config
- `.env.local` Local env variables (not committed)

## 1) Authentication and Session Flow

### Summary
- Authentication uses NextAuth.js with Supabase as the backend (Postgres + Supabase Auth). Sessions are available both server-side (API routes) and client-side via `useSession()`.

### Relevant files
- `src/lib/supabase.ts`: Initializes Supabase clients and helpers.
- `src/app/api/register/route.ts`: Email/password registration endpoint (augments Supabase auth if needed and inserts profile rows).
- `src/app/api/login` (if present via NextAuth routes): NextAuth provider handling.
- Any page/component using `import { useSession } from "next-auth/react"` (e.g. `src/app/admin/page.tsx`, admin/member pages) to gate access.

### How it works
1. User signs in (NextAuth) → session stored via NextAuth adapter/session mechanism.
2. Client components call `useSession()` to get `{ data: session, status }` and guard UI/routes.
3. API routes read session via NextAuth helpers or rely on signed requests + server-side checks using Supabase Admin client.
4. Role checks: admins determined by `session.user.role === 'admin'` or via `profileData.role` from `player_profiles`.

### Common patterns
- Always null-check `session` and use `status === 'authenticated'` before showing admin/member-only UI.
- Server routes validate authorization/roles before mutating data.

## 2) Environment Variables & Configuration

Set in `.env.local` (dev) and Vercel Project Settings (prod):
- `NEXTAUTH_URL` e.g. `http://localhost:3002` (dev) and `https://www.epicesports.tech` (prod)
- `FROM_EMAIL` e.g. `noreply@epicesports.tech`
- `RESEND_API_KEY` Resend API key
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` Razorpay key for client usage
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` Razorpay server keys
- `NEXT_PUBLIC_RAZORPAY_PAYMENT_PAGE_URL` Razorpay Payment Page URL (e.g., `https://rzp.io/l/yx1fpUA`)
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

Related:
- `next.config.mjs`
  - `images.remotePatterns` allow Supabase storage URLs.
  - `env` shims for client-side where needed.
  - In this project, TS build errors are ignored to avoid blocking deploys: `typescript: { ignoreBuildErrors: true }`.

## 3) Data Model Overview

Key tables (Supabase/Postgres):
- `player_profiles` (user metadata, role)
- `tournaments` (tournament info, banner image, game type, counters)
- `registrations` (tournament registrations, status, transaction IDs)
- `player_notifications` (emails/notifications audit log)

Indexes and RLS exist on these tables. See SQL migration(s) such as `create_notifications_table.sql` for structure, RLS, and indexes. If missing in a new environment, create accordingly.

Conceptual ERD:
- User has one `player_profiles` row
- A `tournaments` row has many `registrations`
- `player_notifications` reference recipients and email meta

## 4) Emails (Resend) and Templates

### Relevant files
- `src/lib/resend.ts`: Resend client and HTML template builders
  - Templates: `matchReminder`, `matchCredentials`, `customNotification`
- Admin notifications: `src/app/api/admin/notify-players/route.ts`
- Member credential emails:
  - `src/app/api/member/send-credentials/route.ts`
  - `src/app/api/member/send-credentials/bulk/route.ts`

### Flow
1. Caller (admin/member actions) hits API route with payload.
2. API builds HTML via `src/lib/resend.ts` and sends email using Resend API.
3. Success/failure is logged, and relevant records are inserted into `player_notifications` as audit trail.

### Notes
- Ensure `FROM_EMAIL` domain is verified in Resend.
- Avoid sending from unverified domains.

## 5) Payments (Razorpay) and Registration Verification

### Relevant files
- UI: `src/components/TournamentRegistrationForm.tsx`
- Success redirect handler: `src/app/payment/success/page.tsx`
- Verification API: `src/app/api/payment/verify/route.ts`
- Tournament registration API: `src/app/api/tournaments/registration/route.ts`

### Flow (Payment Page redirect variant)
1. User registers from tournament page. Client creates a pending registration (or captures intent) and redirects to Razorpay Payment Page with correct key and amount.
2. Razorpay redirects back to `https://www.epicesports.tech/payment/success` with URL params.
3. `payment/success` page calls `/api/payment/verify` with the payment identifiers.
4. The verify endpoint:
   - Fetches the matching pending registration via `user_id`/`email` or fallback strategies (with retry).
   - Marks registration as paid/confirmed, updates `tournaments.current_teams` counters, and stores transaction IDs.
5. UI updates and user sees confirmation.

### Notes
- Ensure `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` are set in prod.
- **CRITICAL**: `NEXT_PUBLIC_RAZORPAY_PAYMENT_PAGE_URL` must point to the actual Razorpay Payment Page URL (e.g., `https://rzp.io/l/yx1fpUA`), NOT to a page on your own website.
- Old Vercel Authentication/Password Protection can block API routes—disable these project-level protections in Vercel for production.

## 6) Uploads and Images (Supabase Storage)

### Relevant files
- Upload API: `src/app/api/upload/route.ts` (stores to Supabase Storage bucket `tournament-banners` in prod; local fs in dev)
- Tournament create page: `src/app/tournaments/create/page.tsx` (selects/preview banner; posts to upload API; saves URL on submit)
- Tournament details: `src/app/tournaments/[id]/page.tsx` (displays `bannerImage` if set; fallback to default `gameImage`)
- Supabase helpers: `src/lib/supabase.ts` with `transformTournamentFromDB`

### Image Optimization
- `next.config.mjs` allows remote Supabase storage URLs via `images.remotePatterns`.
- For Supabase image URLs, `Image` may use `unoptimized` to bypass Next Optimizer when needed.

## 7) API Routes (Key Endpoints)

Admin
- `POST /api/admin/notify-players` send custom notifications to players
- `GET /api/admin/users` admin users listing
- `GET /api/admin/stats` basic admin stats

Payments/Registration
- `POST /api/tournaments/registration` create or update registration intent
- `POST /api/payment/verify` verify Razorpay payment and finalize registration

Members
- `POST /api/member/send-credentials` send credentials to one recipient
- `POST /api/member/send-credentials/bulk` send to all paid/confirmed registrations
- `GET /api/member/my-credentials` fetch received credentials for a user

Debug/Utility (may be pruned in prod)
- `GET /api/debug/env-check` view critical env presence (redacted)
- `GET /api/test-simple` connectivity check
- `POST /api/debug/test-email` test email send

## 8) Pages and Component Flows

Admin Dashboard `src/app/admin/page.tsx`
- Tabs for users, tournaments, payments, fix-registrations, and notifications
- Uses `useSession` to show admin-only UI
  - Notify Players uses `src/components/admin/PlayerNotificationForm.tsx` → `/api/admin/notify-players`

Member Dashboard `src/app/member/page.tsx`
- Shows registrations and quick actions
- Admins get bulk send controls; users see their received credentials

Tournament Create `src/app/tournaments/create/page.tsx`
- Form to create tournaments, supports banner upload via `/api/upload`

Tournament Details `src/app/tournaments/[id]/page.tsx`
- Displays tournament info, calls registration/payment initiation

Header `src/components/Header.tsx`
- Dropdown/menu auto-closes on route changes

## 9) Operational Playbook (Deploy & Config)

### Dev Setup
1. Copy `.env.local.example` → `.env.local` and fill keys.
2. `npm install` then `npm run dev`.
3. Ensure Supabase tables exist (especially `player_notifications`).

### Deployment (Vercel)
1. Configure all env vars in Vercel Project Settings.
2. Disable Vercel Authentication/Password Protection/Trusted IPs for public APIs.
3. `next.config.mjs` is set to ignore TS build errors—treat as a stopgap and fix types gradually.

### Email Domain
- Verify sender domain (e.g., `epicesports.tech`) in Resend and use `noreply@epicesports.tech`.

### Payment Redirects
- In Razorpay dashboard, set success redirect to `https://www.epicesports.tech/payment/success`.

## 10) Troubleshooting & Common Pitfalls

- 500 on API endpoints in prod → Check Vercel Authentication/Password Protection/Trusted IPs; verify env vars are set.
- Resend 403 (domain not verified) → Use verified sender domain and correct `FROM_EMAIL`.
- Images not loading → Ensure `images.remotePatterns` and that Storage bucket/object is public or signed URLs are handled.
- Registration stuck in pending → Review `/api/payment/verify` logs; confirm redirect URL and transaction IDs.
- **Payment page 404 error** → Check `NEXT_PUBLIC_RAZORPAY_PAYMENT_PAGE_URL` points to actual Razorpay Payment Page URL, not your own website.
- TypeScript errors blocking local builds → Fix types or rely on `ignoreBuildErrors` (temporary) to proceed.

## 11) Coding Standards

- Prefer clear, descriptive names; early returns; handle null/edge cases.
- Avoid deep nesting; add concise comments only for non-obvious logic.
- Match existing formatting; avoid reformatting unrelated code in edits.

## 12) Where to Start as a New Dev

1. Read `src/lib/supabase.ts` and `src/lib/resend.ts` to understand core integrations.
2. Skim admin/member pages for flows (`src/app/admin/*`, `src/app/member/page.tsx`).
3. Review payment registration and verification endpoints.
4. Verify your local `.env.local` and run through a test registration + email send.

---

If anything here is outdated or unclear, update this doc alongside your code changes.

c## 13) Diagrams

### Data Model ERD
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  player_profiles│    │   tournaments   │    │  registrations  │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (uuid)       │    │ id (uuid)       │    │ id (uuid)       │
│ user_id (uuid)  │    │ name (text)     │    │ user_id (uuid)  │
│ email (text)    │    │ description     │    │ tournament_id   │
│ role (text)     │    │ game_type       │    │ team_name       │
│ created_at      │    │ banner_image    │    │ status          │
│ updated_at      │    │ game_image      │    │ transaction_id  │
└─────────────────┘    │ max_teams       │    │ payment_id      │
                       │ current_teams   │    │ created_at      │
                       │ entry_fee       │    │ updated_at      │
                       │ start_date      │    └─────────────────┘
                       │ end_date        │             │
                       │ created_at      │             │
                       │ updated_at      │             │
                       └─────────────────┘             │
                                │                      │
                                └──────────────────────┘
                                        │
                                        ▼
                              ┌─────────────────┐
                              │player_notifications│
                              ├─────────────────┤
                              │ id (uuid)       │
                              │ recipient_email │
                              │ subject         │
                              │ message         │
                              │ sent_by         │
                              │ created_at      │
                              └─────────────────┘
```

### Authentication Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │  NextAuth   │    │  Supabase   │    │   Client    │
│             │    │             │    │             │    │             │
└─────┬───────┘    └─────┬───────┘    └─────┬───────┘    └─────┬───────┘
      │                  │                  │                  │
      │ 1. Sign In       │                  │                  │
      ├─────────────────►│                  │                  │
      │                  │ 2. Auth Check    │                  │
      │                  ├─────────────────►│                  │
      │                  │ 3. User Data     │                  │
      │                  │◄─────────────────┤                  │
      │ 4. Session       │                  │                  │
      │◄─────────────────┤                  │                  │
      │                  │                  │                  │
      │                  │                  │                  │ 5. useSession()
      │                  │                  │                  ├─────────►
      │                  │                  │                  │
      │                  │                  │                  │ 6. {data, status}
      │                  │                  │                  │◄─────────
```

### Payment Flow (Razorpay Payment Page)
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │   Client    │    │  Razorpay   │    │   Server    │
│             │    │             │    │             │    │             │
└─────┬───────┘    └─────┬───────┘    └─────┬───────┘    └─────┬───────┘
      │                  │                  │                  │
      │ 1. Register      │                  │                  │
      ├─────────────────►│                  │                  │
      │                  │ 2. Create Reg    │                  │
      │                  ├─────────────────►│                  │
      │                  │ 3. Reg ID        │                  │
      │                  │◄─────────────────┤                  │
      │                  │ 4. Redirect      │                  │
      │                  │    to Payment    │                  │
      │                  ├─────────────────►│                  │
      │ 5. Payment UI    │                  │                  │
      │◄─────────────────┤                  │                  │
      │                  │                  │                  │
      │ 6. Complete      │                  │                  │
      ├─────────────────►│                  │                  │
      │                  │ 7. Redirect      │                  │
      │                  │    to Success    │                  │
      │                  ├─────────────────►│                  │
      │                  │                  │                  │ 8. Verify Payment
      │                  │                  │                  ├─────────►
      │                  │                  │                  │
      │                  │                  │                  │ 9. Update Status
      │                  │                  │                  │◄─────────
      │ 10. Confirmation │                  │                  │
      │◄─────────────────┤                  │                  │
```

### Email System Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Admin/    │    │   API       │    │   Resend    │    │   Database  │
│   Member    │    │   Route     │    │             │    │             │
└─────┬───────┘    └─────┬───────┘    └─────┬───────┘    └─────┬───────┘
      │                  │                  │                  │
      │ 1. Send Request  │                  │                  │
      ├─────────────────►│                  │                  │
      │                  │ 2. Build HTML    │                  │
      │                  │    Template      │                  │
      │                  ├─────────────────►│                  │
      │                  │ 3. Send Email    │                  │
      │                  ├─────────────────►│                  │
      │                  │ 4. Email Sent    │                  │
      │                  │◄─────────────────┤                  │
      │                  │ 5. Log to DB     │                  │
      │                  ├─────────────────►│                  │
      │ 6. Success       │                  │                  │
      │◄─────────────────┤                  │                  │
```

### Component Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        App Router Structure                     │
├─────────────────────────────────────────────────────────────────┤
│ src/app/                                                        │
│ ├── (auth)/                                                     │
│ │   ├── login/page.tsx                                          │
│ │   └── register/page.tsx                                       │
│ ├── admin/                                                      │
│ │   ├── page.tsx (Dashboard)                                   │
│ │   ├── tournaments/page.tsx                                    │
│ │   ├── payments/page.tsx                                       │
│ │   └── fix-registrations/page.tsx                              │
│ ├── member/                                                     │
│ │   └── page.tsx (My Teams)                                    │
│ ├── tournaments/                                                │
│ │   ├── create/page.tsx                                         │
│ │   └── [id]/page.tsx                                           │
│ ├── payment/                                                    │
│ │   └── success/page.tsx                                        │
│ └── api/                                                        │
│     ├── admin/                                                  │
│     │   ├── notify-players/route.ts                             │
│     │   ├── users/route.ts                                      │
│     │   └── stats/route.ts                                      │
│     ├── member/                                                 │
│     │   ├── send-credentials/route.ts                           │
│     │   ├── send-credentials/bulk/route.ts                      │
│     │   └── my-credentials/route.ts                             │
│     ├── tournaments/                                            │
│     │   └── registration/route.ts                               │
│     ├── payment/                                                │
│     │   └── verify/route.ts                                     │
│     ├── upload/route.ts                                         │
│     └── register/route.ts                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Component Hierarchy                        │
├─────────────────────────────────────────────────────────────────┤
│ src/components/                                                 │
│ ├── Header.tsx (Global Navigation)                              │
│ ├── admin/                                                      │
│ │   └── PlayerNotificationForm.tsx                              │
│ ├── TournamentRegistrationForm.tsx                              │
│ └── UI Components (Buttons, Cards, etc.)                       │
└─────────────────────────────────────────────────────────────────┘
```

### File Dependencies Map
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Pages/        │    │   Components/   │    │   API Routes/   │
│   Components    │    │                 │    │                 │
└─────┬───────────┘    └─────┬───────────┘    └─────┬───────────┘
      │                      │                      │
      │ useSession()         │                      │
      ├─────────────────────►│                      │
      │                      │                      │
      │                      │                      │ Supabase Admin
      │                      │                      ├─────────────►
      │                      │                      │
      │                      │                      │ Resend API
      │                      │                      ├─────────────►
      │                      │                      │
      │                      │                      │ Razorpay API
      │                      │                      ├─────────────►
      │                      │                      │
      │                      │                      │
      │ src/lib/supabase.ts  │                      │
      ├─────────────────────►│                      │
      │                      │                      │
      │ src/lib/resend.ts    │                      │
      ├─────────────────────►│                      │
```


