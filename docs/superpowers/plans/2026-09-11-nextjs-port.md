# Next.js Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the static two-page site (`index.html`, `projects.html`) into a standalone Next.js 14 App Router project, with all content centralized in typed `lib/data/*.ts` files and the UI split into small, single-responsibility components — no visual changes beyond what the spec already calls out.

**Architecture:** Next.js 14 App Router + TypeScript + one global stylesheet (no Tailwind, no CSS Modules — the existing hand-tuned CSS moves over as-is, deduplicated between the two former pages). Server Components render static markup from imported data; four genuinely interactive behaviors (scroll-driven canvas animation, scroll fade-ins, animated stat counters, nav scroll-spy) become small Client Components. Pure logic (frame-index math, easing) is extracted into plain `lib/*.ts` functions so it's unit-testable without a DOM.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript 5, Vitest + @testing-library/react for tests, `next/font/google` for Inter + JetBrains Mono, `next/image` for the 4 project screenshots.

**Spec:** `docs/superpowers/specs/2026-09-11-nextjs-port-design.md`

## Global Constraints

- No Tailwind, no CSS-in-JS, no CSS Modules — one `app/globals.css`, existing class names preserved.
- No content changes beyond what's already on the two current pages.
- No new features (no CMS, no backend for the contact form — stays `mailto:`).
- Fully independent app: own `package.json`, own `node_modules`, own Vercel deployment. Never imports from the sibling `portfolio` (Next.js) project.
- Every section's copy, links, and animation timing/easing must match the current site exactly unless a task explicitly says otherwise (the only intentional visual change: `projects.html` adopts the home page's design tokens — mono font, `--bg-dark: #111111`, `--bg-elevated`, `--border-subtle` — since both pages now share one stylesheet).
- All content (text, links, tags, dates) lives in `lib/data/*.ts`, never hardcoded inside a component.

---

## File Structure

```
package.json
tsconfig.json
next.config.mjs
vitest.config.ts
vitest.setup.ts
.gitignore

app/
  layout.tsx                 — root layout: fonts, metadata, Nav, Footer, globals.css
  globals.css                — the entire merged/deduplicated stylesheet
  icon.svg                   — favicon (Next.js convention)
  page.tsx                   — home route ("/")
  projects/
    page.tsx                 — "/projects" route
  components/
    Nav.tsx                  — server: renders nav links from data
    NavActiveLink.tsx        — client: scroll-spy active-state highlighting
    Footer.tsx                — server: renders footer from data
    Hero.tsx                  — server: hero copy + service list
    ScrollCanvas.tsx          — client: frame-sequence scroll animation
    ScrollFadeIn.tsx          — client: generic fade-in-on-scroll wrapper
    Experience.tsx            — server: maps experience data
    ExperienceItem.tsx        — server: one timeline entry
    About.tsx                 — server: "Architecting..." section
    TechStack.tsx             — server: maps tech stack categories
    StackCard.tsx             — server: one category card
    Contact.tsx                — server: headline + static form
    Stats.tsx                  — server: maps home-page stat blocks
    AnimatedStat.tsx           — client: count-up-on-scroll number
    Certifications.tsx         — server: maps certifications
    CertCard.tsx                — server: one certification card
    ProjectCard.tsx             — server: one project (used on both routes)
    Philosophy.tsx               — server: projects-page philosophy/stat grid

lib/
  scrollFrames.ts             — pure functions: nearestLoadedIndex, getTargetFrameIndex
  scrollFrames.test.ts
  animation.ts                — pure function: easeOutCubic
  animation.test.ts
  data/
    site.ts                  — name, role, contact, socials, base metadata
    nav.ts                    — nav + footer link lists
    experience.ts               — 3 roles
    techStack.ts                 — 6 stack categories
    certifications.ts             — 3 certifications
    stats.ts                       — 2 home-page animated stats
    philosophy.ts                   — projects-page 4-item stat grid + copy
    projects.ts                      — 4 projects
    data.test.ts               — shape/length assertions for every data file

public/
  images/projects/
    researchbridge.jpg
    estate-mind.jpg
    smart-inventory.jpg
    mlops-pipeline.jpg
  frames/
    ezgif-frame-001.jpg ... ezgif-frame-249.jpg
```

**Why this split:** each data file is one content domain (single responsibility, matches the spec). Each section component only renders — it never decides what the content is. The two genuinely reusable pure-logic pieces (frame math, easing) are extracted from their Client Components so they're testable as plain functions, which is where the real bugs would hide (off-by-one frame indices, easing curve mistakes) — DOM-wiring around them is thin and not worth exhaustively unit-testing.

---

### Task 1: Scaffold the Next.js project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `next-env.d.ts`
- Create: `.gitignore`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `app/layout.tsx` (placeholder, replaced fully in Task 5)
- Create: `app/page.tsx` (placeholder, replaced fully in Task 9)
- Create: `app/globals.css` (placeholder, replaced fully in Task 5)
- Test: `lib/sanity.test.ts`

**Interfaces:**
- Produces: a working `npm run dev`, `npm run build`, and `npm test` in this folder, which every later task builds on.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "mohamedaziz-portfolio-static",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^14.2.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^24.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `next.config.mjs`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

- [ ] **Step 4: Create `next-env.d.ts`**

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
```

- [ ] **Step 5: Create `.gitignore`**

```
# dependencies
/node_modules

# next.js build output
/.next/
/out/

# testing
/coverage

# misc
.DS_Store
*.pem
.env*.local
```

- [ ] **Step 6: Create `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 7: Create `vitest.setup.ts`**

```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 8: Create placeholder `app/globals.css`**

```css
:root {
  --primary-orange: #ff6b00;
}
```

- [ ] **Step 9: Create placeholder `app/layout.tsx`**

```tsx
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 10: Create placeholder `app/page.tsx`**

```tsx
export default function HomePage() {
  return <main>Placeholder</main>;
}
```

- [ ] **Step 11: Write the sanity test**

```typescript
// lib/sanity.test.ts
import { describe, it, expect } from "vitest";

describe("project scaffold", () => {
  it("runs a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 12: Install dependencies**

Run: `npm install`
Expected: installs cleanly, creates `package-lock.json` and `node_modules/`.

- [ ] **Step 13: Run the test to verify the harness works**

Run: `npm test`
Expected: PASS — 1 test passed (`lib/sanity.test.ts`).

- [ ] **Step 14: Verify the dev server boots**

Run: `npm run dev` (in the background, then stop it)
Expected: starts without errors, serves the placeholder page at `http://localhost:3000`.

- [ ] **Step 15: Verify production build succeeds**

Run: `npm run build`
Expected: builds successfully with no type errors.

- [ ] **Step 16: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.mjs next-env.d.ts .gitignore vitest.config.ts vitest.setup.ts app/layout.tsx app/page.tsx app/globals.css lib/sanity.test.ts
git commit -m "Scaffold Next.js 14 App Router project with Vitest"
```

---

### Task 2: Migrate static assets into `public/`

**Files:**
- Create (via `git mv`): `public/images/projects/researchbridge.jpg`
- Create (via `git mv`): `public/images/projects/estate-mind.jpg`
- Create (via `git mv`): `public/images/projects/smart-inventory.jpg`
- Create (via `git mv`): `public/images/projects/mlops-pipeline.jpg`
- Create (via `git mv`): `app/icon.svg`
- Create (via `git mv`): `public/frames/ezgif-frame-001.jpg` ... `ezgif-frame-249.jpg`

**Interfaces:**
- Produces: `public/images/projects/*.jpg`, `public/frames/*.jpg`, and `app/icon.svg`, referenced by name in later tasks (Task 8's `ProjectCard`, Task 6's `ScrollCanvas`, Task 5's `app/icon.svg` convention).

Using `git mv` (not copy) preserves file history and avoids the old static files and the new Next.js public assets existing as separate, duplicated binary blobs in the same commit.

- [ ] **Step 1: Move project screenshots**

```bash
mkdir -p public/images/projects
git mv assets/img/projects/researchbridge.jpg public/images/projects/researchbridge.jpg
git mv assets/img/projects/estate-mind.jpg public/images/projects/estate-mind.jpg
git mv assets/img/projects/smart-inventory.jpg public/images/projects/smart-inventory.jpg
git mv assets/img/projects/mlops-pipeline.jpg public/images/projects/mlops-pipeline.jpg
```

- [ ] **Step 2: Move the favicon to the Next.js convention path**

```bash
git mv assets/img/favicon.svg app/icon.svg
```

- [ ] **Step 3: Move the 249 scroll-animation frames**

```bash
mkdir -p public/frames
git mv ezgif-65715f738e050025-jpg/*.jpg public/frames/
```

- [ ] **Step 4: Remove the now-empty old directories**

```bash
rmdir assets/img/projects assets/img assets 2>/dev/null || true
rmdir ezgif-65715f738e050025-jpg 2>/dev/null || true
```

- [ ] **Step 5: Verify the moves**

Run: `git status --short`
Expected: shows renames (`R`) for all 254 files, no plain deletions or untracked new files — confirming git tracked these as moves, not delete+add.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Move static assets into Next.js public/ and app/icon.svg conventions"
```

---

### Task 3: Pure logic modules — scroll-frame math and easing (TDD)

**Files:**
- Create: `lib/scrollFrames.ts`
- Test: `lib/scrollFrames.test.ts`
- Create: `lib/animation.ts`
- Test: `lib/animation.test.ts`

**Interfaces:**
- Produces:
  - `nearestLoadedIndex(loaded: boolean[], targetIndex: number): number` — returns the closest loaded frame index to `targetIndex`, searching outward in both directions; returns `-1` if none loaded.
  - `getTargetFrameIndex(scrollTop: number, maxScrollTop: number, frameCount: number): number` — maps a scroll position to a frame index, clamped to `[0, frameCount - 1]`.
  - `easeOutCubic(t: number): number` — standard ease-out-cubic easing, `t` in `[0, 1]`.
- Consumes: nothing (pure, no dependencies).

These three functions are the actual logic inside the current page's inline `<script>` (the `nearestLoadedIndex`, `getTargetFrameIndex`, and the `1 - Math.pow(1 - progress, 3)` easing term) — extracted so Task 7's Client Components can import and use them without re-deriving the math, and so the math itself is unit-tested independent of any DOM/canvas mocking.

- [ ] **Step 1: Write the failing tests for `scrollFrames.ts`**

```typescript
// lib/scrollFrames.test.ts
import { describe, it, expect } from "vitest";
import { nearestLoadedIndex, getTargetFrameIndex } from "./scrollFrames";

describe("nearestLoadedIndex", () => {
  it("returns the target index itself when it is loaded", () => {
    const loaded = [true, true, true];
    expect(nearestLoadedIndex(loaded, 1)).toBe(1);
  });

  it("returns the nearest loaded index below when target is not loaded", () => {
    const loaded = [true, false, false];
    expect(nearestLoadedIndex(loaded, 2)).toBe(0);
  });

  it("returns the nearest loaded index above when nothing below is loaded", () => {
    const loaded = [false, false, true];
    expect(nearestLoadedIndex(loaded, 0)).toBe(2);
  });

  it("prefers the closer of two equally-plausible directions", () => {
    // target=2, index 1 is 1 away, index 4 is 2 away — prefer 1
    const loaded = [false, true, false, false, true];
    expect(nearestLoadedIndex(loaded, 2)).toBe(1);
  });

  it("returns -1 when nothing is loaded", () => {
    const loaded = [false, false, false];
    expect(nearestLoadedIndex(loaded, 1)).toBe(-1);
  });
});

describe("getTargetFrameIndex", () => {
  it("returns frame 0 at the top of the page", () => {
    expect(getTargetFrameIndex(0, 1000, 249)).toBe(0);
  });

  it("returns the last frame at the bottom of the page", () => {
    expect(getTargetFrameIndex(1000, 1000, 249)).toBe(248);
  });

  it("clamps to 0 when maxScrollTop is 0 or negative (short page)", () => {
    expect(getTargetFrameIndex(0, 0, 249)).toBe(0);
    expect(getTargetFrameIndex(50, -10, 249)).toBe(0);
  });

  it("clamps to the last frame when scrollTop exceeds maxScrollTop", () => {
    expect(getTargetFrameIndex(2000, 1000, 249)).toBe(248);
  });

  it("maps a mid-scroll position to a proportional frame", () => {
    // 50% scrolled through a 249-frame sequence
    const result = getTargetFrameIndex(500, 1000, 249);
    expect(result).toBeGreaterThanOrEqual(123);
    expect(result).toBeLessThanOrEqual(125);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- scrollFrames`
Expected: FAIL — `lib/scrollFrames.ts` does not exist yet.

- [ ] **Step 3: Implement `lib/scrollFrames.ts`**

```typescript
// lib/scrollFrames.ts

/**
 * Finds the loaded frame index closest to targetIndex, searching outward
 * in both directions. Returns -1 if no frame is loaded yet.
 */
