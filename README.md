# Web Animation Gallery + Admin API

A showcase of CSS animations built with **Tailwind CSS v4**, React 19, and Vite. It now includes a Hono + Better Auth + Drizzle backend for database-driven demo management and an `/admin` shell route.

## Tech Stack

- **React 19** + TypeScript
- **React Router** (BrowserRouter)
- **Vite** for dev/build
- **Tailwind CSS v4** with custom keyframes and theme tokens
- Light/dark themes with `prefers-reduced-motion` support
- **Hono** API (`/api/*`) for admin CRUD/auth endpoints
- **Better Auth** email/password auth with single-admin policy
- **Drizzle ORM + Drizzle Kit** for schema/migrations
- **Neon Postgres** (via `@neondatabase/serverless`)

## Commands

```bash
npm install
npm run dev      # Start dev server
npm run dev:api  # Start Hono API server on :8787
npm run build    # Production build
npm run lint     # ESLint
npm run test     # Vitest
npm run env:check
npm run db:generate
npm run db:migrate
npm run admin:seed
npm run demos:import
```

## Project Structure

```
src/
├── admin/                      # Admin shell route UI (/admin)
├── App.tsx                     # Main layout, mode toggle, route-driven deep links
├── components/                 # AnimationCard, CategorySection, SectionNav
├── hooks/                      # useActiveSection, useTheme
├── data/
│   ├── demoRegistry.ts         # Gallery data + demo route slug helpers
│   ├── animations.ts           # Tailwind demo metadata
│   └── cssAnimations.ts        # Native CSS demo/category normalization
├── tailwindDemos/demos/        # Tailwind React demo components + catalog
├── cssDemos/demos/             # Native CSS demo components + catalog
└── index.css                   # Tailwind + theme variables + keyframes
server/
├── app.ts                      # Hono app + auth/admin route mount
├── auth.ts                     # Better Auth config
├── db/
│   ├── client.ts               # Drizzle + Neon client
│   └── schema.ts               # Better Auth + demo CMS tables
├── routes/admin.ts             # Protected admin CRUD/reorder API
└── scripts/ensure-admin.ts     # Seed single admin account
api/
└── [...route].ts               # Vercel serverless entry (Node runtime)
```

## Environment

Copy `.env.example` to `.env` and set values:

- `DATABASE_URL` (Neon connection string)
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_TRUSTED_ORIGINS`
- `ADMIN_EMAIL` / `ADMIN_NAME` / `ADMIN_PASSWORD`

## First-Time Admin Setup

1. Validate environment:
   - `npm run env:check`
2. Run migrations:
   - `npm run db:generate`
   - `npm run db:migrate`
3. Seed the single admin account:
   - `npm run admin:seed`
4. Import static demos into the database:
   - `npm run demos:import`
   - Optional safe preview: `npm run demos:import -- --dry-run`
   - Optional overwrite of importer-managed rows: `npm run demos:import -- --force-sync`
5. Start both servers:
   - API: `npm run dev:api`
   - Frontend: `npm run dev`
6. Open `/admin` and sign in.

## Routing & Deep Links

- Mode root routes:
  - `/tailwind`
  - `/css`
- Demo deep-link route:
  - `/:mode/:title-slug~demo-id`
  - Example: `/tailwind/gradient-border-spin~hover-gradient-border`
- Legacy `#hash` links are redirected to the matching route.

### BrowserRouter Hosting Note

Because the app uses `BrowserRouter`, production hosting must rewrite non-asset
requests to `index.html` so direct deep links load correctly.

## Adding Demos

1. Tailwind demo:
Add component in `src/tailwindDemos/demos/**`, export it via `src/tailwindDemos/demos/index.ts`, and add metadata entry in `src/data/animations.ts`.
2. Native CSS demo:
Add component/module CSS in `src/cssDemos/demos/**`, export in `src/cssDemos/demos/index.ts`, and register in `src/cssDemos/demos/catalog.ts`.
