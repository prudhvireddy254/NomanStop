# NomanStop — Architecture & Conventions

## Stack
- **Frontend**: Expo 54 / React Native 0.81.5, Expo Router v6, TypeScript, React 19
- **Backend**: NestJS microservices — `api-gateway` (HTTP, port 3000) + `auth-service` (TCP, port 4000)
- **Database**: PostgreSQL via Prisma (`@prisma/adapter-pg`)
- **Auth**: JWT (HS256), Argon2id password hashing
- **AI**: Nvidia inference API (OpenAI-compatible SDK), model `z-ai/glm5`

## Frontend Folder Rules

```
app/              ← Route shells ONLY. Zero logic. Just: export { default } from '@/features/...'
features/         ← All screens, hooks, API calls, context — organised by domain
  auth/           ← AuthProvider, useAuth, AuthScreen, OnboardingScreen
  home/           ← HomeScreen
  explore/        ← ExploreScreen
  profile/        ← (future)
shared/           ← Truly cross-feature: components, hooks, constants, lib
  components/     ← Design system components (themed-text, icon-symbol, etc.)
  constants/      ← theme.ts (Colors, Fonts)
  hooks/          ← use-color-scheme, use-theme-color
  lib/            ← api-client.ts (requestJson wrapper)
context/          ← DEPRECATED shim — do not add new files here
components/       ← DEPRECATED — move to shared/components/ as touched
```

**Rule**: If you're writing logic in `app/`, move it to the right `features/` folder instead.

## Backend Folder Rules

```
backend/
  api-gateway/src/
    common/
      guards/       ← JwtAuthGuard
      decorators/   ← @CurrentUser()
      filters/      ← GlobalHttpExceptionFilter
      constants/    ← jwt.constants.ts (reads from env), microservice.constants.ts
    gateway/        ← GatewayController, GatewayModule, AiService
    main.ts

  auth-service/src/
    auth/           ← AuthController (MessagePatterns), AuthService, AuthModule
    common/
      constants/    ← jwt.constants.ts (reads from env)
    prisma.service.ts
    main.ts
```

## Security Rules
- **Passwords**: Always hash with Argon2id (`argon2.hash(..., { type: argon2.argon2id })`). Never store or compare plaintext.
- **JWT secret**: Always read from `process.env.JWT_SECRET`. The app throws on startup if it's missing. Never hardcode.
- **Error messages**: Login returns the same error for "user not found" and "wrong password" to prevent username enumeration.
- **Password field**: Never return `user.password` from `getProfile` or any API response.

## Design System (Dark Theme)
All custom screens use this palette — do not deviate:
- Background: `#0B0F19`
- Card: `#161D30`, border: `#232D45`
- Input bg: `#1F2942`, input border: `#2E3D5E`
- Primary blue: `#3B82F6`
- Error red: `#EF4444` / text `#F87171`
- Muted text: `#94A3B8`
- Decorative orbs: blue `rgba(59,130,246,0.15)` + indigo `rgba(99,102,241,0.12)`

## ENV Variables Required
**auth-service/.env**: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`
**api-gateway/.env**: `NVIDIA_API_KEY`, `JWT_SECRET`
Both services throw at startup if `JWT_SECRET` is missing.
