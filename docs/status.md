# Status — ADHD Life OS

**Current phase:** Phase 2 done (mock) — waiting for your premium approval

| Phase | Done | Notes |
|---|---|---|
| Polish (spec + docs) | ✓ 2026-08-21 | `PROJECT_SPEC.md` v2 305 lines + AGENTS.md + docs/* |
| Phase 0 — scaffold | ✓ | Next.js 16.3.2 + Tailwind 4 + Inter + sage `#7C9082` — build ✓ — `a16d313` |
| Phase 1 — Supabase + Auth | ✓ | `lib/supabase/*` + `/login` + `/today` guard — build ✓ — `832d521` — you said "login works" |
| Phase 2 — static UI shell + preview.html gate | ✓ 2026-08-21 | `components/ui` + `FocusCard` + `BrainDump` mock + `RescueOverlay` + `TodayClient` mock 3 tasks + placeholders for 7 nav — `preview.html` 8599B + `ad8d273` — build 12 routes ✓ |
| Phase 3 — real data (Tasks & Habits) | ☐ next | Wire to Supabase — no AI yet |
| Phase 4 — AI integration | ☐ | parse/triage/breakdown/agent/cope |
| Phase 5 — polish | ☐ | Empty/loading/mobile + export |

**Last commit:** `ad8d273` feat: Phase 2 premium shell
**Preview:** `preview.html` at project root — double-click to open, no server needed. Should match `http://localhost:3000/today` mock.
**Next step:** You approve look ("colors good" or "make accent lighter/more padding"), then Phase 3.
