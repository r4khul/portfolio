# Rakhul Prakash | Portfolio

A high-performance, developer-first personal portfolio website built with extreme restraint and precise technical-blueprint styling.

## Design System & Blueprint Aesthetic

- **Visual Frame:** Vertical rail layout with full-bleed section rules and dotted blueprint background (`.dotgrid`, `.hatch`).
- **Restraint:** High-contrast dark-first design with monochrome details and a single emerald pulse accent representing live availability status.
- **Micro-Interactions:** Subtle, fluid entrance animations using `motion` that respect system preference (`prefers-reduced-motion`).
- **Typography:** Geist Sans coupled with monospace annotations (Geist Mono) and custom terminal elements.

## Tech Stack

- **Framework:** Next.js 16 (Turbopack, App Router, React 19.2)
- **Styling:** Tailwind CSS v4 (Zero-runtime, modern CSS engine)
- **Content:** MDX-powered project case studies via `next-mdx-remote/rsc` + `gray-matter`
- **Animations:** Motion
- **Icons:** Lucide React
- **Theme:** `next-themes` (Dark/Light sync, hydration-safe via `useSyncExternalStore`)

## Architecture & Code Performance

- **Zero-hydration layout:** All static metadata, structural rails, and icons are rendered as React Server Components (RSC).
- **Zero Layout Shift (CLS):** Hydration-safe widgets (Theme Toggle, Local Time) are rendered using modern APIs (`useSyncExternalStore` or client mounts) to prevent flashing.
- **SEO Ready:** Complete schema, rich meta tags, robots.txt, and a fully dynamic, typed sitemap matching SSG page exports.
- **Fast Build Times:** Configured with Turbopack by default, compiling page routes and compiling fully static, optimized routes in seconds.

## Project Structure

```txt
site/
├── content/               # MDX Case Studies
│   └── projects/          # Markdown projects (mrcas-cafe, popo, thrifty, unfilter)
├── src/
│   ├── app/               # Next.js App Router (Layout, Page, Sitemap, Robots)
│   ├── components/        # React components (Home, Site, UI, MDX-Content)
│   ├── data/              # Typed static content (profile.ts)
│   └── lib/               # Utility functions (MDX parser & metadata filters)
└── public/                # Static assets (Resume, Favicon)
```

## Running the Application

### Development
```bash
npm run dev
```

### Build & Export Verification
```bash
npm run build
```
The build script automatically triggers static export optimization and TypeScript checking.

