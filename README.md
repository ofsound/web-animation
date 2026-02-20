# Tailwind Animation Editorial Gallery

A showcase of CSS animations built with **Tailwind CSS v4**, React 19, and Vite. Browse hover effects, entrance animations, loading states, text effects, and complex keyframes—each with copyable code and deep-linkable URLs.

## Tech Stack

- **React 19** + TypeScript
- **Vite** for dev/build
- **Tailwind CSS v4** with custom keyframes and theme tokens
- Light/dark themes with `prefers-reduced-motion` support

## Commands

```bash
npm install
npm run dev      # Start dev server
npm run build   # Production build
npm run lint    # ESLint
npm run test    # Vitest
```

## Project Structure

```
src/
├── App.tsx              # Main layout, nav, hash routing
├── data/animations.ts    # Demo metadata (id, title, code, category)
├── categories/          # Category components (HoverInteractions, etc.)
├── components/          # AnimationCard, CategorySection, SectionNav
├── hooks/               # useActiveSection, useTheme
└── index.css            # Tailwind + @theme + keyframes
```

New demos live in `src/categories/*.tsx` and require a matching entry in `animations.ts`.
