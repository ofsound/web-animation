# Web Animation Gallery + Admin API

A React + Vite gallery backed by a Hono API and Postgres.

The gallery now loads **only** from published demo records in the database. Each demo is rendered inside an isolated sandbox frame from stored demo files (`html`, `css`, `js`, `tailwind_css`, `meta`). There is no local file-based demo fallback in the app.

## Tech Stack

- React 19 + TypeScript
- React Router (BrowserRouter)
- Vite
- Tailwind CSS v4
- Hono API (`/api/*`)
- Better Auth (email/password)
- Drizzle ORM + Drizzle Kit
- Neon Postgres (`@neondatabase/serverless`)

## Commands

```bash
npm install
npm run dev      # Start frontend dev server
npm run dev:api  # Start Hono API server on :8787
npm run build    # Production build
npm run lint     # ESLint
npm run test     # Vitest
npm run env:check
npm run db:generate
npm run db:migrate
npm run admin:seed
```

## Project Structure

```
src/
├── admin/                      # Admin UI (/admin)
├── App.tsx                     # Gallery shell + route behavior
├── components/                 # Gallery UI + isolated preview frames
├── data/
│   ├── demoRegistry.ts         # Route + registry helpers
│   └── publicGallery.tsx       # Public API -> runtime gallery mapping
└── index.css                   # Theme + Tailwind styles
server/
├── app.ts                      # Hono app wiring
├── auth.ts                     # Better Auth config
├── db/
│   ├── client.ts               # Drizzle + Neon client
│   └── schema.ts               # Auth + demo CMS tables
├── routes/
│   ├── admin.ts                # Protected admin CRUD/reorder/publish
│   └── public.ts               # Public gallery endpoint
└── scripts/
    ├── check-env.ts
    └── ensure-admin.ts
api/
└── [...route].ts               # Vercel serverless entry (Node runtime)
```

## Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_TRUSTED_ORIGINS`
- `ADMIN_EMAIL`
- `ADMIN_NAME`
- `ADMIN_PASSWORD`

## First-Time Setup

1. Validate environment:
   - `npm run env:check`
2. Run migrations:
   - `npm run db:generate`
   - `npm run db:migrate`
3. Seed the admin user:
   - `npm run admin:seed`
4. Start both servers:
   - API: `npm run dev:api`
   - Frontend: `npm run dev`
5. Open `/admin` to create categories/demos and publish them.

If no demos are published, the gallery will be empty.

## Routing & Deep Links

- Mode roots:
  - `/tailwind`
  - `/css`
- Demo route:
  - `/:mode/:title-slug~demo-id`
  - Example: `/tailwind/gradient-border-spin~hover-gradient-border`
- Legacy `#hash` links are redirected to canonical routes.

### BrowserRouter Hosting Note

Because the app uses `BrowserRouter`, production hosting must rewrite non-asset requests to `index.html` so direct deep links resolve correctly.