export function nearestLoadedIndex(
  loaded: boolean[],
  targetIndex: number,
): number {
  if (loaded[targetIndex]) return targetIndex;

  const frameCount = loaded.length;
  for (let offset = 1; offset < frameCount; offset++) {
    const below = targetIndex - offset;
    if (below >= 0 && loaded[below]) return below;
    const above = targetIndex + offset;
    if (above < frameCount && loaded[above]) return above;
  }
  return -1;
}

/**
 * Maps the current scroll position to a frame index in [0, frameCount - 1].
 */
export function getTargetFrameIndex(
  scrollTop: number,
  maxScrollTop: number,
  frameCount: number,
): number {
  let scrollFraction = scrollTop / maxScrollTop;
  if (!isFinite(scrollFraction) || scrollFraction < 0) scrollFraction = 0;
  if (scrollFraction > 1) scrollFraction = 1;

  return Math.min(frameCount - 1, Math.ceil(scrollFraction * frameCount));
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- scrollFrames`
Expected: PASS — all `scrollFrames.test.ts` tests green.

- [ ] **Step 5: Write the failing test for `animation.ts`**

```typescript
// lib/animation.test.ts
import { describe, it, expect } from "vitest";
import { easeOutCubic } from "./animation";

describe("easeOutCubic", () => {
  it("returns 0 at t=0", () => {
    expect(easeOutCubic(0)).toBe(0);
  });

  it("returns 1 at t=1", () => {
    expect(easeOutCubic(1)).toBe(1);
  });

  it("is greater than the linear value partway through (ease-out shape)", () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });

  it("is monotonically increasing", () => {
    const a = easeOutCubic(0.2);
    const b = easeOutCubic(0.5);
    const c = easeOutCubic(0.8);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm test -- animation`
Expected: FAIL — `lib/animation.ts` does not exist yet.

- [ ] **Step 7: Implement `lib/animation.ts`**

```typescript
// lib/animation.ts

/** Ease-out-cubic: fast start, gentle finish. t and the return value are both in [0, 1]. */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test -- animation`
Expected: PASS — all `animation.test.ts` tests green.

- [ ] **Step 9: Commit**

```bash
git add lib/scrollFrames.ts lib/scrollFrames.test.ts lib/animation.ts lib/animation.test.ts
git commit -m "Add pure scroll-frame and easing logic with tests"
```

---

### Task 4: Data layer — `lib/data/*.ts`

**Files:**
- Create: `lib/data/site.ts`
- Create: `lib/data/nav.ts`
- Create: `lib/data/experience.ts`
- Create: `lib/data/techStack.ts`
- Create: `lib/data/certifications.ts`
- Create: `lib/data/stats.ts`
- Create: `lib/data/philosophy.ts`
- Create: `lib/data/projects.ts`
- Test: `lib/data/data.test.ts`

**Interfaces:**
- Produces: every named export below, consumed directly by Task 5 (Nav/Footer), Task 7 (Hero/Experience/About/TechStack/Contact/Stats), and Task 8 (Certifications/ProjectCard/Philosophy).

- [ ] **Step 1: Write the failing data-shape tests**

```typescript
// lib/data/data.test.ts
import { describe, it, expect } from "vitest";
import { site } from "./site";
import { navLinks } from "./nav";
import { experienceRoles } from "./experience";
import { techStackCategories } from "./techStack";
import { certifications } from "./certifications";
import { homeStats } from "./stats";
import { philosophyStats, philosophyCopy } from "./philosophy";
import { projects } from "./projects";

describe("site data", () => {
  it("has the expected identity fields", () => {
    expect(site.name).toBe("Mohamed Aziz Ouertatani");
    expect(site.email).toBe("ouertatanimohamedaziz@gmail.com");
    expect(site.phone).toBe("+216 29 241 717");
  });

  it("has all three social links", () => {
    expect(site.socials.linkedin).toContain("linkedin.com");
    expect(site.socials.github).toContain("github.com");
    expect(site.socials.livePortfolio).toContain("vercel.app");
  });
});

describe("nav data", () => {
  it("has 4 nav links ending with Projects", () => {
    expect(navLinks).toHaveLength(4);
    expect(navLinks[navLinks.length - 1].label).toBe("Projects");
  });
});

describe("experience data", () => {
  it("has exactly 3 roles in reverse-chronological-by-recency order", () => {
    expect(experienceRoles).toHaveLength(3);
    expect(experienceRoles[0].company).toBe("iTransform365");
    expect(experienceRoles[1].company).toBe("Swiver");
    expect(experienceRoles[2].company).toBe("Swiver");
  });

  it("every role has at least one bullet and one tag", () => {
    for (const role of experienceRoles) {
      expect(role.bullets.length).toBeGreaterThan(0);
      expect(role.tags.length).toBeGreaterThan(0);
    }
  });
});

describe("tech stack data", () => {
  it("has exactly 6 categories", () => {
    expect(techStackCategories).toHaveLength(6);
  });

  it("every category has a non-empty label and at least one tag", () => {
    for (const category of techStackCategories) {
      expect(category.label.length).toBeGreaterThan(0);
      expect(category.tags.length).toBeGreaterThan(0);
    }
  });
});

describe("certifications data", () => {
  it("has exactly 3 certifications, indexed 01-03", () => {
    expect(certifications).toHaveLength(3);
    expect(certifications.map((c) => c.index)).toEqual(["01", "02", "03"]);
  });
});

describe("home stats data", () => {
  it("has exactly 2 stats", () => {
    expect(homeStats).toHaveLength(2);
  });

  it("includes the graduation year and years of experience", () => {
    const values = homeStats.map((s) => s.value);
    expect(values).toContain(2027);
    expect(values).toContain(2);
  });
});

describe("philosophy data", () => {
  it("has exactly 4 stat items", () => {
    expect(philosophyStats).toHaveLength(4);
  });

  it("has heading and body copy", () => {
    expect(philosophyCopy.heading.length).toBeGreaterThan(0);
    expect(philosophyCopy.body.length).toBeGreaterThan(0);
  });
});

describe("projects data", () => {
  it("has exactly 4 projects", () => {
    expect(projects).toHaveLength(4);
  });

  it("every project has a slug, image, and link", () => {
    for (const project of projects) {
      expect(project.slug.length).toBeGreaterThan(0);
      expect(project.image.length).toBeGreaterThan(0);
      expect(project.link.startsWith("https://")).toBe(true);
    }
  });

  it("includes the real GitHub repo links", () => {
    const links = projects.map((p) => p.link);
    expect(links).toContain(
      "https://github.com/mohamedaziz-ouertatani/ResearchBridge",
    );
    expect(links).toContain(
      "https://github.com/mohamedaziz-ouertatani/estate-mind",
    );
    expect(links).toContain(
      "https://github.com/mohamedaziz-ouertatani/smart_inventory",
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- data.test`
Expected: FAIL — none of the `lib/data/*.ts` files exist yet.

- [ ] **Step 3: Implement `lib/data/site.ts`**

```typescript
// lib/data/site.ts

export interface SiteData {
  name: string;
  shortName: string;
  role: string;
  tagline: string;
  email: string;
  phone: string;
  socials: {
    linkedin: string;
    github: string;
    livePortfolio: string;
  };
  metaDescription: string;
}

export const site: SiteData = {
  name: "Mohamed Aziz Ouertatani",
  shortName: "Aziz Ouertatani",
  role: "Data Science & MLOps Engineer",
  tagline:
    "Final-year Computer Science Engineering student specializing in Data Science, bridging backend APIs and predictive analytics.",
  email: "ouertatanimohamedaziz@gmail.com",
  phone: "+216 29 241 717",
  socials: {
    linkedin: "https://linkedin.com/in/mohamed-aziz-ouertatani",
    github: "https://github.com/mohamedaziz-ouertatani",
    livePortfolio: "https://mohamedaziz-ouertatani.vercel.app",
  },
  metaDescription:
    "Final-year Computer Science Engineering student specializing in Data Science. Building end-to-end data pipelines, ML systems, and scalable web applications — seeking a 6-month PFE internship.",
};
```

- [ ] **Step 4: Implement `lib/data/nav.ts`**

```typescript
// lib/data/nav.ts

export interface NavLink {
  label: string;
  href: string;
}

/** Shared between the header nav and the footer's "Navigation" column. */
export const navLinks: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "/projects" },
];
```

> No separate `footerSocialLinks` list — the footer's social URLs are the same ones already in `site.socials` (`lib/data/site.ts`). Duplicating them here would mean two places to update the same 3 URLs. `Footer.tsx` (Step 6 below) builds its social link labels from `site.socials` directly.

- [ ] **Step 5: Implement `lib/data/experience.ts`**

```typescript
// lib/data/experience.ts

export interface ExperienceRole {
  role: string;
  company: string;
  dates: string;
  bullets: string[];
  tags: string[];
}

export const experienceRoles: ExperienceRole[] = [
  {
    role: "Next.js Developer Intern",
    company: "iTransform365",
    dates: "May 2024 — Aug 2024",
    bullets: [
      "Built and optimized Next.js components for performance and scalability; implemented responsive UI with Tailwind CSS and TypeScript.",
      "Collaborated with backend engineers to integrate PostgreSQL services and delivered production-ready features.",
    ],
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
  },
  {
    role: "React.js Developer",
    company: "Swiver",
    dates: "Aug 2022 — Apr 2023",
    bullets: [
      "Developed responsive UI components with React.js and TypeScript; implemented multilingual support (Arabic, English, French).",
      "Optimized application logic to improve UX performance, building on a prior internship at Swiver.",
    ],
    tags: ["React.js", "TypeScript", "JavaScript", "Multilingual Support"],
  },
  {
    role: "React.js Developer Intern",
    company: "Swiver",
    dates: "Jun 2022 — Aug 2022",
    bullets: [
      "Improved UI responsiveness and translation features; implemented component logic to enhance functionality.",
      "Collaborated on accessibility improvements for wider usability.",
    ],
    tags: ["React.js", "Bootstrap", "JavaScript", "Accessibility"],
  },
];
```

- [ ] **Step 6: Implement `lib/data/techStack.ts`**

```typescript
// lib/data/techStack.ts

export interface TechStackCategory {
  label: string;
  tags: string[];
}

export const techStackCategories: TechStackCategory[] = [
  {
    label: "Data & Machine Learning",
    tags: ["Pandas", "NumPy", "scikit-learn", "statsmodels", "MLflow"],
  },
  {
    label: "Backend & APIs",
    tags: ["Fastify", "Node.js", "Express", "REST APIs", "JWT / RBAC"],
  },
  {
    label: "Databases",
    tags: ["PostgreSQL", "MongoDB", "Neo4j", "Data Warehousing"],
  },
  {
    label: "DevOps & MLOps",
    tags: ["Docker", "CI/CD", "Experiment Tracking"],
  },
  {
    label: "Frontend",
    tags: ["React", "Next.js", "Tailwind CSS"],
  },
  {
    label: "Languages",
    tags: ["Python", "TypeScript", "JavaScript", "SQL", "Java", "R"],
  },
];
```

- [ ] **Step 7: Implement `lib/data/certifications.ts`**

```typescript
// lib/data/certifications.ts

export interface Certification {
  index: string;
  title: string;
  issuer: string;
}

export const certifications: Certification[] = [
  {
    index: "01",
    title: "CCNA: Switching, Routing & Wireless Essentials",
    issuer: "Cisco Networking Academy",
  },
  {
    index: "02",
    title: "MongoDB Node.js Developer Path",
    issuer: "MongoDB University",
  },
  {
    index: "03",
    title: "Neo4j Fundamentals",
    issuer: "Neo4j GraphAcademy",
  },
];
```

- [ ] **Step 8: Implement `lib/data/stats.ts`**

```typescript
// lib/data/stats.ts

export interface HomeStat {
  label: string;
  value: number;
  suffix?: string;
  description: string;
}

/** Home page's animated (count-up-on-scroll) stat blocks. */
export const homeStats: HomeStat[] = [
  {
    label: "ACADEMIC EXCELLENCE",
    value: 2027,
    description: "Expected Engineering Degree in Computer Science at ESPRIT",
  },
  {
    label: "PROFESSIONAL EXPERIENCE",
    value: 2,
    suffix: "+",
    description: "Years of applied experience building web & data solutions",
  },
];
```

- [ ] **Step 9: Implement `lib/data/philosophy.ts`**

```typescript
// lib/data/philosophy.ts

export interface PhilosophyStat {
  value: string;
  label: string;
}

/** Projects page's static (non-animated) philosophy stat grid. */
export const philosophyStats: PhilosophyStat[] = [
  { value: "3+", label: "Major Projects" },
  { value: "2+", label: "Years Experience" },
  { value: "3", label: "Professional Certs" },
  { value: "100%", label: "Open-Source First" },
];

export const philosophyCopy = {
  heading: "Engineering Robust Solutions.",
  body: "Every system is approached with a focus on reliability, scalability, and type-safety. I don't just write scripts; I architect production-oriented platforms bridging APIs and predictive analytics.",
};
```

- [ ] **Step 10: Implement `lib/data/projects.ts`**

```typescript
// lib/data/projects.ts

export interface Project {
  slug: string;
  title: string;
  tagLabel: string;
  tagline: string;
  description: string;
  image: string;
  link: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    slug: "researchbridge",
    title: "ResearchBridge",
    tagLabel: "Python & LLM APIs",
    tagline: "Research Intelligence Platform",
    description:
      "Solo-built platform that takes a research idea or paper and returns an evidence-grounded assessment — novelty, gaps, and feasibility — via PostgreSQL + pgvector retrieval and LLM-based knowledge extraction, with every claim tied to cited sources.",
    image: "/images/projects/researchbridge.jpg",
    link: "https://github.com/mohamedaziz-ouertatani/ResearchBridge",
    featured: false,
  },
  {
    slug: "estate-mind",
    title: "Estate-Mind",
    tagLabel: "Pandas & Plotly",
    tagline: "Tunisian Real Estate Data Pipeline & EDA",
    description:
      "Reproducible pipeline cleaning and standardizing multi-source scraped listings, with advanced EDA — price distribution, density heatmaps, and property-segment clustering — for Tunisia's second-hand real estate market.",
    image: "/images/projects/estate-mind.jpg",
    link: "https://github.com/mohamedaziz-ouertatani/estate-mind",
    featured: false,
  },
  {
    slug: "smart-inventory",
    title: "Smart Inventory Forecasting & Replenishment Platform",
    tagLabel: "Fastify & MLflow",
    tagline: "Production-Style Forecasting System",
    description:
      "Containerized platform with data ingestion, feature engineering, rolling backtests, and ETS/ARIMA model selection tracked in MLflow. Forecasts and accuracy metrics are persisted to PostgreSQL and served through JWT-protected Fastify APIs.",
    image: "/images/projects/smart-inventory.jpg",
    link: "https://github.com/mohamedaziz-ouertatani/smart_inventory",
    featured: true,
  },
  {
    slug: "mlops-pipeline",
    title: "ML Project — MLOps Pipeline",
    tagLabel: "scikit-learn & Docker",
    tagline: "Reproducible Training & Deployment",
    description:
      "End-to-end scikit-learn pipeline with MLflow experiment tracking, versioned artifacts via Joblib, and a containerized inference app for reproducible deployment.",
    image: "/images/projects/mlops-pipeline.jpg",
    link: "https://github.com/mohamedaziz-ouertatani",
    featured: false,
  },
];
```

- [ ] **Step 11: Run the tests to verify they pass**

Run: `npm test -- data.test`
Expected: PASS — all data-shape tests green.

- [ ] **Step 12: Commit**

```bash
git add lib/data
git commit -m "Add typed content data layer under lib/data"
```

---

### Task 5: Root layout, global stylesheet, Nav, Footer

**Files:**
- Modify: `app/globals.css` (full content, replacing the Task 1 placeholder)
- Modify: `app/layout.tsx` (full content, replacing the Task 1 placeholder)
- Create: `app/components/Nav.tsx`
- Create: `app/components/Footer.tsx`
- Create: `app/components/BackToTopLink.tsx`
- Test: `app/components/Nav.test.tsx`
- Test: `app/components/Footer.test.tsx`

**Interfaces:**
- Consumes: `site` (`lib/data/site.ts`), `navLinks` (`lib/data/nav.ts`).
- Produces: `<Nav />` and `<Footer />` components, rendered by `app/layout.tsx` on every route; the CSS classes every later component targets (`.container`, `.btn`, `.badge`, section-specific classes below).

This is the largest single file in the port (the merged, deduplicated CSS from both current pages). It's grouped into one task because it isn't independently renderable/testable until wired into the layout — per the plan's right-sizing rule, setup that only makes sense together stays together.

- [ ] **Step 1: Write `app/globals.css`**

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap");

:root {
  --primary-orange: #ff6b00;
  --text-main: #ffffff;
  --text-muted: rgba(255, 255, 255, 0.6);
  --bg-dark: #111111;
  --bg-elevated: rgba(255, 255, 255, 0.04);
  --border-subtle: rgba(255, 255, 255, 0.1);
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}

.mono {
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: "Inter", sans-serif;
  overflow-x: hidden;
  position: relative;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

/* Scroll-triggered fade-in */
.fade-in {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.7s ease,
    transform 0.7s ease;
}
.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Canvas Background (home page only) */
.canvas-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 0;
}

canvas {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.canvas-scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      ellipse 55% 45% at 12% 8%,
      rgba(255, 107, 0, 0.16),
      transparent 60%
    ),
    radial-gradient(
      ellipse 45% 40% at 92% 85%,
      rgba(255, 107, 0, 0.1),
      transparent 65%
    ),
    linear-gradient(
      180deg,
      rgba(8, 8, 8, 0.5) 0%,
      rgba(10, 10, 10, 0.72) 32%,
      rgba(10, 10, 10, 0.88) 68%,
      rgba(8, 8, 8, 0.96) 100%
    );
}

.grid-texture {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.5), transparent 70%);
}

/* Projects-page ambient glow gradients */
.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
  z-index: -1;
  pointer-events: none;
}
.glow-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #ff3b00, #ff8c00);
  top: -100px;
  left: -200px;
}
.glow-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #ff0055, #ff6b00);
  top: 40%;
  right: -150px;
}
.glow-3 {
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, #ff6b00, #ff1a1a);
  bottom: 5%;
  left: -300px;
}

.content-overlay {
  position: relative;
  z-index: 1;
  width: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

section {
  padding: 120px 0;
}

/* Navbar */
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 0;
}
.logo {
  font-weight: 700;
  font-size: 1.2rem;
  letter-spacing: -0.5px;
  text-decoration: none;
  color: inherit;
}
.nav-links {
  display: flex;
  gap: 40px;
}
.nav-links a {
  position: relative;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
  padding-bottom: 4px;
}
.nav-links a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 1px;
  background: var(--primary-orange);
  transition: width 0.3s ease;
}
.nav-links a:hover,
.nav-links a.active {
  color: var(--text-main);
}
.nav-links a:hover::after,
.nav-links a.active::after {
  width: 100%;
}
.btn {
  background: white;
  color: black;
  padding: 10px 24px;
  border-radius: 30px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.3s;
}
.btn:hover {
  transform: scale(1.05);
}
.btn .icon {
  background: var(--primary-orange);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
}
.btn.orange {
  background: var(--primary-orange);
  color: white;
}
.btn.orange .icon {
  background: white;
  color: var(--primary-orange);
}

/* Badge */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  margin-bottom: 40px;
  text-transform: uppercase;
}
.badge .dot {
  width: 8px;
  height: 8px;
  background: #4a90e2;
  border-radius: 50%;
}

/* Hero Section */
.hero {
  padding: 100px 0 50px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.hero-title p {
  color: var(--primary-orange);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.hero-title h1 {
  font-size: 5rem;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -2px;
  font-weight: 600;
}
.hero-right {
  max-width: 300px;
  padding-top: 50px;
}
.hero-right h3 {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 15px;
  line-height: 1.3;
}
.hero-right p {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

.hero-services {
  display: flex;
  justify-content: space-between;
  margin-top: 150px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 40px;
}
.service-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.3s ease;
}
.service-item:hover {
  transform: translateY(-4px);
}
.service-item span.num {
  color: var(--primary-orange);
  font-family: var(--font-mono);
  font-size: 0.8rem;
}
.service-item span.name {
  font-size: 1rem;
  font-weight: 500;
}

/* Experience Section */
.experience-section {
  padding: 150px 0;
  border-top: 1px solid var(--border-subtle);
}
.exp-timeline {
  position: relative;
  padding-left: 44px;
  border-left: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 64px;
}
.exp-item {
  position: relative;
}
.exp-item::before {
  content: "";
  position: absolute;
  left: -50px;
  top: 6px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary-orange);
  box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.15);
}
.exp-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-bottom: 6px;
}
.exp-role-company {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}
.exp-role {
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: -0.3px;
}
.exp-company {
  color: var(--primary-orange);
  font-weight: 500;
  font-size: 1rem;
}
.exp-date {
  font-family: var(--font-mono);
  color: var(--text-muted);
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  white-space: nowrap;
  text-transform: uppercase;
}
.exp-bullets {
  list-style: none;
  padding: 0;
  margin: 16px 0 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 640px;
}
.exp-bullets li {
  color: var(--text-muted);
  font-size: 0.92rem;
  line-height: 1.6;
  padding-left: 20px;
  position: relative;
}
.exp-bullets li::before {
  content: "—";
  position: absolute;
  left: 0;
  color: var(--primary-orange);
}
.exp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.exp-tags span {
  font-size: 0.78rem;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-subtle);
}
@media (max-width: 768px) {
  .exp-timeline {
    padding-left: 28px;
  }
  .exp-item::before {
    left: -34px;
  }
}

/* About / Second Section */
.section-two {
  padding: 150px 0;
  min-height: 100vh;
}
.section-two-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 80px;
}
.section-two-left {
  max-width: 500px;
}
.section-two-left .subtitle {
  color: var(--primary-orange);
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 20px;
  display: block;
}
.section-two-left h2 {
  font-size: 3.5rem;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -1px;
}
.section-two-right {
  max-width: 400px;
  padding-top: 40px;
}
.section-two-right p.main-text {
  font-size: 1.2rem;
  line-height: 1.5;
  margin-bottom: 40px;
}
.section-two-right .cta-small {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-two-right .cta-small p {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

/* Tech Stack Section */
.workflow-section {
  padding: 150px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.workflow-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 40px;
  margin-bottom: 80px;
}
.workflow-header h2 {
  font-size: 2.5rem;
  line-height: 1.2;
  margin: 0;
  flex: 1;
  font-weight: 500;
  letter-spacing: -1px;
}
.workflow-header h2 em {
  font-style: italic;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
}
.workflow-header .desc {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
  max-width: 500px;
}

.stack-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 60px;
}
.stack-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 28px;
  backdrop-filter: blur(10px);
  transition:
    transform 0.3s ease,
    border-color 0.3s ease;
}
.stack-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 107, 0, 0.4);
}
.stack-card .stack-label {
  display: block;
  font-family: var(--font-mono);
  color: var(--primary-orange);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.stack-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.stack-tags span {
  font-size: 0.82rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-subtle);
}
.workflow-footer {
  font-size: 0.85rem;
  color: var(--text-muted);
  max-width: 600px;
  line-height: 1.5;
  position: relative;
  padding-left: 20px;
}
.workflow-footer::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  width: 6px;
  height: 6px;
  background: #4a90e2;
  border-radius: 50%;
}

/* Contact Section */
.contact-section {
  padding: 150px 0;
  min-height: 100vh;
}
.contact-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 40px;
  margin-bottom: 100px;
}
.contact-header h2 {
  margin: 0;
  font-size: 6rem;
  line-height: 0.95;
  font-weight: 500;
  letter-spacing: -3px;
  text-transform: uppercase;
}
.contact-header h2 em {
  font-style: normal;
  color: var(--primary-orange);
}
.contact-header .lets-talk {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  line-height: 1.5;
  color: var(--text-muted);
  font-weight: 400;
  max-width: 220px;
  text-transform: uppercase;
  padding-bottom: 10px;
}
.contact-header .lets-talk strong {
  color: var(--text-main);
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
  font-size: 0.85rem;
}

.contact-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px 80px;
}
.form-group {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 15px;
  transition: border-color 0.3s ease;
}
.form-group:focus-within {
  border-color: var(--primary-orange);
}
.form-group label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 20px;
  text-transform: uppercase;
  font-weight: 500;
}
.form-group input {
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 1rem;
  outline: none;
  font-family: inherit;
}
.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

/* Stats Section (home page) */
.stats-section {
  padding: 150px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.stats-container {
  display: flex;
  gap: 100px;
}
.stat-block {
  flex: 1;
}
.stat-top {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--primary-orange);
  letter-spacing: 0.08em;
  margin-bottom: 20px;
  text-transform: uppercase;
}
.stat-line {
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin-bottom: 40px;
}
.stat-number {
  font-size: 8rem;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -4px;
  margin-bottom: 20px;
}
.stat-number span {
  font-size: 4rem;
}
.stat-desc {
  font-size: 1.1rem;
  color: var(--text-muted);
  line-height: 1.4;
}

/* Certifications Section */
.certifications-section {
  padding: 150px 0;
  border-top: 1px solid var(--border-subtle);
}
.cert-header {
  max-width: 600px;
  margin-bottom: 60px;
}
.cert-header h2 {
  font-size: 2.5rem;
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: -1px;
  margin: 0;
}
.cert-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.cert-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 32px 28px;
  transition:
    transform 0.3s ease,
    border-color 0.3s ease;
}
.cert-card:hover {
  transform: translateY(-6px);
  border-color: rgba(255, 107, 0, 0.4);
}
.cert-index {
  display: block;
  font-family: var(--font-mono);
  color: var(--primary-orange);
  font-size: 0.85rem;
  margin-bottom: 24px;
}
.cert-card h4 {
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.4;
  margin: 0 0 10px;
}
.cert-card p {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0;
}
@media (max-width: 768px) {
  .stats-container {
    flex-direction: column;
    gap: 50px;
  }
}

/* Projects page: hero */
.projects-hero {
  padding-top: 150px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.projects-hero h1 {
  font-size: 5rem;
  line-height: 1.1;
  margin: 0 0 20px;
  letter-spacing: -2px;
  font-weight: 600;
}
.projects-hero p {
  color: var(--text-muted);
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto 80px;
  line-height: 1.5;
}

/* Projects page: grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 60px 40px;
}
.project-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s;
}
.project-card:hover {
  transform: translateY(-10px);
}
.project-card.featured {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}
.project-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}
.project-card.featured .project-img {
  aspect-ratio: 16 / 9;
}
.project-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}
.project-card:hover .project-img img {
  transform: scale(1.05);
}
.project-info h3 {
  font-size: 1.5rem;
  margin: 0 0 10px;
  font-weight: 500;
}
.project-card.featured .project-info h3 {
  font-size: 2rem;
}
.project-info .project-meta {
  color: var(--text-muted);
  margin: 0;
  font-size: 0.95rem;
  display: flex;
  gap: 15px;
}
.project-info .project-meta span {
  color: var(--primary-orange);
}
.project-info .project-description {
  color: var(--text-muted);
  font-size: 0.85rem;
  line-height: 1.4;
  margin-top: 10px;
}
.project-card.featured .project-info .project-description {
  font-size: 0.95rem;
  line-height: 1.6;
  margin-top: 20px;
}
.project-info .btn {
  width: fit-content;
  margin-top: 30px;
}

/* Projects page: philosophy */
.philosophy {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 30px;
  padding: 100px 80px;
  margin-top: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 60px;
}
.phil-left {
  flex: 1;
}
.phil-left h2 {
  font-size: 3rem;
  line-height: 1.1;
  margin: 0 0 20px;
  letter-spacing: -1px;
  font-weight: 500;
}
.phil-left p {
  color: var(--text-muted);
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
}
.phil-right {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}
.stat-item h4 {
  font-size: 2.5rem;
  margin: 0 0 10px;
  color: var(--primary-orange);
  font-weight: 400;
}
.stat-item p {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Projects page: CTA */
.cta-section {
  text-align: center;
  padding: 150px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.cta-section h2 {
  font-size: 4rem;
  line-height: 1;
  margin: 0 0 30px;
  letter-spacing: -2px;
  font-weight: 500;
}
.cta-section p {
  color: var(--text-muted);
  font-size: 1.1rem;
  margin: 0 auto 50px;
  max-width: 500px;
}
.cta-section .btn {
  display: inline-flex;
  font-size: 1.1rem;
  padding: 15px 35px;
}

/* Footer Section (shared) */
.site-footer {
  padding: 80px 0 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 60px;
}
.footer-brand h3 {
  font-size: 1.5rem;
  margin: 0 0 15px;
  letter-spacing: -0.5px;
  font-weight: 700;
}
.footer-brand p {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.5;
  max-width: 250px;
  margin: 0;
}
.footer-brand .footer-contact {
  margin-top: 15px;
  color: var(--text-main);
}
.footer-links {
  display: flex;
  gap: 80px;
}
.link-column {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.link-column h4 {
  margin: 0 0 10px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-main);
}
.link-column a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}
.link-column a:hover {
  color: var(--text-main);
}
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 30px;
}
.footer-bottom p {
  color: var(--text-muted);
  font-size: 0.8rem;
  margin: 0;
}
.footer-bottom-links a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.3s;
}
.footer-bottom-links a:hover {
  color: var(--text-main);
}

@media (max-width: 768px) {
  .footer-top {
    flex-direction: column;
    gap: 50px;
  }
  .footer-links {
    flex-wrap: wrap;
    gap: 40px;
  }
  .studio-info {
    position: relative;
  }
  .stats-container {
    flex-direction: column;
    gap: 50px;
  }
  .projects-grid,
  .phil-right {
    grid-template-columns: 1fr;
  }
  .project-card.featured {
    grid-template-columns: 1fr;
  }
  .philosophy {
    flex-direction: column;
    padding: 50px 30px;
  }
  .projects-hero h1 {
    font-size: 3.5rem;
  }
}
```

> Note on `.project-card.featured`, `.project-meta`, `.project-description`: the current `projects.html` achieves the "featured" (Smart Inventory) card's different layout and the tag/description styling entirely via inline `style="..."` attributes on specific `<a>`/`<p>` tags. Since Task 8's `ProjectCard` component takes a `featured` boolean prop (from `lib/data/projects.ts`) instead of hand-placing inline styles per project, these three classes replace those inline styles with real CSS rules — same visual result, no inline styles in the component.

- [ ] **Step 2: Write `app/layout.tsx`**

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import { site } from "@/lib/data/site";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.metaDescription,
  openGraph: {
    type: "website",
    title: `${site.name} — ${site.role}`,
    description: site.metaDescription,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <div className="content-overlay">
          <div className="container">
            <Nav />
          </div>
          {children}
          <div className="container">
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
```

> Note: `next/font` variables (`--font-inter`, `--font-jetbrains-mono`) are exposed as CSS custom properties on `<html>`. Add these two lines to the top of `app/globals.css`'s `:root` block (replacing the `@import url(...)` Google Fonts line, since `next/font` self-hosts the fonts instead of fetching them from Google at request time):

- [ ] **Step 3: Replace the font `@import` in `app/globals.css` with the `next/font` variables**

At the top of `app/globals.css`, replace:

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap");
```

with nothing (delete the line), and change the `body` and `--font-mono` rules to reference the `next/font` variables:

```css
:root {
  --primary-orange: #ff6b00;
  --text-main: #ffffff;
  --text-muted: rgba(255, 255, 255, 0.6);
  --bg-dark: #111111;
  --bg-elevated: rgba(255, 255, 255, 0.04);
  --border-subtle: rgba(255, 255, 255, 0.1);
  --font-mono: var(--font-jetbrains-mono), ui-monospace, monospace;
}
```

```css
body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: var(--font-inter), sans-serif;
  overflow-x: hidden;
  position: relative;
}
```

- [ ] **Step 4: Write `app/components/Nav.tsx`**

```tsx
// app/components/Nav.tsx
import Link from "next/link";
import { navLinks } from "@/lib/data/nav";
import { site } from "@/lib/data/site";
import NavActiveLink from "./NavActiveLink";

export default function Nav() {
  return (
    <nav>
      <Link href="/" className="logo">
        {site.shortName}
      </Link>
      <div className="nav-links">
        {navLinks.map((link) => (
          <NavActiveLink key={link.href} href={link.href} label={link.label} />
        ))}
      </div>
      <Link href="/#contact" className="btn">
        Get in touch <span className="icon">↗</span>
      </Link>
    </nav>
  );
}
```

> `NavActiveLink` is built in Task 6. For this task's test, stub it minimally so `Nav.test.tsx` can run — Task 6 replaces the stub with the real scroll-spy version.

- [ ] **Step 5: Write a temporary `app/components/NavActiveLink.tsx` stub (replaced fully in Task 6)**

```tsx
// app/components/NavActiveLink.tsx
"use client";

export default function NavActiveLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return <a href={href}>{label}</a>;
}
```

- [ ] **Step 6: Write `app/components/Footer.tsx`**

```tsx
// app/components/BackToTopLink.tsx
"use client";

export default function BackToTopLink() {
  return (
    <a
      href="#top"
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      Back to top &uarr;
    </a>
  );
}
```

> `Footer` is a Server Component (no `"use client"`), and Server Components cannot pass event handlers like `onClick` as props — Next.js's build fails with "Event handlers cannot be passed to Client Component props." The original static HTML used a plain inline `onclick="..."` attribute, which doesn't translate directly to JSX event props on a server-rendered element. The fix is the same pattern used everywhere else in this port: pull the one interactive piece into its own tiny Client Component and keep everything around it server-rendered.

```tsx
// app/components/Footer.tsx
import { site } from "@/lib/data/site";
import { navLinks } from "@/lib/data/nav";
import BackToTopLink from "./BackToTopLink";

const socialLinks = [
  { label: "LinkedIn", href: site.socials.linkedin },
  { label: "GitHub", href: site.socials.github },
  { label: "Portfolio", href: site.socials.livePortfolio },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <h3>{site.shortName}</h3>
          <p>
            Architecting production-oriented platforms bridging APIs and
            predictive analytics.
          </p>
          <p className="footer-contact">
            {site.phone}
            <br />
            {site.email}
          </p>
        </div>
        <div className="footer-links">
          <div className="link-column">
            <h4>Socials</h4>
            {socialLinks.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ))}
          </div>
          <div className="link-column">
            <h4>Navigation</h4>
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 {site.name}. All rights reserved.</p>
        <div className="footer-bottom-links">
          <BackToTopLink />
        </div>
      </div>
    </footer>
  );
}
```

> `socialLinks` is a small presentation-only array (label → which `site.socials` URL) built here, not exported from `lib/data` — the actual URLs still live in exactly one place, `site.socials`.

- [ ] **Step 7: Write the failing test for `Nav`**

```tsx
// app/components/Nav.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Nav from "./Nav";

describe("Nav", () => {
  it("renders the site short name as the logo", () => {
    render(<Nav />);
    expect(screen.getByText("Aziz Ouertatani")).toBeInTheDocument();
  });

  it("renders all 4 nav links", () => {
    render(<Nav />);
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("renders the Get in touch CTA", () => {
    render(<Nav />);
    expect(screen.getByText("Get in touch")).toBeInTheDocument();
  });
});
```

- [ ] **Step 8: Write the failing test for `Footer`**

```tsx
// app/components/Footer.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders the contact email and phone", () => {
    render(<Footer />);
    // Phone and email share one <p> separated by <br/>, so their text
    // nodes concatenate with no separator — match by regex (substring),
    // not an exact string, or this assertion fails against real markup.
    expect(
      screen.getByText(/ouertatanimohamedaziz@gmail\.com/),
    ).toBeInTheDocument();
    expect(screen.getByText(/\+216 29 241 717/)).toBeInTheDocument();
  });

  it("renders all 3 social links", () => {
    render(<Footer />);
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
  });

  it("renders the copyright line", () => {
    render(<Footer />);
    expect(
      screen.getByText(/Mohamed Aziz Ouertatani\. All rights reserved\./),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 9: Run the tests to verify they fail, then pass**

Run: `npm test -- Nav.test`
Expected first: FAIL (`Nav.tsx` doesn't exist) — then after Steps 4–6: PASS.

Run: `npm test -- Footer.test`
Expected: PASS.

- [ ] **Step 10: Verify the build still succeeds**

Run: `npm run build`
Expected: builds successfully — `app/page.tsx` is still the Task 1 placeholder, but the layout now wraps it correctly.

- [ ] **Step 11: Commit**

```bash
git add app/globals.css app/layout.tsx app/components/Nav.tsx app/components/Nav.test.tsx app/components/NavActiveLink.tsx app/components/Footer.tsx app/components/Footer.test.tsx app/components/BackToTopLink.tsx
git commit -m "Add root layout, merged global stylesheet, Nav and Footer components"
```

---

### Task 6: Client Components — scroll canvas, fade-in, nav scroll-spy, animated stat

**Files:**
- Create: `app/components/ScrollCanvas.tsx`
- Create: `app/components/ScrollFadeIn.tsx`
- Modify: `app/components/NavActiveLink.tsx` (replace Task 5's stub)
- Create: `app/components/AnimatedStat.tsx`
- Test: `app/components/ScrollFadeIn.test.tsx`
- Test: `app/components/NavActiveLink.test.tsx`
- Test: `app/components/AnimatedStat.test.tsx`

**Interfaces:**
- Consumes: `nearestLoadedIndex`, `getTargetFrameIndex` (`lib/scrollFrames.ts`), `easeOutCubic` (`lib/animation.ts`).
- Produces:
  - `<ScrollCanvas />` — used once by Task 7's `Hero`/home page.
  - `<ScrollFadeIn>{children}</ScrollFadeIn>` — a generic wrapper any section can use.
  - `<NavActiveLink href label />` — used by `Nav` (already wired in Task 5).
  - `<AnimatedStat value={2027} suffix="" />` — used by Task 7's `Stats`.

- [ ] **Step 1: Write `app/components/ScrollCanvas.tsx`**

```tsx
// app/components/ScrollCanvas.tsx
"use client";

import { useEffect, useRef } from "react";
import { nearestLoadedIndex, getTargetFrameIndex } from "@/lib/scrollFrames";

const FRAME_COUNT = 249;
const BATCH_SIZE = 8;

function frameSrc(frameNumber: number): string {
  return `/frames/ezgif-frame-${frameNumber.toString().padStart(3, "0")}.jpg`;
}

export default function ScrollCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    const loaded: boolean[] = new Array(FRAME_COUNT).fill(false);
    let lastRenderedIndex = -1;

    function loadFrame(frameNumber: number): HTMLImageElement {
      const idx = frameNumber - 1;
      if (images[idx]) return images[idx];
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        loaded[idx] = true;
      };
      img.src = frameSrc(frameNumber);
      images[idx] = img;
      return img;
    }

    function renderFrame(frameIndex: number) {
      const drawIndex = nearestLoadedIndex(loaded, frameIndex);
      if (drawIndex === -1 || drawIndex === lastRenderedIndex) return;
      const img = images[drawIndex];
      if (!img || !img.complete || !context || !canvas) return;

      lastRenderedIndex = drawIndex;
      const ratio = Math.max(
        window.innerWidth / img.width,
        window.innerHeight / img.height,
      );
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const drawWidth = img.width * ratio;
      const drawHeight = img.height * ratio;
      const x = (window.innerWidth - drawWidth) / 2;
      const y = (window.innerHeight - drawHeight) / 2;

      context.drawImage(img, x, y, drawWidth, drawHeight);
    }

    function currentTargetIndex(): number {
      const scrollTop = document.documentElement.scrollTop;
      const maxScrollTop =
        document.documentElement.scrollHeight - window.innerHeight;
      return getTargetFrameIndex(scrollTop, maxScrollTop, FRAME_COUNT);
    }

    function streamRemainingFrames(startAt: number) {
      let next = startAt;

      function loadBatch() {
        const end = Math.min(next + BATCH_SIZE, FRAME_COUNT + 1);
        for (; next < end; next++) {
          loadFrame(next);
        }
        if (next <= FRAME_COUNT) {
          scheduleNextBatch();
        }
      }

      function scheduleNextBatch() {
        if ("requestIdleCallback" in window) {
          requestIdleCallback(loadBatch, { timeout: 500 });
        } else {
          setTimeout(loadBatch, 60);
        }
      }

      scheduleNextBatch();
    }

    const firstFrame = loadFrame(1);
    firstFrame.onload = () => {
      loaded[0] = true;
      renderFrame(0);
    };
    streamRemainingFrames(2);

    function handleScroll() {
      requestAnimationFrame(() => {
        renderFrame(currentTargetIndex());
      });
    }

    function handleResize() {
      lastRenderedIndex = -1;
      renderFrame(currentTargetIndex());
    }

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} id="scroll-animation" />
      <div className="canvas-scrim" />
    </div>
  );
}
```

- [ ] **Step 2: Write `app/components/ScrollFadeIn.tsx`**

```tsx
// app/components/ScrollFadeIn.tsx
"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollFadeIn({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`fade-in ${visible ? "visible" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Write the failing test for `ScrollFadeIn`**

