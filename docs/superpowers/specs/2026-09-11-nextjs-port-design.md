# Next.js Port — Design Spec

Date: 2026-09-11
Status: Draft, pending user review

## Goal

Convert the current static site (`index.html`, `projects.html`, one shared
`<style>` block, one inline `<script>` block per page) into a Next.js App
Router project, as its own standalone app — **not** merged into the existing
`portfolio` (Next.js) project, which stays a separate, independently
deployed site.

This is a structural port, not a redesign. No visual changes beyond what's
listed under "Also in scope" below. Every section, class name, animation,
and piece of copy carries over unchanged unless explicitly called out.

## Why (from the brainstorming conversation)

- Easier to maintain/extend: one 1500-line HTML file → componentized React.
- Real performance win: `next/image` for the four project screenshots
  (automatic resizing/format negotiation/lazy-loading) — bigger win than the
  framework switch itself.
- Stack consistency with the user's other project, without redoing the
  validated visual design.

## Non-goals

- No Tailwind rewrite. The existing CSS (custom properties, mono-accent
  system, canvas-scrim, card styles) moves into a global stylesheet
  essentially as-is. Tailwind is already used in the *other* portfolio
  project; introducing it here would mean re-deriving every value in the
  current design from scratch for no visual benefit, so it's out of scope.
- No content changes beyond what's already on the pages today.
- No new features (no CMS, no blog, no admin).
- No change to the deployment target decision — this stays a separate
  Vercel project from the user's other Next.js portfolio.

## Approach

**Next.js 14, App Router, TypeScript, global CSS.**

### Project setup
- `create-next-app` scaffolding (App Router, TypeScript, no Tailwind, no
  `src/` directory — keep `app/` at root to match the other project's
  layout convention loosely, but this is a fresh app with its own
  `package.json`/`node_modules`, fully independent).
- `next/font/google` for Inter + JetBrains Mono, replacing the current
  `@import url(fonts.googleapis.com/...)` — removes a render-blocking
  external stylesheet fetch, which is a real (small) performance win.

### Routing
| Current file | New route |
|---|---|
| `index.html` | `app/page.tsx` |
| `projects.html` | `app/projects/page.tsx` |
| shared `<nav>`/`<footer>` markup (currently duplicated in both files) | `app/layout.tsx` + shared `Nav`/`Footer` components |

### Styling
- One global stylesheet (`app/globals.css`) holding everything currently in
  the two `<style>` blocks, merged and deduplicated (nav/footer/button/badge
  rules are byte-for-byte identical between the two pages today — this port
  is the natural point to stop duplicating them).
- **Also in scope:** `projects.html` currently uses a slightly different
  token set than the redesigned `index.html` (plain Inter, no JetBrains
  Mono, a different `--bg-dark`, no `--font-mono`/`--bg-elevated`/
  `--border-subtle` variables). Since both pages are being rebuilt from the
  same global stylesheet anyway, the projects page adopts the same
  design-token system as the home page for visual consistency across the
  site. This is a byproduct of not duplicating tokens, not a redesign pass.
- CSS custom properties (`:root { --primary-orange: ... }`) stay as global
  CSS variables — no CSS-in-JS, no CSS Modules. Class names are preserved
  as-is so the stylesheet needs minimal editing beyond de-duplication.

### Components (`app/components/`)
Mostly Server Components, each importing its data from `lib/data/` rather
than containing hardcoded copy — a section component is purely presentation,
mapping over its data file's array to render markup:
- `Nav` — shared between both routes, reads `lib/data/nav.ts`; active-link
  highlighting (currently JS-driven `IntersectionObserver`) becomes a
  **Client Component** since it needs scroll state.
- `Hero` — reads `lib/data/site.ts` for name/role/tagline.
- `Experience` — maps over `lib/data/experience.ts` to render the timeline;
  the individual role entry is its own small `ExperienceItem` component.
- `About` — reads `lib/data/site.ts` for the approach copy.
- `TechStack` — maps over `lib/data/techStack.ts`; each category card is its
  own `StackCard` component.
- `Certifications` — maps over `lib/data/certifications.ts`; each card is
  its own `CertCard` component.
- `Contact` — reads `lib/data/site.ts` for email/CTA copy (form fields stay
  static markup — they're not content, they're a fixed form shape).
- `Stats` — maps over `lib/data/stats.ts`; each block renders an
  `AnimatedStat` (see below).
- `Footer` — reads `lib/data/site.ts` + `lib/data/nav.ts`.
- `ProjectCard` — used on both the home-page "About" mention and the
  `/projects` grid; Server Component, takes one `Project` (from
  `lib/data/projects.ts`) as a prop. `/projects/page.tsx` and `app/page.tsx`
  both map over the same imported array — no duplicated project data or
  markup between the two routes.

Client Components (the four pieces of interactive JS in the current page,
ported faithfully — same logic, same thresholds/timings, wrapped in
`useEffect`):
- `ScrollCanvas` — the frame-sequence scroll animation. Same progressive
  batch-loading, same nearest-loaded-frame fallback, same resize handling.
  The 249 JPEGs move to `public/frames/` and load the same way (plain
  `Image()` objects against static paths — `next/image` doesn't fit this
  use case since frames are drawn to canvas, not rendered as `<img>`).
