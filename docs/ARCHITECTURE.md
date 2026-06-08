# NomanStop Architecture Guide

A plain-English guide for how this app is built, what to name things, and what to add later.

---

## 1. Plain English — what each name means

If folder names confuse you, use this table:

| Code name | Plain English | What it does |
|-----------|---------------|--------------|
| `app/` | **Routes** | Tells the phone which screen to open. No logic. |
| `features/auth` | **Login feature** | Sign up, sign in, save session |
| `features/onboarding` | **First-time setup** | Pick interests + people to follow |
| `features/home` | **Home tab** | Your main feed (placeholder for now) |
| `features/explore` | **Explore tab** | Discover topics (placeholder for now) |
| `shared/` | **Shared UI + helpers** | Colors, layout shell, API fetch |
| `api-gateway` | **The front door** | Only part of backend the phone talks to |
| `auth-service` | **User database service** | Login, profiles, follows (today it does auth + users) |
| `postgres` | **The database** | Stores users, passwords, interests, follows |

You do **not** need to rename folders to understand the app. The names above are the mental model.

---

## 2. Languages — one language is best (for now)

### Recommendation: **TypeScript everywhere**

| Part | Language | Why |
|------|----------|-----|
| Mobile app | TypeScript (Expo / React Native) | Same language as backend, huge community |
| Backend services | TypeScript (NestJS) | Same team, shared types possible later |
| Database | SQL (via Prisma) | Prisma generates TypeScript for you |

### Do NOT use different languages per service yet

Some big companies use Go, Python, or Java for different services. That makes sense when:

- Teams are huge (50+ engineers)
- One service has a special need (e.g. Python for AI)

**For NomanStop today:** one language (TypeScript) = faster development, easier debugging, less confusion.

| Future service | Language when you build it |
|----------------|----------------------------|
| Messages / chat | TypeScript (NestJS) — same as now |
| Explore / search | TypeScript (NestJS) — same as now |
| Feed / posts | TypeScript (NestJS) — same as now |
| AI recommendations (later) | Maybe Python — only if you add ML models |

**Rule:** Stay on TypeScript until you have a strong reason to switch.

---

## 3. Backend design — one service per job

Today you have **2 services**. In production you grow **one service per major feature**.

### Today (what exists)

```
Phone
  │
  ▼
api-gateway          ← HTTP, port 3000, public
  │
  ▼
auth-service         ← TCP, port 4000, private (login + users + DB)
  │
  ▼
postgres
```

### Tomorrow (recommended split)

```
Phone
  │
  ▼
api-gateway                    ← Still the ONLY public service
  │
  ├── auth-service             ← Login, JWT, passwords only
  ├── user-service             ← Profiles, follows, settings
  ├── feed-service             ← Posts, home timeline
  ├── explore-service          ← Search, trending, discovery
  └── notification-service     ← Push notifications (later)
```

Each service:

- Has **one job**
- Has **its own database tables** (or schema)
- Talks to gateway via **TCP commands** (same pattern as today)
- Uses **TypeScript + NestJS** (same pattern as today)

### Map: mobile feature → future service

| Mobile `features/` | Backend service (future) | Responsibility |
|--------------------|--------------------------|----------------|
| `auth` | `auth-service` | Register, login, JWT |
| `onboarding` | `user-service` | Interests, follows, profile |
| `home` | `feed-service` | Posts, timeline, likes |
| `explore` | `explore-service` | Search, topics, recommendations |

**You do not need all of these now.** Build them when you build the feature.

### What to do with `auth-service` today

It currently handles **auth + users**. That is OK for a small app.

When you grow:

1. Create `user-service` — move profiles, onboarding, follows
2. Keep `auth-service` — only login, register, JWT
3. Gateway routes `/users/*` to `user-service` instead

No rush. Split when home feed or explore gets real.

---

## 4. Package managers — npm, pnpm, Turborepo

> **Confused by many `package.json` and `node_modules` folders?** Read **[PACKAGES.md](PACKAGES.md)**.

### What you have now

| Folder | Package manager | Status |
|--------|-----------------|--------|
| Project root (mobile) | npm | Fine |
| `backend/api-gateway` | npm | Fine |
| `backend/auth-service` | npm | Fine |

Three separate `package.json` files = **normal** for your project size.

### Do you need pnpm or Turborepo?

| Tool | What it does | When you need it |
|------|--------------|------------------|
| **npm** | Installs packages | Always — you already use it |
| **pnpm** | Faster installs + workspaces | When you have 3+ packages sharing code |
| **Turborepo** | Runs builds/tests in parallel | When builds get slow (many packages) |

### Recommendation for you (beginner)

| Phase | Setup |
|-------|--------|
| **Now** | Keep **npm** in each folder. Simple. Works. |
| **Later** (shared types between mobile + backend) | Add **pnpm workspaces** at repo root |
| **Much later** (5+ packages, slow CI) | Add **Turborepo** |

You do **not** need Turborepo or pnpm today. Adding them early often creates more confusion than value.

### Future monorepo shape (when ready)

```
NomanStop/
├── apps/
│   └── mobile/              ← Expo app (moved from root)
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── feed-service/
│   └── explore-service/
├── packages/
│   └── shared-types/        ← User, Post types shared by all
├── pnpm-workspace.yaml
└── turbo.json
```

**Do not restructure to this yet.** Finish features first.

---

## 5. What to build next (order)

1. **feed-service** + real Home tab (posts, timeline)
2. **explore-service** + real Explore tab (search, topics)
3. Split **user-service** out of auth-service
4. **notification-service** when you add push
5. **pnpm workspaces** when you want shared types
6. **Turborepo** only if CI gets slow

---

## 6. Quick decisions cheat sheet

| Question | Answer |
|----------|--------|
| Rename everything? | No — use the glossary above |
| Different language per service? | No — TypeScript for all |
| pnpm now? | No — npm is fine |
| Turborepo now? | No — too early |
| New service for messages? | Yes — later, TypeScript, same TCP pattern |
| New service for explore? | Yes — later, TypeScript, same TCP pattern |
| Split auth-service? | Yes — when feed/explore grow, not urgent |

---

## 7. How to add a new service (when ready)

Example: adding `feed-service` later.

1. Copy `auth-service` folder structure as a template
2. New Prisma schema for `Post`, `Like`, etc.
3. New TCP commands in `commands.ts` (gateway + feed-service)
4. New gateway module: `modules/feed/feed.controller.ts`
5. Add to `docker-compose.yml`
6. Mobile: `features/home/api/feed.api.ts`

Same pattern every time. No new languages required.
