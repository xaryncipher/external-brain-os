# Status — ADHD Life OS

**Current phase:** Phase 4 fixed — Groq primary (gpt-oss-20b) + Gemini fallback + inline subtasks

| Phase | Done | Notes |
|---|---|---|
| Phase 0-3 | ✓ | scaffold + auth + UI + real DB |
| Phase 4 AI | ✓ fixed 2026-08-21 | `lib/groq.ts` gpt-oss-20b (0.09s) + `lib/ai.ts` fallback to `lib/gemini.ts:3` 3.6-flash, 5 routes via `callAI`, BrainDump AI, Tasks inline subtasks, Urge loading — `5974fbd` — build 17 routes ✓ |
| Phase 5 polish | ☐ next | loading/empty/mobile + export |

**Last commit:** `5974fbd`
**Env:** Need both `GROQ_API_KEY=gsk_...` and `GEMINI_API_KEY=AQ...` in `.env.local` + Vercel (fallback). Restart `npm run dev` after env change.
**Test:** BrainDump triage fast, Break down <1s and stays inline, Had urge shows step even on 429.
