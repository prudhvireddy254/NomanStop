# NomanStop Backend

Two NestJS services + PostgreSQL. The mobile app only talks to **api-gateway**.

> **Confused about naming, languages, or future services?** See **[../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)**.

---

## How it works

```
Phone  ──HTTP──▶  api-gateway (:3000)  ──TCP──▶  auth-service (:4000)  ──▶  PostgreSQL
```

| Service | Protocol | Who can reach it |
|---------|----------|------------------|
| **api-gateway** | HTTP REST | Mobile app, browser |
| **auth-service** | TCP (internal) | Only api-gateway |
| **postgres** | SQL (internal) | Only auth-service |

The gateway translates HTTP requests into TCP commands and forwards them to auth-service.

---

## Folder structure

```
backend/
├── docker-compose.yml          # Run everything with one command
├── env.example                 # Copy to .env for local dev
│
├── api-gateway/                # PUBLIC — HTTP API
│   └── src/
│       ├── main.ts             # Starts HTTP server on :3000
│       ├── app.module.ts       # Root module
│       ├── common/             # Shared utilities
│       │   ├── constants/      # JWT secret, TCP config, command names
│       │   ├── decorators/     # @CurrentUser()
│       │   ├── filters/        # Error formatting
│       │   ├── guards/         # JwtAuthGuard
│       │   ├── services/       # AuthClientService (sends TCP commands)
│       │   └── types/          # Request body types
│       └── modules/
│           ├── gateway.module.ts
│           ├── health/         # GET /
│           ├── auth/           # POST /auth/*
│           └── users/          # GET/PUT/POST /users/*
│
└── auth-service/               # PRIVATE — database + business logic
    └── src/
        ├── main.ts             # Starts TCP microservice on :4000
        ├── app.module.ts
        ├── prisma/             # Database connection
        │   ├── prisma.module.ts
        │   └── prisma.service.ts
        ├── common/constants/   # JWT, command names
        └── modules/
            ├── auth/           # register, login, reset-password
            │   ├── auth.controller.ts   ← listens for TCP commands
            │   ├── auth.service.ts      ← business logic
            │   └── types/
            └── users/          # profiles, onboarding, follows
                ├── users.controller.ts
                ├── users.service.ts
                └── types/
```

---

## The TCP command pattern

Gateway and auth-service communicate with named commands:

| Command | HTTP route | What it does |
|---------|------------|--------------|
| `register` | POST `/auth/register` | Create account |
| `login` | POST `/auth/login` | Sign in → JWT |
| `reset-password` | POST `/auth/reset-password` | Change password |
| `get-profile` | GET `/users/:username` | Fetch user profile |
| `update-profile` | PUT `/users/profile` | Update profile fields |
| `complete-onboarding` | POST `/users/onboarding/complete` | Save interests + follows |

Command names live in `common/constants/commands.ts` in both services.

**Flow example — login:**

```
1. Phone  →  POST /auth/login  →  api-gateway AuthController
2. Gateway  →  TCP { cmd: 'login', data }  →  auth-service AuthController
3. AuthService  →  checks password in PostgreSQL  →  returns JWT
4. Gateway  →  HTTP response  →  Phone
```

---

## Run with Docker (recommended)

```bash
cd backend
docker compose up --build
```

This starts postgres, runs migrations + seed, and boots both services.

Test: http://localhost:3000

---

## Run locally (without Docker)

You need PostgreSQL running.

```bash
# 1. Setup env files
cp env.example auth-service/.env
cp env.example api-gateway/.env

# 2. Database
cd auth-service
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev

# 3. Gateway (new terminal)
cd api-gateway
npm install
npm run start:dev
```

---

## Where to add new code

| I want to… | Edit… |
|------------|-------|
| New HTTP endpoint | `api-gateway/src/modules/<area>/<area>.controller.ts` |
| New business logic | `auth-service/src/modules/<area>/<area>.service.ts` |
| New TCP command | Add to `commands.ts` in both services + controller in both |
| New database table | `auth-service/prisma/schema.prisma` → `npx prisma migrate dev` |
| Change JWT settings | `JWT_SECRET` in `.env` + `common/constants/jwt.constants.ts` |

---

## Test accounts (after seed)

| Username | Password |
|----------|----------|
| admin | admin_password123 |
| john_doe | secretpassword |
