# Backend Guide

Server-side code: API routes, database, authentication, and middleware.

---

## API Routes (`app/api/`)

### `POST /api/register`

Registers a new user.

**File:** `app/api/register/route.ts`

**Request body:**
```json
{ "email": "user@example.com", "password": "secret123" }
```

**Validation:**
- Email must be a valid email address
- Password must be at least 6 characters

**On success (`201`):**
- Creates a `users` document with `{ email, passwordHash, createdAt }`
- Creates a `points` document with `{ userId, balance: 100, updatedAt }` — new users start with 100 points

**Error responses:**

| Status | Reason                          |
|--------|---------------------------------|
| 400    | Missing email or password       |
| 400    | Invalid email format            |
| 400    | Password too short (< 6 chars)  |
| 409    | Email already registered        |
| 500    | Internal server error           |

---

### `GET/POST /api/auth/[...nextauth]`

Catch-all NextAuth.js route handler.

**File:** `app/api/auth/[...nextauth]/route.ts`

Handles all authentication flows:
- `POST /api/auth/signin` — credential sign-in
- `GET /api/auth/signout` — sign out
- `GET /api/auth/session` — current session
- `GET /api/auth/csrf` — CSRF token
- `GET /api/auth/providers` — available providers

Auth configuration is in `lib/server/auth.ts`.

---

## Middleware (`middleware.ts`)

Runs on every request before the page renders. Protects dashboard routes.

**Protected paths:** `/dashboard` and any sub-routes

**Behavior:** Unauthenticated requests to protected routes are redirected to `/auth/login`.

Uses NextAuth's `withAuth` middleware wrapper with a JWT strategy.

---

## Database

### Connection (`lib/server/mongodb.ts`)

Uses a singleton pattern to reuse the MongoDB client across hot-reloads in development and serverless function invocations in production.

```ts
import getMongoClientPromise from '@/lib/server/mongodb'

const client = await getMongoClientPromise()
const db = client.db()
```

Set `MONGODB_URI` in `.env.local` to your connection string.

### Collections

#### `users`

| Field          | Type     | Description                      |
|----------------|----------|----------------------------------|
| `_id`          | ObjectId | Auto-generated                   |
| `email`        | string   | Unique user email                |
| `passwordHash` | string   | bcrypt hash (cost factor 10)     |
| `createdAt`    | Date     | Registration timestamp           |

#### `points`

| Field       | Type     | Description                       |
|-------------|----------|-----------------------------------|
| `_id`       | ObjectId | Auto-generated                    |
| `userId`    | ObjectId | Reference to `users._id`          |
| `balance`   | number   | Current points balance            |
| `updatedAt` | Date     | Last update timestamp             |

#### `sessions` / `accounts` / `verification_tokens`

Managed automatically by the [MongoDB adapter for NextAuth.js](https://www.npmjs.com/package/@next-auth/mongodb-adapter).

---

## Authentication (`lib/server/auth.ts`)

Built on [NextAuth.js v4](https://next-auth.js.org/).

**Provider:** `CredentialsProvider` (email + password)

**Session strategy:** JWT (stateless, no session stored in DB)

**Flow:**
1. User submits email + password
2. `authorize()` fetches user from MongoDB, compares password with `bcryptjs`
3. On success, JWT is issued containing `sub` (user ID)
4. `session` callback attaches `user.id` to the session object

**Custom pages:**

| Page         | Route             |
|--------------|-------------------|
| Sign-in      | `/auth/login`     |
| Error        | `/auth/error`     |

**Required environment variables:**

```env
AUTH_SECRET=<long random string>
MONGODB_URI=<mongodb connection string>
```

---

## Points System (`lib/server/points.ts`)

```ts
getPointsBalance(userId: string): Promise<number>
```

Fetches the current points balance for a user from the `points` collection. Returns `0` if no record is found.

Called from dashboard components to display the user's balance.

---

## Server-only Code (`lib/server/`)

All files in `lib/server/` are **server-only** — they must never be imported from client components. They use Node.js APIs and environment secrets.

| File          | Exports                                        |
|---------------|------------------------------------------------|
| `mongodb.ts`  | `getMongoClientPromise()`, `getDb()`           |
| `auth.ts`     | `getAuthOptions()`                             |
| `points.ts`   | `getPointsBalance(userId)`                     |

---

## Security Notes

- Passwords are hashed with `bcryptjs` (cost factor 10) — plaintext passwords are never stored
- JWT secret is read from `AUTH_SECRET` / `NEXTAUTH_SECRET` environment variable
- MongoDB URI is server-only — never exposed to the client bundle
- Route protection is enforced at the middleware layer (before page render)
- Email and password are validated server-side before any DB query

---

## Key Dependencies

| Package                       | Version | Purpose                       |
|-------------------------------|---------|-------------------------------|
| `mongodb`                     | 5.x     | Official MongoDB driver       |
| `next-auth`                   | 4.x     | Authentication framework      |
| `@next-auth/mongodb-adapter`  | 1.x     | NextAuth MongoDB adapter      |
| `bcryptjs`                    | 3.x     | Password hashing              |