```tsx
// app/components/ScrollFadeIn.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import ScrollFadeIn from "./ScrollFadeIn";

describe("ScrollFadeIn", () => {
  let observedCallback: IntersectionObserverCallback;

  beforeEach(() => {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds = [];
      constructor(callback: IntersectionObserverCallback) {
        observedCallback = callback;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  it("renders children", () => {
    render(
      <ScrollFadeIn>
        <p>Hello</p>
      </ScrollFadeIn>,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("starts without the visible class", () => {
    render(
      <ScrollFadeIn>
        <p>Hello</p>
      </ScrollFadeIn>,
    );
    expect(screen.getByText("Hello").parentElement).not.toHaveClass(
      "visible",
    );
  });

  it("adds the visible class once IntersectionObserver reports intersecting", () => {
    render(
      <ScrollFadeIn>
        <p>Hello</p>
      </ScrollFadeIn>,
    );
    act(() => {
      observedCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(screen.getByText("Hello").parentElement).toHaveClass("visible");
  });
});
```

> The manual `observedCallback(...)` call happens outside any React event handler, so without wrapping it in `act()` the resulting `setVisible(true)` doesn't flush to the DOM before the assertion runs — the test fails intermittently/always depending on timing. `AnimatedStat`'s test (below) doesn't need this because its mock's `observe()` calls the callback synchronously *during* the effect, which is already inside `render()`'s own `act()` boundary.

