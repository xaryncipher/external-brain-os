# Status — ADHD Life OS

**Current phase:** Phase 0 complete — ready for Phase 1 (Supabase + Auth)

| Phase | Done | Notes |
|---|---|---|
| Polish (spec + docs) | ✓ 2026-08-21 | `PROJECT_SPEC.md` v2 305 lines + AGENTS.md + docs/* |
| Phase 0 — scaffold | ✓ 2026-08-21 | Next.js 16.3.2 App Router + Tailwind 4 + Inter + sage `#7C9082` + zod/supabase installed — `npm run build` ✓ — commit `a16d313` — repo name `external-brain-os` (life-os taken) |
| Phase 1 — Supabase + Auth | ☐ | Next: run SQL `PROJECT_SPEC.md:122` + manual user + `/login` |
| Phase 2 — static UI shell + preview.html gate | ☐ | Premium sage palette approval needed |
| Phase 3 — real data (Tasks & Habits) | ☐ | No AI yet |
| Phase 4 — AI integration | ☐ | parse/triage/breakdown/agent/cope |
| Phase 5 — polish | ☐ | Empty/loading/mobile + export |

**Last updated:** 2026-08-21 Phase 0
**Next step:** Phase 1 — user creates Supabase project, runs SQL, creates user, then agent builds `/login`. See `docs/deployment.md:2` + `docs/testing.md:1`.
**Deploy:** Not yet pushed to GitHub/Vercel — blank build passes locally. Push to new repo `external-brain-os` (or your chosen name) then Vercel import.
