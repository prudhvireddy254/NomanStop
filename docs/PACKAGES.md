# Packages Guide — why there are many `package.json` files

If you see `node_modules` in multiple places, **that is normal**. This guide explains why.

---

## You have 3 separate apps (3 `package.json` files)

```
NomanStop/
├── package.json                    ← MOBILE APP (Expo)
├── backend/
│   ├── package.json                ← helper scripts only (no real deps)
│   ├── api-gateway/package.json    ← GATEWAY service
│   └── auth-service/package.json   ← AUTH service
```

Think of it like **3 different programs** in one repo:

| `package.json` | What it is | Main packages |
|----------------|------------|---------------|
| **Root** `/package.json` | Phone app | expo, react-native, react |
| **api-gateway** | HTTP server | @nestjs/*, jsonwebtoken |
| **auth-service** | Database server | @nestjs/*, prisma, argon2, pg |

They **cannot share one `package.json`** because:

- Mobile needs React Native — backend does not
- auth-service needs Prisma + PostgreSQL — mobile does not
- api-gateway should stay small — auth-service has heavy DB libs

---

## Why each service has its own `node_modules`

When you run `npm install` inside a folder, npm creates `node_modules` **in that folder only**.

```
NomanStop/node_modules/              ← expo, react-native, …
backend/api-gateway/node_modules/    ← @nestjs/common, …
backend/auth-service/node_modules/   ← @nestjs/common, prisma, …
```

**Yes, `@nestjs/common` is installed twice** (gateway + auth-service). That is OK:

- Each service runs in its own Docker container
- Each service can be deployed independently
- This is standard for microservices

You are **not** doing anything wrong.

---

## Commands — where to run what

### Mobile app (from project root)

```bash
cd /path/to/NomanStop
npm install          # once
npx expo start       # every time you develop
```

### Backend with Docker (easiest — from `backend/`)

```bash
cd backend
npm run docker:up    # starts postgres + both services
```

### Backend without Docker (two terminals)

```bash
# Terminal 1
cd backend/auth-service
npm install
npm run start:dev

# Terminal 2
cd backend/api-gateway
npm install
npm run start:dev
```

### Install everything (first time setup)

```bash
# From project root
npm install

# Backend services
cd backend/auth-service && npm install
cd ../api-gateway && npm install
```

---

## Do you need pnpm or Turborepo?

| Situation | What to use |
|-----------|-------------|
| **You are learning / small team** | **npm** (what you have now) |
| You want one `npm install` at root for all packages | **pnpm workspaces** (later) |
| Builds are slow with 5+ packages | **Turborepo** (much later) |

### What pnpm workspaces would look like (later)

One install at root, shared `node_modules`, less disk space:

```
NomanStop/
├── pnpm-workspace.yaml
├── apps/mobile/package.json
├── services/api-gateway/package.json
├── services/auth-service/package.json
└── packages/shared-types/package.json   ← shared User type
```

**Do not set this up until you need shared types between mobile and backend.**

---

## When you add a new service (e.g. feed-service)

Copy the pattern:

```
backend/feed-service/
├── package.json       ← its own deps (nestjs, maybe redis, etc.)
├── node_modules/      ← its own install
├── src/
└── Dockerfile
```

Each new service = **one new `package.json`**. Same as api-gateway and auth-service.

---

## Cheat sheet

| I want to… | Command |
|------------|---------|
| Run phone app | `npx expo start` (from root) |
| Run full backend | `cd backend && npm run docker:up` |
| Install mobile deps | `npm install` (from root) |
| Install gateway deps | `npm install` (in `backend/api-gateway`) |
| Install auth deps | `npm install` (in `backend/auth-service`) |
| Add a package to gateway | `npm install <name>` (in `backend/api-gateway`) |
| Add a package to mobile | `npm install <name>` (from root) |

---

## Summary

- **Many `package.json` files = normal** for microservices + mobile
- **Many `node_modules` folders = normal**
- **Use npm for now** — pnpm/Turborepo when the repo grows
- **One service = one `package.json`** — always
