# HobiStic

> _Thought of this project when I was in class 10th_

A hobby learning platform designed to help users discover, pursue, and master new hobbies. Whether you're looking to escape your daily routine, explore something new, or master a skill completely!

---

## Walkthrough
[Checkout this loom video recording](https://www.loom.com/share/f8e4bb1e1bee4a9abe91492294b1384a)

---

## Built with AI Assistance

The architecture and core idea are 100% my own. AI agents (Claude, Copilot) + CLAUDE.md conventions enabled 5x faster development—writing only the essential logic while AI handled scaffolding, schema design, and component structure. Leveraging smart prompting + architectural docs keeps code quality high while I ship. 😉

### LLM Models and frameworks
- For content using Gemini 3.1 Flash
- Using Serper for scraping
- Using Lang Graph for the agentic workflow

---

## How It's Built

- **Next Js** — Web Framework
- **Performance** — `React.memo`, `useCallback`, `useMemo` wherever required
- **Data** — Supabase + TanStack Query for deduplication and caching 
- **UI** — Portal system for Modals and bottom sheet, Shadcn UI
- **Forms** — Zod + React Hook Form
- **Analytics** — Using simple db analytics table to track how you use my product 👀 
>Learnt these architectural practices during my freelancing + internships

---

## Database

Powered by **Supabase** (PostgreSQL)
