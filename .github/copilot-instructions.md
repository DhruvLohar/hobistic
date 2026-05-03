# Copilot Instructions for `hobistic`

## Build, lint, format, and type-check

Use the project root with `pnpm` (lockfile is `pnpm-lock.yaml`):

- `pnpm dev` — start Next.js dev server (`next dev --turbopack`)
- `pnpm build` — production build
- `pnpm start` — run production server
- `pnpm lint` — run ESLint
- `pnpm typecheck` — run TypeScript type-check (`tsc --noEmit`)
- `pnpm format` — format `*.ts`/`*.tsx` with Prettier

## Tests

There is currently no configured test runner in `package.json` (no `test` script), and no test files are present.  
If adding tests, also add:

- a full-suite command (for example `pnpm test`)
- a single-test command (for example `pnpm test -- path/to/file.test.ts`)

## High-level architecture

This is a Next.js App Router project where the main implemented backend feature is an AI guide-generation pipeline:

1. `app/api/engine/route.ts` is the API entrypoint (`POST /api/engine`). It validates input and calls `runEngine`.
2. `lib/ai/engine/index.ts` defines a LangGraph `StateGraph` workflow:
   - `generateGuide` (LLM generates hobby structure)
   - fan-out to `processSubtopic` (parallel enrichment per subtopic via web/image/video search)
   - `curateContent` (LLM turns search results into structured markdown content in batches)
   - `mergeOutput` (combines structure + resources + curated content)
3. `lib/ai/index.ts` is the shared Gemini client wrapper (`useGenAIGrounding`) with optional JSON schema output parsing.
4. `lib/ai/engine/prompts/*` contains prompt + JSON schema definitions; `lib/ai/engine/tools/*` wraps Serper APIs for web/image/video retrieval.
5. Frontend shell is minimal right now (`app/page.tsx`), with global providers/wiring in `app/layout.tsx` and `components/theme-provider.tsx`.

## Key conventions for this repository

- **Architecture boundaries (from `CLAUDE.md`)**:
  - UI in `components/*`
  - logic and data hooks in `hooks/*`
  - backend/data access in `app/api/*`
  - avoid direct backend/Supabase calls from UI components
- **Forms policy**: use `react-hook-form` + `zod` (`@hookform/resolvers/zod`), with shared schemas in a central schema module.
- **Data fetching policy**: use TanStack Query via custom hooks (not ad-hoc fetches in components).
- **UI policy**: prefer shadcn/ui primitives; project is configured for shadcn (`components.json`, `radix-luma` style).
- **Path aliasing**: use `@/*` imports (configured in `tsconfig.json`) instead of deep relative paths.
- **Engine state pattern**: LangGraph state fields that collect results use reducer-based append semantics (`subtopicResources`, `curatedSubtopics` in `lib/ai/engine/state.ts`).
- **Resilience pattern in external search tools**: Serper wrappers return safe fallbacks (`""`/`[]`/`null`/message strings) instead of throwing, and downstream nodes are written to tolerate missing data.
- **Theme behavior**: `ThemeProvider` includes a global `d` hotkey for dark/light toggle (ignored while typing in form/content-editable targets).

## Environment variables used by current code

- `GOOGLE_API_KEY` — Gemini API access (`lib/ai/index.ts`)
- `SERPER_API_KEY` — Serper web/image/video APIs (`lib/ai/engine/tools/*`)
