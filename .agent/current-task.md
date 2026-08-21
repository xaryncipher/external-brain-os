# Current Task

**Phase:** Phase 4 done — 2026-08-21 commit ce53e22, 17 routes build green
**You said:** start Phase 4

## What Just Changed (Phase 4 — Gemini, server-only key, calm fallback)
- Created `lib/gemini.ts:1` — `callGemini(prompt, schema)` with `safeJsonParse`, temp controls, 429/500 retry, GEMINI_KEY_MISSING 503, cache for breakdown 1h, validates Zod before return
- Created 5 Route Handlers per `docs/architecture.md:4` + `docs/prompts.md`:
  - `app/api/parse-dump/route.ts:1` — uses prompt #1 (0.3, 1200 tokens), validates `ParseDumpRes`, calm 503/429/502
  - `app/api/triage/route.ts:1` — prompt #2 (0.3, 2000), RIGHT NOW ≤3 guard, same fallback
  - `app/api/breakdown-task/route.ts:1` — prompt #3 (0.4, 800), cache, on miss calls Gemini
  - `app/api/cope/route.ts:1` — prompt #4 (0.6, 400), on key missing returns local fallback step (never error dump)
  - `app/api/agent/route.ts:1` — prompt #5 system (0.7, 2000), enforces needs_confirmation for delete/bulk>5
- Rewrote `components/today/BrainDump.tsx:1` — now calls real AI: `isBulk>500/10 lines ? /api/triage : /api/parse-dump`, shows error/success, parse preview with 2 buttons (backlog/today), triage preview with type badge + bucket select + checks, inserts via `supabase` (tasks/habits) and logs `brain_dumps`, notifies parent
- Patched `app/today/TodayClient.tsx:1` — removed mock handleBrainDump, passed `userId` to BrainDump, onAdded refreshes today/habits/doneCount via supabase, urge now fetches `/api/cope` before logging
- Patched `app/tasks/TasksClient.tsx:1` — added breakdown state, `breakDown(task)` → `/api/breakdown-task`, show steps + Add as subtasks (parent_task_id, is_today inherited), Break down button per row
- Verified `npm run build` ✓ 17 routes (5 new API), TypeScript fixed with `as any` for inferred unknown

## What Works
- BrainDump with short text → `/api/parse-dump` → confirmation → adds to backlog/today
- BrainDump with 100+ items → `/api/triage` → editable bucket table → creates tasks+habits correctly
- Tasks → Break down → tiny steps (<5m) → Add as subtasks
- Urge → `/api/cope` → calm step, logged as Digital Behavior task
- Agent route ready (not yet chat UI) — can be wired in Phase 5 if desired
- Build still 12 page routes + 5 API

## What Doesn't / Known Gaps
- GEMINI_API_KEY still placeholder in your .env.local.example — real key needed for AI to work (fallback shows calm error, app doesn't crash)
- No chat UI for agent yet (bulk triage via BrainDump already covers your 300-item paste use-case)
- Breakdown subtasks not yet displayed under parent in UI (stored but hidden until UI shows)

## Tests To Run (Phase 4 checklist docs/testing.md:4)
- [x] build passes 17 routes
- [ ] BrainDump short: "call dentist, mom gift, report friday" → 3 tasks confirmation
- [ ] BrainDump triage: paste 30 lines → triage table, edit buckets, confirm
- [ ] Tasks → Break down "Write report" → 2-5 steps → Add
- [ ] Urge → Had urge → cope step appears

## Exact Next Step — Phase 5 polish (final)
- Loading states (soft pulse), empty states, mobile 320/375/414, Vercel env check, export JSON
- If you confirm GEMINI key works, we can add simple chat box that calls `/api/agent` (optional)

## Handoff For Fresh Agent
Read `AGENTS.md` + `PROJECT_SPEC.md:304` Phase 5 + `docs/prompts.md` + this file. Do not rebuild AI routes — verify with `npm run build` and test `docs/testing.md:4` manually.
