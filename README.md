# Tailwind Animation Editorial Gallery

A showcase of CSS animations built with **Tailwind CSS v4**, React 19, and Vite. Browse hover effects, entrance animations, loading states, text effects, and complex keyframes—each with copyable code and deep-linkable URLs.

## Tech Stack

- **React 19** + TypeScript
- **React Router** (BrowserRouter)
- **Vite** for dev/build
- **Tailwind CSS v4** with custom keyframes and theme tokens
- Light/dark themes with `prefers-reduced-motion` support

## Commands

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
npm run test     # Vitest
```

## Project Structure

```
src/
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
```

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
