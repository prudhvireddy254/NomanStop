# NomanStop — Architecture & Conventions

## What is this app?
A social mobile app (think Twitter/Instagram). Users sign up, pick interests, follow people, and eventually see a personalized feed.

---

## The 3 Layers

```
┌─────────────────────────────────────┐
│           MOBILE APP                │
│     (React Native / Expo)           │
│  What the user sees on their phone  │
└──────────────┬──────────────────────┘
               │ HTTP (port 3000)
               ▼
┌─────────────────────────────────────┐
│           API GATEWAY               │
│     (NestJS — port 3000)            │
│  The ONLY public door to the backend│
│  Routes traffic, checks JWTs        │
└──────────────┬──────────────────────┘
               │ TCP private (Docker network only)
               ▼
┌─────────────────────────────────────┐
│          AUTH SERVICE               │
│     (NestJS — port 4000)            │
│  Users, passwords, profiles, follows│
│  Argon2id + PostgreSQL + Prisma     │
└─────────────────────────────────────┘
```

---

## Stack

| Layer | Technology |
|---|---|
| Mobile | Expo 54, React Native 0.81, React 19, TypeScript |
| Routing | Expo Router v6 (file-based, like Next.js) |
| Backend | NestJS 11 (microservices over TCP) |
| Database | PostgreSQL via Prisma + `@prisma/adapter-pg` |
| Auth | JWT (HS256) + Argon2id password hashing |
| AI | Nvidia inference API (OpenAI-compatible SDK), model `z-ai/glm5` |
| Docker | Both services on a private bridge network |

---

## Frontend — Folder Rules

```
app/                    ← Route shells ONLY. One line each. No logic.
  _layout.tsx           ← Wraps AuthProvider + ThemeProvider
  index.tsx             ← Redirects: restoring? → spinner | no user → /auth | no onboarding → /onboarding | → /(tabs)
  auth.tsx              ← export { default } from '@/features/auth/screens/auth-screen'
  onboarding.tsx        ← export { default } from '@/features/onboarding/screens/onboarding-screen'
  (tabs)/
    _layout.tsx         ← Tab bar. Guards: no user → /auth, no onboarding → /onboarding
    index.tsx           ← export { default } from '@/features/home/screens/home-screen'
    explore.tsx         ← export { default } from '@/features/explore/screens/explore-screen'

features/
  auth/
    api/auth.api.ts         ← loginRequest, registerRequest, fetchUserProfile, isOnboardingComplete
    context/auth-context.tsx← AuthProvider, useAuth — AsyncStorage session restore + restoring state
    screens/auth-screen.tsx ← Login / signup UI
    types/auth.types.ts     ← AuthUser, LoginPayload, SignupPayload, UserProfile, AuthContextValue
    index.ts                ← barrel export

  onboarding/
    api/onboarding.api.ts       ← completeOnboardingRequest
    screens/onboarding-screen.tsx ← Pick interests + follow chips UI
    index.ts

  home/
    screens/home-screen.tsx ← Feed placeholder (real feed is next)
    index.ts

  explore/
    screens/explore-screen.tsx ← Trending topics placeholder
    index.ts

shared/
  components/
    screen-shell.tsx    ← Dark bg + decorative orbs wrapper used by every screen
    haptic-tab.tsx      ← Tab bar button with haptic feedback
    icon-symbol.tsx     ← SF Symbols wrapper
  constants/
    app-theme.ts        ← ALL design tokens. Single source of truth. Use AppTheme.* everywhere.
  lib/
    api-client.ts       ← requestJson<T>() — typed fetch wrapper, throws on non-2xx
    api-config.ts       ← resolveApiBaseUrl() + API_BASE_URL constant

context/                ← DEPRECATED shim. Re-exports from features/auth/context. Do not add files here.
```

**Rule: If you write logic in `app/`, move it to `features/` instead.**

---

## Design System — AppTheme tokens (dark theme, never deviate)

```typescript
background:    '#0B0F19'   // page background
surface:       '#161D30'   // cards
surfaceBorder: '#232D45'   // card borders
input:         '#1F2942'   // input background
inputBorder:   '#2E3D5E'   // input border
inputFocused:  '#232F4D'   // input focused background
primary:       '#3B82F6'   // blue — buttons, links, active state
text:          '#FFFFFF'
textMuted:     '#94A3B8'
textPlaceholder:'#64748B'
error:         '#F87171'
danger:        '#EF4444'   // destructive buttons
tabBar:        '#0F1524'
tabInactive:   '#64748B'
```

Every screen uses `<ScreenShell>` which provides the dark background and the two decorative orb blobs.

---

## Backend — Folder Rules

### api-gateway (`backend/api-gateway/src/`)

```
main.ts                         ← NestFactory, CORS, GlobalHttpExceptionFilter, port 3000
app.module.ts                   ← imports GatewayModule + ConfigModule

modules/
  gateway.module.ts             ← registers all controllers + ClientsModule + JwtModule
  auth/auth.controller.ts       ← POST /auth/register, /auth/login, /auth/reset-password
  users/users.controller.ts     ← GET /users/:username, PUT /users/profile, POST /users/onboarding/complete
  health/health.controller.ts   ← GET / → "NomanStop API Gateway is up ✅"

common/
  constants/
    commands.ts                 ← TCP command strings (REGISTER, LOGIN, GET_PROFILE, etc.)
    jwt.constants.ts            ← reads JWT_SECRET from env — throws if missing
    microservice.constants.ts   ← AUTH_SERVICE_CLIENT token + TCP options
  decorators/
    current-user.decorator.ts   ← @CurrentUser() — extracts JWT payload from request
  filters/
    http-exception.filter.ts    ← GlobalHttpExceptionFilter — consistent error shape
  guards/
    jwt-auth.guard.ts           ← JwtAuthGuard — use with @UseGuards(JwtAuthGuard)
  services/
    auth-client.service.ts      ← AuthClientService.send(cmd, payload) — wraps ClientProxy, throws on error
  types/
    microservice.types.ts       ← request body interfaces shared across controllers
```