- [ ] **Step 4: Run the test to verify it fails, then passes**

Run: `npm test -- ScrollFadeIn`
Expected: PASS once Step 2's implementation exists (write test first in a real TDD flow: confirm it fails against an empty file, then add the implementation and re-run).

- [ ] **Step 5: Write the real `app/components/NavActiveLink.tsx`**

```tsx
// app/components/NavActiveLink.tsx
"use client";

import { useEffect, useState } from "react";

export default function NavActiveLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!href.startsWith("#")) return;
    const target = document.querySelector(href);
    if (!target || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(true);
          else setActive(false);
        });
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [href]);

  return (
    <a href={href} className={active ? "active" : ""}>
      {label}
    </a>
  );
}
```

> Note: this preserves the current page's scroll-spy behavior for in-page anchors (`#about`, `#skills`, `#experience`) exactly. The 4th nav link, `/projects`, doesn't start with `#`, so its `useEffect` returns immediately and it never receives the `active` class this way. The current `projects.html` separately hardcodes `class="active"` on its own nav item server-side — this port does not carry that specific behavior over (see Task 10's note on this exact gap, which explains why and what a follow-up would look like).

- [ ] **Step 6: Write the failing test for `NavActiveLink`**

```tsx
// app/components/NavActiveLink.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import NavActiveLink from "./NavActiveLink";

describe("NavActiveLink", () => {
  let observedCallback: IntersectionObserverCallback;

  beforeEach(() => {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds = [];
      constructor(callback: IntersectionObserverCallback) {
        observedCallback = callback;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    // NavActiveLink looks up its target section via document.querySelector(href)
    document.body.innerHTML = '<section id="about"></section>';
  });

  it("renders the label as a link to the given href", () => {
    render(<NavActiveLink href="#about" label="About" />);
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "#about",
    );
  });

  it("has no active class before its section intersects", () => {
    render(<NavActiveLink href="#about" label="About" />);
    expect(screen.getByRole("link")).not.toHaveClass("active");
  });

  it("adds the active class when its section starts intersecting", () => {
    render(<NavActiveLink href="#about" label="About" />);
    act(() => {
      observedCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(screen.getByRole("link")).toHaveClass("active");
  });

  it("removes the active class when its section stops intersecting", () => {
    render(<NavActiveLink href="#about" label="About" />);
    act(() => {
      observedCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    act(() => {
      observedCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(screen.getByRole("link")).not.toHaveClass("active");
  });

  it("never becomes active for a non-anchor href like /projects", () => {
    document.body.innerHTML = "";
    render(<NavActiveLink href="/projects" label="Projects" />);
    expect(screen.getByRole("link")).not.toHaveClass("active");
  });
});
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test -- NavActiveLink`
Expected: PASS.

- [ ] **Step 8: Write `app/components/AnimatedStat.tsx`**

```tsx
// app/components/AnimatedStat.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { easeOutCubic } from "@/lib/animation";

export default function AnimatedStat({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setDisplay(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);

          const duration = 1400;
          const start = performance.now();

          function tick(now: number) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = easeOutCubic(progress);
            setDisplay(Math.round(eased * value));
            if (progress < 1) {
              requestAnimationFrame(tick);
            } else {
              setDisplay(value);
            }
          }
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="count-value">
      {display}
      {suffix}
    </span>
  );
}
```

- [ ] **Step 9: Write the failing test for `AnimatedStat`**

```tsx
// app/components/AnimatedStat.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AnimatedStat from "./AnimatedStat";

describe("AnimatedStat", () => {
  beforeEach(() => {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds = [];
      constructor(private callback: IntersectionObserverCallback) {}
      observe = () => {
        this.callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      };
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true, // simulate prefers-reduced-motion so the value snaps instantly — deterministic for testing
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  });

  it("renders the target value immediately under reduced motion", () => {
    render(<AnimatedStat value={2027} />);
    expect(screen.getByText("2027")).toBeInTheDocument();
  });

  it("renders the suffix alongside the value", () => {
    render(<AnimatedStat value={2} suffix="+" />);
    expect(screen.getByText("2+")).toBeInTheDocument();
  });
});
```

- [ ] **Step 10: Run the tests to verify they pass**

Run: `npm test -- AnimatedStat`
Expected: PASS.

- [ ] **Step 11: Run the full test suite**

Run: `npm test`
Expected: PASS — every test from Tasks 1–6 green.

- [ ] **Step 12: Verify the build still succeeds**

Run: `npm run build`
Expected: builds successfully.

- [ ] **Step 13: Commit**

```bash
git add app/components/ScrollCanvas.tsx app/components/ScrollFadeIn.tsx app/components/ScrollFadeIn.test.tsx app/components/NavActiveLink.tsx app/components/NavActiveLink.test.tsx app/components/AnimatedStat.tsx app/components/AnimatedStat.test.tsx
git commit -m "Add client components: scroll canvas, fade-in, nav scroll-spy, animated stat"
```

---

### Task 7: Home page section components — Hero, Experience, About, TechStack, Contact, Stats

**Files:**
- Create: `app/components/Hero.tsx`
- Create: `app/components/ExperienceItem.tsx`
- Create: `app/components/Experience.tsx`
- Create: `app/components/About.tsx`
- Create: `app/components/StackCard.tsx`
- Create: `app/components/TechStack.tsx`
- Create: `app/components/Contact.tsx`
- Create: `app/components/Stats.tsx`
- Test: `app/components/Experience.test.tsx`
- Test: `app/components/TechStack.test.tsx`
- Test: `app/components/Stats.test.tsx`

**Interfaces:**
- Consumes: `site` (`lib/data/site.ts`), `experienceRoles` (`lib/data/experience.ts`), `techStackCategories` (`lib/data/techStack.ts`), `homeStats` (`lib/data/stats.ts`), `<ScrollCanvas />` (Task 6), `<AnimatedStat />` (Task 6).
- Produces: all 6 home-page section components, assembled by Task 9's `app/page.tsx`.

- [ ] **Step 1: Write `app/components/Hero.tsx`**

```tsx
// app/components/Hero.tsx
import { site } from "@/lib/data/site";
import ScrollCanvas from "./ScrollCanvas";

const services = [
  { num: "/ 01", name: "Data & ML" },
  { num: "/ 02", name: "Backend & APIs" },
  { num: "/ 03", name: "DevOps & MLOps" },
  { num: "/ 04", name: "Frontend & BI" },
];

export default function Hero() {
  return (
    <>
      <ScrollCanvas />
      <div className="grid-texture" />
      <section className="hero">
        <div className="hero-top">
          <div className="hero-title">
            <p>Hey, I&apos;m a</p>
            <h1>
              Data Science &<br />
              MLOps Student
            </h1>
          </div>
          <div className="hero-right">
            <h3>
              Building systems that
              <br />
              scale predictably.
            </h3>
            <p>{site.tagline}</p>
          </div>
        </div>

        <div className="hero-services" id="skills">
          {services.map((service) => (
            <div className="service-item" key={service.num}>
              <span className="num">{service.num}</span>
              <span className="name">{service.name}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Write `app/components/ExperienceItem.tsx`**

```tsx
// app/components/ExperienceItem.tsx
import type { ExperienceRole } from "@/lib/data/experience";

export default function ExperienceItem({ role }: { role: ExperienceRole }) {
  return (
    <div className="exp-item">
      <div className="exp-meta">
        <div className="exp-role-company">
          <span className="exp-role">{role.role}</span>
          <span className="exp-company">{role.company}</span>
        </div>
        <span className="exp-date">{role.dates}</span>
      </div>
      <ul className="exp-bullets">
        {role.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      <div className="exp-tags">
        {role.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write `app/components/Experience.tsx`**

```tsx
// app/components/Experience.tsx
import { experienceRoles } from "@/lib/data/experience";
import ExperienceItem from "./ExperienceItem";
import ScrollFadeIn from "./ScrollFadeIn";

export default function Experience() {
  return (
    <ScrollFadeIn className="experience-section-wrapper">
      <section className="experience-section" id="experience">
        <div className="badge">
          <span className="dot" /> Experience
        </div>
        <div className="workflow-header">
          <h2>
            Practical experience,
            <br />
            <em>not just coursework.</em>
          </h2>
          <p className="desc">
            Three engineering roles across two companies, alongside my degree
            — building responsive UIs, integrating backend services, and
            shipping production-ready features.
          </p>
        </div>

        <div className="exp-timeline">
          {experienceRoles.map((role) => (
            <ExperienceItem role={role} key={`${role.company}-${role.dates}`} />
          ))}
        </div>
      </section>
    </ScrollFadeIn>
  );
}
```

- [ ] **Step 4: Write `app/components/About.tsx`**

```tsx
// app/components/About.tsx
export default function About() {
  return (
    <section className="section-two" id="about">
      <div className="section-two-header">
        <div className="section-two-left">
          <span className="subtitle">Engineering Approach</span>
          <h2>
            Architecting
            <br />
            Reliable Data
            <br />
            & Web Systems
          </h2>
        </div>
        <div className="section-two-right">
          <p className="main-text">
            I&apos;m an engineer focused on building robust end-to-end data
            pipelines, ML models, and scalable web applications from
            ideation to production.
          </p>
          <div className="cta-small">
            <p>
              Looking for a 6-month
              <br />
              End-of-Studies Internship (PFE)
            </p>
            <a href="#contact" className="btn orange">
              Get in touch <span className="icon">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Write `app/components/StackCard.tsx`**

```tsx
// app/components/StackCard.tsx
import type { TechStackCategory } from "@/lib/data/techStack";

export default function StackCard({
  category,
}: {
  category: TechStackCategory;
}) {
  return (
    <div className="stack-card">
      <span className="stack-label">{category.label}</span>
      <div className="stack-tags">
        {category.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Write `app/components/TechStack.tsx`**

```tsx
// app/components/TechStack.tsx
import { techStackCategories } from "@/lib/data/techStack";
import StackCard from "./StackCard";
import ScrollFadeIn from "./ScrollFadeIn";

export default function TechStack() {
  return (
    <ScrollFadeIn>
      <section className="workflow-section">
        <div className="badge">
          <span className="dot" /> TECH STACK
        </div>
        <div className="workflow-header">
          <h2>
            Proficient in <em>modern tools</em>
            <br />
            for data engineering and web apps.
          </h2>
          <p className="desc">
            My stack is focused on high-performance backends, reproducible
            machine learning environments, and type-safe frontends. I
            strongly believe in free/open-source-first technologies.
          </p>
        </div>
        <div className="stack-grid">
          {techStackCategories.map((category) => (
            <StackCard category={category} key={category.label} />
          ))}
        </div>
        <p className="workflow-footer">
          Currently pursuing an Engineering Degree in Computer Science (Data
          Science) at ESPRIT, Tunis. Expected graduation in 2027.
        </p>
      </section>
    </ScrollFadeIn>
  );
}
```

- [ ] **Step 7: Write `app/components/Contact.tsx`**

```tsx
// app/components/Contact.tsx
import { site } from "@/lib/data/site";
import ScrollFadeIn from "./ScrollFadeIn";

export default function Contact() {
  return (
    <ScrollFadeIn>
      <section className="contact-section" id="contact">
        <div className="contact-header">
          <h2>
            Ready to build
            <br />& scale your
            <br />
            <em>systems?</em>
          </h2>
          <div className="lets-talk">
            <strong>Let&apos;s talk</strong>
            I am actively seeking a 6-month PFE internship starting February
            2027.
          </div>
        </div>

        <form
          className="contact-form"
          action={`mailto:${site.email}`}
          method="post"
          encType="text/plain"
        >
          <div className="form-group">
            <label>YOUR NAME*</label>
            <input type="text" placeholder="John Doe" required />
          </div>
          <div className="form-group">
            <label>YOUR NUMBER</label>
            <input type="text" placeholder="+123-456-7890" />
          </div>
          <div className="form-group" style={{ gridColumn: "span 2" }}>
            <label>YOUR EMAIL*</label>
            <input type="email" placeholder="john@example.com" required />
          </div>
          <div className="form-group" style={{ gridColumn: "span 2" }}>
            <label>HOW CAN I HELP?</label>
            <input
              type="text"
              placeholder="Tell me about your project or opportunity..."
            />
          </div>
          <div className="form-group">
            <button
              type="submit"
              className="btn orange"
              style={{ border: "none", cursor: "pointer" }}
            >
              Send Message <span className="icon">↗</span>
            </button>
          </div>
        </form>
      </section>
    </ScrollFadeIn>
  );
}
```

- [ ] **Step 8: Write `app/components/Stats.tsx`**

```tsx
// app/components/Stats.tsx
import { homeStats } from "@/lib/data/stats";
import AnimatedStat from "./AnimatedStat";
import ScrollFadeIn from "./ScrollFadeIn";

export default function Stats() {
  return (
    <ScrollFadeIn>
      <section className="stats-section">
        <div className="stats-container">
          {homeStats.map((stat) => (
            <div className="stat-block" key={stat.label}>
              <div className="stat-top">{stat.label}</div>
              <div className="stat-line" />
              <div className="stat-number">
                <AnimatedStat value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="stat-desc">{stat.description}</div>
            </div>
          ))}
        </div>
      </section>
    </ScrollFadeIn>
  );
}
```

- [ ] **Step 9: Write the failing test for `Experience`**

```tsx
// app/components/Experience.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Experience from "./Experience";

describe("Experience", () => {
  beforeEach(() => {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds = [];
      constructor(_callback: IntersectionObserverCallback) {}
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  it("renders all 3 roles", () => {
    render(<Experience />);
    expect(screen.getByText("Next.js Developer Intern")).toBeInTheDocument();
    expect(screen.getAllByText("Swiver")).toHaveLength(2);
  });

  it("renders the section heading", () => {
    render(<Experience />);
    expect(screen.getByText("not just coursework.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 10: Write the failing test for `TechStack`**

```tsx
// app/components/TechStack.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import TechStack from "./TechStack";

describe("TechStack", () => {
  beforeEach(() => {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds = [];
      constructor(_callback: IntersectionObserverCallback) {}
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  it("renders all 6 category labels", () => {
    render(<TechStack />);
    expect(screen.getByText("Data & Machine Learning")).toBeInTheDocument();
    expect(screen.getByText("Languages")).toBeInTheDocument();
  });
});
```

- [ ] **Step 11: Write the failing test for `Stats`**

```tsx
// app/components/Stats.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Stats from "./Stats";

describe("Stats", () => {
  beforeEach(() => {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds = [];
      constructor(private callback: IntersectionObserverCallback) {}
      observe = () => {
        this.callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      };
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  });

  it("renders both stat labels", () => {
    render(<Stats />);
    expect(screen.getByText("ACADEMIC EXCELLENCE")).toBeInTheDocument();
    expect(screen.getByText("PROFESSIONAL EXPERIENCE")).toBeInTheDocument();
  });

  it("renders the animated values under reduced motion", () => {
    render(<Stats />);
    expect(screen.getByText("2027")).toBeInTheDocument();
    expect(screen.getByText("2+")).toBeInTheDocument();
  });
});
```

- [ ] **Step 12: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — every test so far, including the 3 new files.

- [ ] **Step 13: Commit**

```bash
git add app/components/Hero.tsx app/components/ExperienceItem.tsx app/components/Experience.tsx app/components/Experience.test.tsx app/components/About.tsx app/components/StackCard.tsx app/components/TechStack.tsx app/components/TechStack.test.tsx app/components/Contact.tsx app/components/Stats.tsx app/components/Stats.test.tsx
git commit -m "Add home page section components: Hero, Experience, About, TechStack, Contact, Stats"
```

---

### Task 8: Certifications, ProjectCard, Philosophy components

**Files:**
- Create: `app/components/CertCard.tsx`
- Create: `app/components/Certifications.tsx`
- Create: `app/components/ProjectCard.tsx`
- Create: `app/components/Philosophy.tsx`
- Test: `app/components/Certifications.test.tsx`
- Test: `app/components/ProjectCard.test.tsx`
- Test: `app/components/Philosophy.test.tsx`

**Interfaces:**
- Consumes: `certifications` (`lib/data/certifications.ts`), `Project` type + `projects` (`lib/data/projects.ts`), `philosophyStats`/`philosophyCopy` (`lib/data/philosophy.ts`).
- Produces: `<Certifications />` (home page, Task 9), `<ProjectCard project={...} />` (projects page, Task 10), `<Philosophy />` (projects page, Task 10).

- [ ] **Step 1: Write `app/components/CertCard.tsx`**

```tsx
// app/components/CertCard.tsx
import type { Certification } from "@/lib/data/certifications";

export default function CertCard({ cert }: { cert: Certification }) {
  return (
    <div className="cert-card">
      <span className="cert-index">{cert.index}</span>
      <h4>{cert.title}</h4>
      <p>{cert.issuer}</p>
    </div>
  );
}
```

- [ ] **Step 2: Write `app/components/Certifications.tsx`**

```tsx
// app/components/Certifications.tsx
import { certifications } from "@/lib/data/certifications";
import CertCard from "./CertCard";
import ScrollFadeIn from "./ScrollFadeIn";

export default function Certifications() {
  return (
    <ScrollFadeIn>
      <section className="certifications-section">
        <div className="cert-header">
          <div className="badge">
            <span className="dot" /> Credentials
          </div>
          <h2>Certified across the systems I actually build with.</h2>
        </div>
        <div className="cert-grid">
          {certifications.map((cert) => (
            <CertCard cert={cert} key={cert.index} />
          ))}
        </div>
      </section>
    </ScrollFadeIn>
  );
}
```

- [ ] **Step 3: Write `app/components/ProjectCard.tsx`**

```tsx
// app/components/ProjectCard.tsx
import Image from "next/image";
import type { Project } from "@/lib/data/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`project-card${project.featured ? " featured" : ""}`}
      id={project.slug}
    >
      <div className="project-img">
        <Image
          src={project.image}
          alt={`${project.title} screenshot`}
          width={1200}
          height={project.featured ? 675 : 900}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="project-info">
        <h3>{project.title}</h3>
        <p className="project-meta">
          <span>{project.tagLabel}</span> {project.tagline}
        </p>
        <p className="project-description">{project.description}</p>
        {project.featured && (
          <span className="btn orange">
            View Project <span className="icon">↗</span>
          </span>
        )}
      </div>
    </a>
  );
}
```

- [ ] **Step 4: Write `app/components/Philosophy.tsx`**

```tsx
// app/components/Philosophy.tsx
import { philosophyStats, philosophyCopy } from "@/lib/data/philosophy";
import ScrollFadeIn from "./ScrollFadeIn";

export default function Philosophy() {
  return (
    <ScrollFadeIn>
      <div className="philosophy">
        <div className="phil-left">
          <h2>{philosophyCopy.heading}</h2>
          <p>{philosophyCopy.body}</p>
        </div>
        <div className="phil-right">
          {philosophyStats.map((stat) => (
            <div className="stat-item" key={stat.label}>
              <h4>{stat.value}</h4>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </ScrollFadeIn>
  );
}
```

- [ ] **Step 5: Write the failing test for `Certifications`**

```tsx
// app/components/Certifications.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Certifications from "./Certifications";

describe("Certifications", () => {
  beforeEach(() => {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds = [];
      constructor(_callback: IntersectionObserverCallback) {}
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  it("renders all 3 certification titles", () => {
    render(<Certifications />);
    expect(
      screen.getByText("CCNA: Switching, Routing & Wireless Essentials"),
    ).toBeInTheDocument();
    expect(screen.getByText("Neo4j Fundamentals")).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Write the failing test for `ProjectCard`**

```tsx
// app/components/ProjectCard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectCard from "./ProjectCard";
import { projects } from "@/lib/data/projects";

describe("ProjectCard", () => {
  it("renders the project title and links to the real repo", () => {
    const researchBridge = projects.find((p) => p.slug === "researchbridge")!;
    render(<ProjectCard project={researchBridge} />);
    expect(screen.getByText("ResearchBridge")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://github.com/mohamedaziz-ouertatani/ResearchBridge",
    );
  });

  it("renders the View Project CTA only for featured projects", () => {
    const featured = projects.find((p) => p.featured)!;
    const notFeatured = projects.find((p) => !p.featured)!;

    const { rerender } = render(<ProjectCard project={featured} />);
    expect(screen.getByText("View Project")).toBeInTheDocument();

    rerender(<ProjectCard project={notFeatured} />);
    expect(screen.queryByText("View Project")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Write the failing test for `Philosophy`**

```tsx
// app/components/Philosophy.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Philosophy from "./Philosophy";

describe("Philosophy", () => {
  beforeEach(() => {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds = [];
      constructor(_callback: IntersectionObserverCallback) {}
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  it("renders the heading and all 4 stats", () => {
    render(<Philosophy />);
    expect(screen.getByText("Engineering Robust Solutions.")).toBeInTheDocument();
    expect(screen.getByText("3+")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all tests including these 3 new files.

- [ ] **Step 9: Verify the build still succeeds**

Run: `npm run build`
Expected: builds successfully (Next.js will warn if `next/image` can't find a file at build/request time — since Task 2 already moved the 4 JPEGs into `public/images/projects/`, this should resolve cleanly).

- [ ] **Step 10: Commit**

```bash
git add app/components/CertCard.tsx app/components/Certifications.tsx app/components/Certifications.test.tsx app/components/ProjectCard.tsx app/components/ProjectCard.test.tsx app/components/Philosophy.tsx app/components/Philosophy.test.tsx
git commit -m "Add Certifications, ProjectCard, and Philosophy components"
```

---

### Task 9: Assemble the home page (`app/page.tsx`)

**Files:**
- Modify: `app/page.tsx` (full content, replacing the Task 1 placeholder)
- Test: `app/page.test.tsx`

**Interfaces:**
- Consumes: `Hero`, `Experience`, `About`, `TechStack`, `Contact`, `Stats`, `Certifications`, `ProjectCard` (all from Tasks 5–8), `projects` (`lib/data/projects.ts`).
- Produces: the working `/` route.

The current `index.html`'s About section no longer shows the 3-image grid (removed per an earlier, already-shipped change to the static site) — this port reflects that current state, not the older version with the image grid.

- [ ] **Step 1: Write `app/page.tsx`**

```tsx
// app/page.tsx
import type { Metadata } from "next";
import { site } from "@/lib/data/site";
import Hero from "./components/Hero";
import Experience from "./components/Experience";
import About from "./components/About";
import TechStack from "./components/TechStack";
import Contact from "./components/Contact";
import Stats from "./components/Stats";
import Certifications from "./components/Certifications";

export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.metaDescription,
};

export default function HomePage() {
  return (
    <main>
      <div className="container">
        <Hero />
        <Experience />
        <About />
        <TechStack />
      </div>
      <Contact />
      <Stats />
      <Certifications />
    </main>
  );
}
```

> Note: `Contact`, `Stats`, and `Certifications` render their own `<section>` at full width (matching the current site's structure, where `.contact-section`/`.stats-section`/`.certifications-section` sit inside `.container` too) — wrap them in `.container` as well for consistent max-width:

- [ ] **Step 2: Correct `app/page.tsx` to wrap every section in `.container` (matching the current site's single top-level `.container` wrapping everything)**

```tsx
// app/page.tsx
import type { Metadata } from "next";
import { site } from "@/lib/data/site";
import Hero from "./components/Hero";
import Experience from "./components/Experience";
import About from "./components/About";
import TechStack from "./components/TechStack";
import Contact from "./components/Contact";
import Stats from "./components/Stats";
import Certifications from "./components/Certifications";

export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.metaDescription,
};

export default function HomePage() {
  return (
    <main className="container">
      <Hero />
      <Experience />
      <About />
      <TechStack />
      <Contact />
      <Stats />
      <Certifications />
    </main>
  );
}
```

- [ ] **Step 3: Write the failing test for `app/page.tsx`**

```tsx
// app/page.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  beforeEach(() => {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds = [];
      constructor(_callback: IntersectionObserverCallback) {}
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    vi.stubGlobal(
      "requestIdleCallback",
      (cb: IdleRequestCallback) => setTimeout(cb, 0) as unknown as number,
    );
  });

  it("renders the hero headline", () => {
    render(<HomePage />);
    expect(screen.getByText(/MLOps Student/)).toBeInTheDocument();
  });

  it("renders all major sections", () => {
    render(<HomePage />);
    expect(screen.getByText("Next.js Developer Intern")).toBeInTheDocument();
    expect(screen.getByText("Data & Machine Learning")).toBeInTheDocument();
    expect(screen.getByText("Let's talk")).toBeInTheDocument();
    expect(screen.getByText("ACADEMIC EXCELLENCE")).toBeInTheDocument();
    expect(screen.getByText("Neo4j Fundamentals")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- page.test`
Expected: PASS.

> Note: `ScrollCanvas`'s `useEffect` calls `new Image()` and touches `document.documentElement.scrollTop`/`scrollHeight`, all of which jsdom supports without extra mocking; the `requestIdleCallback` stub above keeps its background frame-loading from throwing in the jsdom environment.

- [ ] **Step 5: Verify the full test suite and build**

Run: `npm test`
Expected: PASS — every test in the project.

Run: `npm run build`
Expected: builds successfully.

Run: `npm run dev`, open `http://localhost:3000`, manually compare against the current `index.html` (open it directly in a browser) section-by-section for copy and layout parity. Stop the dev server when done.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/page.test.tsx
git commit -m "Assemble the home page route"
```

---

### Task 10: Assemble the projects page (`app/projects/page.tsx`)

**Files:**
- Create: `app/projects/page.tsx`
- Test: `app/projects/page.test.tsx`

**Interfaces:**
- Consumes: `projects` (`lib/data/projects.ts`), `ProjectCard` (Task 8), `Philosophy` (Task 8).
- Produces: the working `/projects` route.

- [ ] **Step 1: Write `app/projects/page.tsx`**

```tsx
// app/projects/page.tsx
import type { Metadata } from "next";
import { projects } from "@/lib/data/projects";
import ProjectCard from "../components/ProjectCard";
import Philosophy from "../components/Philosophy";

export const metadata: Metadata = {
  title: "Projects — Mohamed Aziz Ouertatani",
  description:
    "Featured data engineering, MLOps, and full-stack projects by Mohamed Aziz Ouertatani: ResearchBridge, Estate-Mind, Smart Inventory Forecasting, and an MLOps pipeline.",
};

export default function ProjectsPage() {
  return (
    <>
      <div className="glow glow-1" />
      <div className="glow glow-2" />
      <div className="glow glow-3" />

      <main className="container">
        <section className="projects-hero">
          <h1>Featured Projects</h1>
          <p>
            A curated collection of end-to-end data pipelines, machine
            learning systems, and full-stack applications built for
            performance and scalability.
          </p>
        </section>

        <section>
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard project={project} key={project.slug} />
            ))}
          </div>
        </section>

        <section>
          <Philosophy />
        </section>

        <section className="cta-section">
          <h2>Seeking an End-of-Studies Internship</h2>
          <p>
            I am looking for a 6-month PFE opportunity in Data Science, Data
            Engineering, or MLOps.
          </p>
          <a href="/#contact" className="btn orange">
            Get in touch <span className="icon">↗</span>
          </a>
        </section>
      </main>
    </>
  );
}
```

> Note on the nav's "Projects" link `.active` state: the current `projects.html` hardcodes `class="active"` on its own nav item. Since `Nav` (Task 5) is shared across both routes via `app/layout.tsx`, that per-route static highlighting would need `Nav` to know the current path. This plan keeps `Nav` simple (it already handles in-page scroll-spy for `#`-anchors via `NavActiveLink`) and does **not** add path-based highlighting for the `/projects` link — a minor, acceptable behavior gap flagged here rather than silently dropped. If this matters, it's a one-line follow-up (`usePathname()` in `NavActiveLink` to also match `/projects` against the current route) — out of scope for this port, which targets parity on content and the four documented interactive behaviors, not this static-highlight detail.

- [ ] **Step 2: Write the failing test for `app/projects/page.tsx`**

```tsx
// app/projects/page.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectsPage from "./page";

describe("ProjectsPage", () => {
  beforeEach(() => {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds = [];
      constructor(_callback: IntersectionObserverCallback) {}
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  it("renders the hero heading", () => {
    render(<ProjectsPage />);
    expect(screen.getByText("Featured Projects")).toBeInTheDocument();
  });

  it("renders all 4 project cards", () => {
    render(<ProjectsPage />);
    expect(screen.getByText("ResearchBridge")).toBeInTheDocument();
    expect(screen.getByText("Estate-Mind")).toBeInTheDocument();
    expect(
      screen.getByText("Smart Inventory Forecasting & Replenishment Platform"),
    ).toBeInTheDocument();
    expect(screen.getByText("ML Project — MLOps Pipeline")).toBeInTheDocument();
  });

  it("renders the philosophy section and CTA", () => {
    render(<ProjectsPage />);
    expect(screen.getByText("Engineering Robust Solutions.")).toBeInTheDocument();
    expect(
      screen.getByText("Seeking an End-of-Studies Internship"),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the test to verify it passes**

Run: `npm test -- projects/page.test`
Expected: PASS.

- [ ] **Step 4: Run the full test suite and build**

Run: `npm test`
Expected: PASS — every test in the project, both routes covered.

Run: `npm run build`
Expected: builds successfully, producing both `/` and `/projects` static routes.

Run: `npm run dev`, open `http://localhost:3000/projects`, manually compare against the current `projects.html` for copy/layout parity, including hovering each project card and confirming the featured (Smart Inventory) card's two-column layout and "View Project" CTA render correctly. Stop the dev server when done.

- [ ] **Step 5: Commit**

```bash
git add app/projects/page.tsx app/projects/page.test.tsx
git commit -m "Assemble the projects page route"
```

---

### Task 11: Remove superseded static files, final verification

**Files:**
- Delete: `index.html`
- Delete: `projects.html`
- Delete: `docs/superpowers/specs/2026-09-11-nextjs-port-design.md` — **do not delete**; keep for history.

**Interfaces:**
- Consumes: nothing new — this task only removes files the Next.js app has now fully replaced (verified by Tasks 9 and 10's manual dev-server comparisons).

`index.html` and `projects.html` are now fully superseded: every route, every piece of content, every interactive behavior they contained has a working Next.js equivalent, verified task-by-task above. Leaving them in the repo would create two sources of truth for the same site.

- [ ] **Step 1: Delete the old static HTML files**

```bash
git rm index.html projects.html
```

- [ ] **Step 2: Verify no other file references the deleted files**

Run: `grep -rn "index.html\|projects.html" --include="*.ts" --include="*.tsx" --include="*.css" .`
Expected: no matches (all internal links were rewritten to `/` and `/projects` during the port — `Nav`, `Footer`, `About`'s CTA, and the projects page's CTA all use route paths, not `.html` filenames).

- [ ] **Step 3: Run the full verification suite one final time**

Run: `npm test`
Expected: PASS — full suite green.

Run: `npm run build`
Expected: builds successfully.

Run: `npm run dev`, click through both routes end-to-end one more time: nav links (including in-page scroll-spy on `#about`/`#skills`/`#experience`), the scroll-driven canvas animation, stat count-up, all 4 project card links (open each in a new tab and confirm it resolves to the real GitHub repo / profile), the contact form's mailto action, and the footer's "Back to top" link. Stop the dev server when done.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Remove superseded static HTML files — Next.js app is now the canonical site"
```

---

## Post-plan notes (not tasks — context for whoever deploys this)

- **Deployment:** push this repo to its own GitHub repo (already git-initialized from an earlier session) and import it into Vercel as a new project, framework preset "Next.js" (auto-detected) — no config needed beyond that.
- **Lighthouse pass:** the spec's verification plan calls for an informal Lighthouse check to confirm `next/image` is a real win over the old plain `<img>` tags — run this once after Task 11, on the deployed preview or `next start` locally, not as a repo task (it's a one-time confirmation, not a regression test to keep running).
- **The 249-frame scroll animation's total payload** (~15MB across `public/frames/`) is unchanged by this port — that optimization was explicitly descoped in an earlier session (see the "Skip frame compression entirely" decision) and stays out of scope here too.
