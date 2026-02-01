# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website built with Astro 5.17.1 - a static site generator with zero JavaScript by default and island architecture for selective hydration.

## Commands

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Build static site to ./dist/
npm run preview   # Preview production build locally
npm run astro -- check  # TypeScript type checking
npm run astro -- add [integration]  # Add integrations (react, tailwind, etc.)
```

## Architecture

### File-Based Routing
Pages in `src/pages/` automatically become routes:
- `src/pages/index.astro` → `/`
- `src/pages/about.astro` → `/about`
- `src/pages/statii/index.astro` → `/statii`

### Component Structure
- **Layouts** (`src/layouts/`): HTML wrapper templates using `<slot />` for content injection
- **Components** (`src/components/`): Reusable Astro components with scoped CSS
- **Pages** (`src/pages/`): Route endpoints that compose layouts and components

### Styling
Vanilla CSS with scoped styles in `<style>` blocks within each component. Styles are automatically scoped to prevent leakage.

### Assets
- `src/assets/`: Optimized images imported as modules
- `public/`: Static files served as-is (favicons, etc.)

## Configuration

- `astro.config.mjs`: Astro configuration (currently minimal, ready for integrations)
- `tsconfig.json`: Uses Astro's strict TypeScript preset
