# Frontend + API Development Rules (Next.js)

---

## 1. Forms — MUST use React Hook Form + Zod

- All forms MUST use `react-hook-form`
- Validation MUST use `zod` with `@hookform/resolvers/zod`
- Schemas MUST be defined in a central file (`src/utils/schemas.ts`)
- NEVER define validation schemas inside components
- NEVER use `useState` for form state
- ALWAYS show field-level errors using `formState.errors`
- ALWAYS use `handleSubmit(onSubmit)` for submission

---

## 2. API Layer — Next.js API Routes + Supabase

- All backend logic MUST live inside `app/api/*`
- NEVER call Supabase directly from UI components
- ALWAYS use a Supabase client inside API routes
- API routes act as the single source of truth for data access


- API routes MUST:
  - Validate input
  - Handle errors properly
  - Return consistent JSON responses

---

## 3. Performance — Memoization is REQUIRED

- Use `useCallback` for all functions passed as props
- Use `useMemo` for computed values
- Use `React.memo` for reusable components when needed

Rules:
- Avoid unnecessary re-renders
- Do NOT inline heavy logic inside JSX
- Keep components pure and predictable

---

## 4. Data Fetching — TanStack Query via Custom Hooks

- ALWAYS use `@tanstack/react-query` for API calls
- NEVER call APIs directly inside components
- Wrap every API interaction inside a custom hook


Rules:
- Use `useQuery` for GET requests
- Use `useMutation` for POST/PUT/DELETE
- Handle loading and error states properly
- Keep query keys consistent and structured

---

## 5. UI — shadcn/ui ONLY

- All UI components MUST use `shadcn/ui`
- Do NOT create custom components if a shadcn component exists
- Follow shadcn patterns for:
  - Forms
  - Buttons
  - Inputs
  - Modals
  - Layout

- Maintain consistent spacing, typography, and variants

---

## 6. General Principles

- Keep components clean and minimal
- Separate concerns:
  - UI → components
  - Logic → hooks
  - Data → API routes
- Avoid duplication
- Write scalable and maintainable code
- Make use of context7 for writing langgraph flow

---
