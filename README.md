# NomanStop

Mobile social app — **Expo (React Native)** frontend + **NestJS** backend.

> **New to the project?**
> - **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — services, languages, future design
> - **[docs/PACKAGES.md](docs/PACKAGES.md)** — why many `package.json` / `node_modules`, what to run where

---

## Folder structure

```
NomanStop/
│
├── app/                         # ROUTES ONLY — no logic here
│   ├── _layout.tsx              # Root layout + AuthProvider
│   ├── index.tsx                # Startup redirect
│   ├── auth.tsx                 # → features/auth
│   ├── onboarding.tsx           # → features/onboarding
│   └── (tabs)/
│       ├── _layout.tsx          # Tab bar
│       ├── index.tsx            # → features/home
│       └── explore.tsx          # → features/explore
│
├── features/                    # All app logic lives here
│   ├── auth/
│   │   ├── api/auth.api.ts      # Login, register, profile fetch
│   │   ├── context/             # Session state (user, token)
│   │   ├── screens/             # Login / signup screen
│   │   └── types/               # TypeScript types
│   ├── onboarding/
│   │   ├── api/                 # Save interests + follows
│   │   └── screens/
│   ├── home/
│   │   └── screens/
│   └── explore/
│       └── screens/
│
├── shared/                      # Reusable across features
│   ├── components/              # ScreenShell, icons, tab button
│   ├── constants/app-theme.ts   # Colors (single source of truth)
│   └── lib/
│       ├── api-config.ts        # API base URL
│       └── api-client.ts        # fetch wrapper
│
├── assets/                      # Images, icons
│
└── backend/                     # See backend/README.md for full guide
    ├── docker-compose.yml       # Postgres + services
    ├── api-gateway/             # HTTP API :3000 (phone connects here)
    └── auth-service/            # Users + auth (internal TCP only)
```

### Rules

| Folder | Put what here |
|--------|----------------|
| `app/` | Route files that re-export screens. Nothing else. |
| `features/<name>/` | One feature = screens + api + types for that feature |
| `shared/` | UI components and utilities used by 2+ features |
| `backend/` | All server code |

---

## How it connects

```
Phone  ──HTTP──▶  api-gateway :3000  ──TCP──▶  auth-service  ──▶  PostgreSQL
```

---

## Run locally

### Backend

```bash
cd backend
npm run docker:up
```

Check: http://localhost:3000 → `NomanStop API Gateway is up ✅`

### Mobile

```bash
npm install
npx expo start
```

**Physical device:** copy `env.example` → `.env` and set your computer IP:

```
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:3000
```

### Test accounts

| Username  | Password           |
|-----------|--------------------|
| admin     | admin_password123  |
| john_doe  | secretpassword     |

---

## App flow

```
Open app → Login → Onboarding → Home / Explore tabs
```

Session is saved automatically (AsyncStorage).

---

## Where to add new code

| I want to… | Add code in… |
|------------|--------------|
| New screen | `features/<feature>/screens/` + route in `app/` |
| New API call | `features/<feature>/api/` |
| New shared UI | `shared/components/` |
| New backend route | `backend/api-gateway/src/gateway/gateway.controller.ts` |
| New database table | `backend/auth-service/prisma/schema.prisma` |

---

## Backend

Full backend guide: **[backend/README.md](backend/README.md)**

Quick API reference:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` | Health check |
| POST | `/auth/register` | Sign up |
| POST | `/auth/login` | Log in |
| GET | `/users/:username` | Get profile |
| POST | `/users/onboarding/complete` | Finish onboarding |
