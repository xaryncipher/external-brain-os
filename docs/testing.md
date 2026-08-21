# Testing — Manual E2E Checklist (V1, single-user)

> No paid test infra needed. Run this checklist after each phase before committing. Mirrors the polish: `/today` never regresses.

## 0. Pre-Flight (every session)
- [ ] `git status` clean, `.env.local` not staged (`git diff --staged` has no keys)
- [ ] `npm run dev` loads without red console errors
- [ ] Supabase project reachable (dashboard → Table Editor shows tables)

## 1. Auth + RLS (Phase 1)
- [ ] `/login` with correct email/pass → redirects to `/today`
- [ ] `/login` with wrong pass shows calm "Couldn't sign in — check email/password?" (no raw error)
- [ ] Logged out → visiting `/today` redirects to `/login`
- [ ] RLS: Create task as user A → verify in Supabase SQL that user B cannot select it (`select * from tasks` as B returns 0)

## 2. Visual Polish (Phase 2 — gate before logic)
- [ ] `preview.html` opens via double-click, matches tokens: bg `#FAFAF8`, accent `#7C9082`, Inter, rounded 12px, no red
- [ ] `/today` mock matches `preview.html` pixel-wise at 375px (mobile) + 1280px (desktop)
- [ ] FocusCard large centered, UpNext collapsed list de-emphasized, bottom nav on mobile
- [ ] RescueOverlay full-screen calm, one micro-step, dots neutral, not red
- [ ] Placeholder nav (`/life-map`, `/learn`, `/insights`, `/game`) renders "Coming soon" without errors

## 3. Real Data — Tasks & Habits (Phase 3)
- [ ] Create task → appears in backlog
- [ ] Move task to Today → appears in `/today` UpNext, not duplicated
- [ ] Complete task (Done) → fades, next promotes to FocusCard
- [ ] Still on it → stays, no duplicate log burst
- [ ] Stuck → offers breakdown or swap, text matches `Rescue` copy
- [ ] Create habit → appears in `/habits`
- [ ] Log habit → count increments, shows "2 today" neutral (no broken streak red)
- [ ] Reload page → data persists (Supabase round-trip, not just local)
- [ ] Logout → re-login → same data (RLS per-user)

## 4. AI Integration (Phase 4)
- [ ] Brain dump "call dentist, mom gift, report friday" → confirmation list 3 tasks → Add to backlog works
- [ ] Large paste (20+ lines) → triage table shows type+bucket editable → confirm creates tasks+habits correctly, `RIGHT NOW` ≤3
- [ ] "Break this down" on "Write report" → 2-5 steps <5min each, accept saves as subtasks with `parent_task_id`
- [ ] Chat `POST /api/agent` "add gym habit" → creates habit (or needs_confirmation if bulk)
- [ ] Chat paste 30 items → agent returns ~15 tool_calls with `needs_confirmation:true`, no silent mass delete
- [ ] Coping trigger "urge: bored" → returns `{"step":"..."}` <30 words, non-judgmental, no medical claim
- [ ] Gemini 429/failure simulation (disconnect internet or invalid key temporarily) → UI shows "Couldn't process that — try again?" banner, no raw dump, app still usable
- [ ] Flashcard draft from agent shows preview only (no crash when `flashcards` table absent)

## 5. Polish & Guardrails (Phase 5)
- [ ] Loading states: brain dump submit shows soft pulse, not fullscreen spinner; focus transition 200ms fade
- [ ] Empty states: No tasks today → calm "No tasks yet — add one above or take a breath." (not "You have 0 tasks!!")
- [ ] Mobile pass: 320px, 375px, 414px no overflow, tap targets ≥44px, no horizontal scroll
- [ ] Export JSON (Settings) downloads user's tasks+habits, re-import not required V1 but JSON is valid
- [ ] Regressions after each commit: repeats #3 checks 1-4 + #2 placeholder still renders

## 6. Performance & Security
- [ ] Network tab: no `GEMINI_API_KEY` in any client request (verify WS/fetch)
- [ ] `lib/gemini.ts` retries once on 429, then calm fallback; debounced submit (double-click once)
- [ ] `git diff --staged` shows no secrets before `git commit`

## 7. Sign-Off per Phase
Copy this into `.agent/current-task.md` after each phase:

```
Phase X done — date
Checklist: 0(✓) 1(✓) 2(✓) 3(✓) 4(✓/na) 5(✓/na) 6(✓)
Manual test notes: ...
Known issues: ...
Next step: Phase Y
```

*End — if any check fails, fix before phase N+1. This is the contract a new AI session uses to verify it didn't break you.*
