# Full-Stack Booking System

Monorepo implementation of the booking test with:
- `apps/web`: Next.js App Router + TypeScript + TailwindCSS
- `apps/api`: NestJS + TypeScript + Drizzle ORM + PostgreSQL
- `packages/shared`: Shared Zod schemas used by frontend and backend

## Project Structure

```text
.
├── apps
│   ├── api
│   │   ├── src
│   │   │   ├── auth
│   │   │   ├── bookings
│   │   │   ├── common
│   │   │   └── database
│   │   ├── drizzle
│   │   └── test
│   └── web
│       ├── app
│       ├── components
│       └── lib
└── packages
    └── shared
        └── src
```

## Setup Instructions

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy the root env file and fill values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`
- `JWT_SECRET`
- `API_PORT`
- `WEB_ORIGIN`
- `NEXT_PUBLIC_API_URL`

### 3. Prepare PostgreSQL database

1. Create a PostgreSQL database (example: `booking_system`)
2. Enable `pgcrypto` extension if needed:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

3. Run migrations:

```bash
pnpm db:migrate
```

> Migration SQL is available at `apps/api/drizzle/0000_initial.sql`.

### 4. Start development servers

```bash
pnpm dev
```

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## API Documentation

Base URL: `http://localhost:4000`

### Auth

#### `POST /auth/register`
Creates a new user account.

Request:

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "jane@example.com",
    "fullName": "Jane Doe"
  }
}
```

#### `POST /auth/login`
Authenticates a user.

Request:

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

#### `GET /auth/me`
Returns current authenticated user.

Header:
- `Authorization: Bearer <token>`

### Bookings (Protected)

#### `GET /bookings/available?date=YYYY-MM-DD&timezone=Europe/Istanbul`
Returns available sessions for a date.

Header:
- `Authorization: Bearer <token>`

Response:

```json
{
  "date": "2026-03-30",
  "timezone": "Europe/Istanbul",
  "slots": [
    {
      "start": "2026-03-30T09:00:00+03:00",
      "end": "2026-03-30T10:00:00+03:00",
      "durationMinutes": 60
    }
  ]
}
```

#### `POST /bookings`
Books a session slot.

Header:
- `Authorization: Bearer <token>`

Request:

```json
{
  "sessionStart": "2026-03-30T09:00:00+03:00",
  "timezone": "Europe/Istanbul"
}
```

Behavior:
- Validates slot is in working hours
- Prevents booking past slots
- Prevents double booking with unique constraint + conflict handling
- Returns `409` for concurrent/double booking collisions

## Features Implemented

- Shared Zod schemas (`packages/shared`) for API + frontend validation
- Booking widget with calendar view and slot selection
- Confirmation modal after successful booking
- Authentication (register/login + JWT)
- Protected booking routes
- Timezone-aware slot generation and display
- Double-booking prevention at DB level + API conflict handling
- Live availability refresh every 15 seconds on booking widget
- Loading, error, and success UI states
- Responsive UI for mobile and desktop

## Testing

In `apps/api`:
- Unit test: `src/bookings/bookings.service.spec.ts`
- Integration test: `test/booking-flow.integration.spec.ts`
- E2E test: `test/booking.e2e-spec.ts`

Run tests:

```bash
pnpm test:api
pnpm --filter api test:e2e
```

If you run tests while `pnpm dev` is already running in another terminal, stop it first (`Ctrl + C`) and then run test commands in a clean terminal.

## Important Notes

- Booking working hours are currently defined as `09:00 - 17:00` (local timezone).
- Session duration is currently `60` minutes.
- Figma-specific assets (icons/illustrations/fonts/tokens) were not auto-imported in code; UI is implemented as a polished custom interpretation.