- `ScrollFadeIn` — wraps a section, applies the `fade-in`/`visible` class
  pattern via `IntersectionObserver`. Implemented as a small reusable
  Client Component so each Server Component section can opt in without
  itself becoming a Client Component.
- `AnimatedStat` — the count-up-from-0 behavor for the Stats section
  numbers, same easing/duration/`prefers-reduced-motion` handling.
- `NavActiveLink` — scroll-spy active-state highlighting in the nav.

### Data
Every piece of content currently hardcoded into the two HTML files moves into
typed `.ts` files under `lib/data/`, so no section component contains
hand-authored copy — components render props/imports, data files hold the
actual content. One file per content domain:

- `lib/data/site.ts` — site-wide constants: name, role/title, email, phone,
  social links (LinkedIn/GitHub/live-portfolio), OG image path, base
  metadata (title/description) reused by both routes.
- `lib/data/projects.ts` — the 4 projects (ResearchBridge, Estate-Mind,
  Smart Inventory, MLOps Pipeline) as a typed array: title, description,
  tags, image path, link. Single source of truth for the home page's About
  mention and the `/projects` grid. This mirrors the pattern already used in
  the user's other Next.js project, without importing from it — this is this
  app's own copy, so the two projects stay fully independent per the earlier
  decision.
- `lib/data/experience.ts` — the 3 roles (iTransform365, Swiver × 2) as a
  typed array: role, company, dates, bullet points, tech tags.
- `lib/data/techStack.ts` — the 6 stack categories (Data & ML, Backend &
  APIs, Databases, DevOps & MLOps, Frontend, Languages) as a typed array of
  `{ label, tags[] }`.
- `lib/data/certifications.ts` — the 3 certifications as a typed array:
  index, title, issuer.
- `lib/data/stats.ts` — the 2 stat blocks (graduation year, years of
  experience) as a typed array: label, value, suffix, description.
- `lib/data/nav.ts` — nav + footer link lists (About/Skills/Experience/
  Projects, socials), since both the header nav and footer navigation
  columns currently repeat the same links.

Each `lib/data/*.ts` file exports both its data and the TypeScript
`interface`/`type` describing it (e.g. `export interface ExperienceRole {
role: string; company: string; dates: string; bullets: string[]; tags:
string[] }`), so section components import a type-safe shape rather than
inferring structure from props ad hoc.

### Images
- The 4 project screenshots (`assets/img/projects/*.jpg`) move to
  `public/images/projects/` and render via `next/image` wherever they're
  used as `<img>` (the About section's screenshot and the `/projects`
  grid) — real optimization win.
- The favicon SVG moves to `app/icon.svg` (Next.js's built-in favicon
  convention) instead of a manual `<link rel="icon">`.
- The 249 scroll-animation frames move to `public/frames/` and stay plain
  static files (not `next/image` — see `ScrollCanvas` above).

### Metadata
- Current manual `<meta>` tags (title, description, OG tags, twitter
  card) become the `metadata` export in `app/layout.tsx` and per-page
  `app/page.tsx` / `app/projects/page.tsx` — Next.js's built-in metadata
  API, functionally identical output.

### What's explicitly preserved byte-for-byte
- All copy (hero, experience bullets, stack tags, certifications, contact
  form labels, footer).
- All real links (GitHub repos, LinkedIn, email).
- The mailto-based contact form (no backend added — out of scope).
- Every animation's exact timing/easing/thresholds.

## Migration mapping (file-by-file)

```
index.html              → app/page.tsx (+ components below)
projects.html           → app/projects/page.tsx
<style> (both files)    → app/globals.css
inline <script>         → ScrollCanvas.tsx, ScrollFadeIn.tsx,
                          AnimatedStat.tsx, NavActiveLink.tsx
hardcoded copy/content   → lib/data/site.ts, projects.ts, experience.ts,
                          techStack.ts, certifications.ts, stats.ts, nav.ts
assets/img/favicon.svg   → app/icon.svg
assets/img/projects/*    → public/images/projects/* (via next/image)
ezgif-.../ (249 frames)  → public/frames/*.jpg (unchanged, referenced by ScrollCanvas)
```

## Verification plan

- `npm run build` succeeds with no type errors.
- `npm run dev`, manually compare each section against the current static
  site side-by-side (copy, layout, spacing) for both routes.
- Scroll-canvas animation still progressively loads and falls back to
  nearest-loaded-frame correctly.
- Stat counters still animate on scroll-into-view and respect
  `prefers-reduced-motion`.
- Nav active-highlighting still works on both routes.
- All external links (GitHub, LinkedIn, mailto) still resolve correctly.
- Lighthouse pass (informal) to confirm the `next/image` swap is a real win,
  not a regression.

## Open question for implementation planning

None outstanding — approach is fully specified above. The only decision
deferred to the implementation plan itself is exact commit granularity
(e.g., scaffold → migrate CSS → migrate layout/nav/footer → migrate each
section → migrate scripts → migrate projects page, as separate commits).
