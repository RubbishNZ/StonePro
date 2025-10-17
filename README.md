# StoneOpsPro Web Platform

An end-to-end web experience for **StoneOpsPro**, the unified operating platform for stone fabrication teams across New Zealand and Australia. The project combines a marketing site, authentication flows, multi-tenant workspace shell, and an advanced CAD-like quoting interface built on the Next.js 15 App Router with Supabase as the backend.

## Table of Contents

- [Core Technologies](#core-technologies)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Application Architecture](#application-architecture)
  - [Routing Groups](#routing-groups)
  - [Shared Layout & Providers](#shared-layout--providers)
  - [Supabase Integration](#supabase-integration)
- [Marketing Experience](#marketing-experience)
- [Authentication Experience](#authentication-experience)
- [Workspace Access & Multi-Tenancy](#workspace-access--multi-tenancy)
- [Operations Modules](#operations-modules)
  - [Dashboard](#dashboard)
  - [Quotes](#quotes)
  - [Inventory](#inventory)
  - [Scheduling](#scheduling)
  - [Settings](#settings)
- [Quote Builder Deep Dive](#quote-builder-deep-dive)
  - [State Store](#state-store)
  - [Geometry Utilities](#geometry-utilities)
  - [Canvas & Interaction Model](#canvas--interaction-model)
  - [Arrangement Panel](#arrangement-panel)
  - [Pricing & Totals](#pricing--totals)
- [Shared UI Components](#shared-ui-components)
- [Scripts & Tooling](#scripts--tooling)
- [Roadmap & Future Work](#roadmap--future-work)
- [Licensing](#licensing)

## Core Technologies

- **Framework:** Next.js 15 (App Router, React Server Components, Turbopack dev server)
- **Language & Styling:** TypeScript, Tailwind CSS 4, Geist font family
- **State/Data:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`), TanStack React Query, Zustand for complex client state
- **UI Toolkit:** Custom Tailwind components with `lucide-react` icons and Tailwind Merge utilities
- **Validation & Utilities:** Zod for server actions, custom geometry helpers for CAD workflows

## Quick Start

```bash
npm install
npm run dev
```

Navigate to <http://localhost:3000> for the marketing site. Authenticated application routes live under `/app/*` and require Supabase credentials to sign in.

## Environment Setup

1. Duplicate `.env.example` to `.env.local` (handled automatically by the `predev` script on `npm run dev`).
2. Supply Supabase project variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   > `SUPABASE_SERVICE_ROLE_KEY` is reserved for upcoming privileged actions—never expose it to the browser.

3. Restart the dev server after editing environment values.

## Project Structure

```
web/
├── public/                    # Static assets
├── scripts/                   # Node-based automation (env scaffolding)
├── src/
│   ├── app/
│   │   ├── (marketing)/       # Public marketing site
│   │   ├── (auth)/            # Login & sign-up flows
│   │   └── (app)/app/         # Authenticated workspace
│   ├── components/
│   │   ├── layout/            # Shared navigation and chrome
│   │   └── providers/         # Client-side context providers (React Query)
│   ├── features/
│   │   └── quotes/            # Advanced quoting experience
│   └── lib/
│       ├── auth/              # Shared auth server actions
│       ├── server/            # Server-only utilities (org resolution)
│       ├── supabase/          # Browser/server client factories
│       └── utils.ts           # Tailwind class merging helper
├── package.json
└── README.md
```

## Application Architecture

### Routing Groups

- **`(marketing)`**: Public-facing pages (home, pricing, contact, legal) with shared `SiteHeader`/`SiteFooter` layout.
- **`(auth)`**: Authentication-specific layout housing login and sign-up flows, styled for a focused form experience.
- **`(app)/app`**: Protected workspace routes (dashboard, quotes, inventory, scheduling, settings) behind Supabase auth and organization checks.

### Shared Layout & Providers

- `src/app/layout.tsx` registers global fonts, Tailwind globals, and wraps the app with `RootProviders`.
- `RootProviders` instantiates a React Query client once per session for server component hydration and client-side caching.
- The marketing and auth route groups define their own layout shells to provide context-specific branding.

### Supabase Integration

- `createSupabaseServerClient` (server) and `createSupabaseBrowserClient` (client) wrap `@supabase/ssr` for cookie-aware sessions.
- Server client gracefully handles Next.js 15.5 cookie mutation restrictions and logs warnings in development if mutation fails.
- `resolveActiveOrg` and `requireUserAndOrg` manage multi-tenant access, falling back to a workspace setup page if RLS policies block org resolution.

## Marketing Experience

- **Home (`/(marketing)/page.tsx`)**: Hero, feature summaries, module highlights, integration roadmap, and beta call-to-action.
- **Pricing (`/(marketing)/pricing`)**: Plan tiers placeholder with stone fabrication-specific copy.
- **Contact (`/(marketing)/contact`)**: Form capturing discovery session details alongside team contact information.
- **Privacy & Terms**: Static legal copy hooks ready for compliance content.

All marketing pages render inside `MarketingLayout`, which adds a branded header/footer and dark theme background.

## Authentication Experience

- **Layout**: `AuthLayout` centers auth forms within a glassmorphism card for focus.
- **Login (`/login`)**: Uses server action `signInAction` to authenticate via Supabase password auth, with robust error handling for missing env vars or credential failures.
- **Sign Up (`/signup`)**: Validates inputs with Zod, creates Supabase users, and redirects to confirmation. Collects full name and company metadata for onboarding.
- **Form UX**: All forms leverage React 19 `useActionState` and `useFormStatus` for pending/loading states.

## Workspace Access & Multi-Tenancy

- `AppLayout` validates the Supabase session, resolves the active organization, and conditionally renders:
  - The full workspace chrome (`AppSidebar`, `AppTopbar`, content area) when an org membership exists.
  - The `/app/setup` guidance page when the user lacks an active organization, including live Supabase state diagnostics.
- Sidebar navigation highlights the current route via `usePathname` and uses lucide icons for each module.
- Topbar exposes user identity, role badge, and a dropdown-driven sign-out action.

## Operations Modules

### Dashboard

- Fetches live data from Supabase tables (`quotes`, `schedule_events`, `slabs`, `customers`, `org_settings`).
- Displays KPI cards, top quote pipeline entries, upcoming installs, and a schedule heatmap placeholder.
- Includes robust logging helpers to surface real Supabase errors without crashing the page.

### Quotes

- **Index (`/app/quotes`)**: Table of recent quotes (mocked data) with CTA to launch the builder and hints about roadmap priorities.
- **New Quote (`/app/quotes/new`)**: Hosts the CAD-like `QuoteBuilder` experience described below.

### Inventory

- Presentational table seeded with realistic slab metadata (status, thickness, location, data source).
- CTA buttons for CSV import and manual slab creation.
- Roadmap section outlines upcoming Supabase schema and integrations.

### Scheduling

- Placeholder scheduling board with mock assignments and callouts for future drag-and-drop resource planning.
- Table summarizing upcoming jobs with status chips.
- Roadmap for conflict detection and optimization engine.

### Settings

- Cards for workspace profile, roles/permissions, and integrations with action lists.
- Security checklist reminding engineers to implement RLS, auditing, and backups.

## Quote Builder Deep Dive

The quote builder delivers a fabrication-grade drafting environment using SVG, Zustand, and custom geometry utilities.

### State Store

- Implemented in `features/quotes/store/quote-store.ts` using Zustand.
- Tracks shapes, vertices, selection state, grouping, locking, tool mode, calibration data, overlays, pricing, extras, arrangement layout, units, and precision.
- Exposes extensive action set: drawing, snapping, grouping/ungrouping, locking, deletion, calibration workflow, overlay toggles, safe margins, arrangement synchronization, and `clearAllShapes` for destructive resets.
- Computes quote totals (area, perimeter, pricing) in real time via `calculateShapeMetrics`.

### Geometry Utilities

- `features/quotes/lib/geometry.ts` encapsulates shoelace area and perimeter calculations with mm/px conversion and helper distance functions.
- Utilities respect calibration (`mmPerPixel`) to convert between canvas space and real-world measurements.

### Canvas & Interaction Model

- `QuoteCanvas` renders the drawing surface with intelligent snapping (off/90/90+45 modes), vertex hit-testing, and multi-select support.
- Supports drawing polylines, closing shapes by clicking the first vertex, vertex dragging with snapping, shape dragging (single or multi), and right-click panning.
- Advanced zoom controls: incremental zoom, fit to view, zoom to selection, and reset, all pivoting correctly around the pointer.
- Calibration workflow prompts the user for real-world distances and computes `mmPerPixel`, unlocking accurate measurements and overlays.
- Safe margin overlay, adaptive grid density, and professional rulers respond to calibration settings and unit choices (metric/imperial).

### Arrangement Panel

- Mirrors closed shapes into a separate slab arrangement stage with independent pan/zoom controls.
- Allows dragging placed parts while respecting locked status, prepping for future nesting optimization.
- Ensures arrangement records stay in sync via `ensureArrangementForClosedShapes`.

### Pricing & Totals

- Sidebar compiles calibration status, unit selection, grid and guide controls, safe margin configuration, area/perimeter totals, and pricing summary.
- Rate-per-square-metre input and extras ledger feed into overall benchtop and grand totals with live currency formatting.
- Buttons for saving drafts and previewing quotes stub future persistence flows.

## Shared UI Components

- `SiteHeader` / `SiteFooter`: Marketing chrome with responsive navigation and CTAs.
- `AppSidebar` / `AppTopbar`: Workspace navigation, identity management, and sign-out.
- Utility components (e.g., field wrappers, CTA buttons) rely on Tailwind design tokens and consistent spacing scale.

## Scripts & Tooling

- `scripts/ensure-env.mjs`: Automatically copies `.env.example` to `.env.local` the first time you run `npm run dev`.
- npm scripts:
  - `npm run dev` – Start local development with Turbopack and env scaffolding.
  - `npm run build` – Production build (Turbopack).
  - `npm run start` – Launch production server.
  - `npm run lint` – ESLint configured for Next.js 15 and Tailwind CSS 4.

## Roadmap & Future Work

- Implement additional drawing tools (rectangle, circle/arc, notch, slot) and editing operations (split, trim, fillet, offset, duplicate, mirror, rotate).
- Integrate boolean operations for complex shape manipulation and add fabrication-specific features (cutouts library, edge treatments, seams, backsplashes).
- Enhance validation overlays (self-intersection, open edges, tolerances) and expand nesting optimizations in the arrangement panel.
- Build end-to-end Supabase CRUD flows for quotes, inventory, scheduling, and settings, including RLS policy reinstatement.
- Add import/export pipelines (DXF/SVG/PDF), image underlays, keyboard shortcuts, undo/redo history, and context menus.
- Re-enable hardened RLS policies across all tables prior to production.

## Licensing

Private proprietary project. Distribution outside the StoneOpsPro team is not permitted.