### auth-service (`backend/auth-service/src/`)

```
main.ts                         ← NestFactory.createMicroservice, TCP port 4000, binds 0.0.0.0

modules/
  auth/
    auth.controller.ts          ← @MessagePattern register, login, reset-password
    auth.service.ts             ← Argon2id hashing, JWT signing
    auth.module.ts
    types/auth.types.ts

  users/
    users.controller.ts         ← @MessagePattern get-profile, update-profile, complete-onboarding
    users.service.ts            ← profile CRUD, completeOnboarding creates real Follow rows
    users.module.ts
    types/users.types.ts

prisma/
  prisma.service.ts             ← PrismaService (extends PrismaClient)
  prisma.module.ts              ← global module

common/
  constants/
    commands.ts                 ← same command strings as gateway (keep in sync)
    jwt.constants.ts            ← JWT_SECRET + JWT_EXPIRES_IN from env
```

---

## Database Schema (Prisma)

### User
```
id, username (unique), email (unique), password (Argon2id hash)
firstName, lastName, middleName, age, gender           ← onboarding step 1
phoneNumber (unique)                                    ← onboarding step 2
interests String[]                                      ← onboarding step 3 — also used to detect completion
bio, profilePictureUrl, websiteUrl, location            ← profile data
isVerified Boolean                                      ← blue checkmark
createdAt, updatedAt
following  Follow[]  @relation("UserFollowing")
followers  Follow[]  @relation("UserFollowers")
```

### Follow ✅ (real model — no longer hacked into bio)
```
id, followerId, followingId, createdAt
follower  → User (UserFollowing)
following → User (UserFollowers)
@@unique([followerId, followingId])
```

---

## Request Flow Examples

```
Register:
  App → POST /auth/register → api-gateway AuthController
      → AuthClientService.send('register', body)
      → auth-service AuthController @MessagePattern('register')
      → AuthService.register() → Argon2id hash → prisma.user.create
      → { message, user }

Login:
  App → POST /auth/login → api-gateway AuthController
      → auth-service AuthService.login() → argon2.verify → jwtService.sign
      → { access_token }

Complete Onboarding:
  App → POST /users/onboarding/complete → api-gateway UsersController
      → auth-service UsersService.completeOnboarding()
      → updates interests + creates real Follow rows in DB
      → { message }
```

---

## Security Rules
- **Passwords**: Argon2id always. `argon2.hash(password, { type: argon2.argon2id })`. Never store plaintext.
- **JWT secret**: `process.env.JWT_SECRET` only. Service throws on startup if missing.
- **Login errors**: Same message for wrong password and user-not-found (prevents username enumeration).
- **Password field**: Never returned from `getProfile` or any API response. Always destructure it out.
- **auth-service**: No public ports. Only reachable from api-gateway via Docker private network.

---

## ENV Variables

**`backend/auth-service/.env`**
```
DATABASE_URL=...
JWT_SECRET=...          ← must match gateway
JWT_EXPIRES_IN=60m
```

**`backend/api-gateway/.env`**
```
NVIDIA_API_KEY=...
JWT_SECRET=...          ← must match auth-service
```

Both services **throw on startup** if `JWT_SECRET` is missing.

---

## What Works Right Now (end-to-end)

| Feature | Status |
|---|---|
| Register (Argon2id) | ✅ Working |
| Login (JWT) | ✅ Working |
| Session restore from AsyncStorage | ✅ Working |
| Onboarding (interests + real follows) | ✅ Working |
| Get/Update profile | ✅ Working |
| Follow model in DB | ✅ Real table (not bio hack) |
| Dark theme (AppTheme) | ✅ All screens |
| ScreenShell with orbs | ✅ All screens |
| Health check endpoint | ✅ GET / |
| CORS enabled | ✅ |
| GlobalHttpExceptionFilter | ✅ |
| JwtAuthGuard + @CurrentUser() | ✅ (ready to use) |

---

## What Does NOT Exist Yet (feature backlog)

| Feature | Notes |
|---|---|
| **AI endpoint** | `AiService` is built in api-gateway but has no HTTP route yet |
| **Posts / Feed** | Home screen shows placeholder text only |
| **Profile picture upload** | `profilePictureUrl` field exists in DB, nothing uploads yet |
| **Push notifications** | Not started |
| **Search** | Not started |
| **Map features** | `location` field exists in DB, not used yet |

---

## Next Steps (in recommended order)

```
1. Wire AI endpoint    → add POST /ai/chat route in api-gateway that calls AiService
2. Posts feature       → new Post model in Prisma, new posts-service or extend users-service
3. Feed                → query posts from followed users, show on home screen
4. Profile pictures    → Cloudinary or S3 upload, save URL to profilePictureUrl
```
