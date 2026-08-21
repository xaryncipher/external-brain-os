# Current Task

**Phase:** Polish complete — handoff to Phase 0
**Date:** 2026-08-21
**Owner:** non-technical, $0 free-tier only (Supabase free + Gemini free)

## What Just Changed
- Merged `PROJECT_SPEC.md` (283 lines) + Master (2194 lines) → `PROJECT_SPEC.md` v2 (393 lines)
- Created `AGENTS.md` (persistent rules), `docs/architecture.md` (folders/DB/API Zod), `docs/prompts.md` (perfected Gemini prompts with few-shot+schema), `docs/testing.md` (E2E checklist per phase), `docs/deployment.md` (copy-paste Supabase/Vercel), `docs/status.md`, `docs/decisions.md`
- Patched `PROJECT_SPEC.md` to link docs (`AGENTS.md`, `docs/architecture.md:4`, `docs/prompts.md:1`, etc.), added validation (Zod+safeJsonParse), error matrix, deployment reference, corrected context rule.

## What Works
- Spec is single source of truth, 393 lines, AI-readable, no leaked key (verified `AQ.` not in file)
- Docs explain how a new session resumes without 2194-line paste
- Prompts are retry/validate-guarded, cost-capped under 1500/day

## What Doesn't / Known Gaps
- No code yet — Phase 0 scaffold not run (empty git repo, only docs)
- `preview.html` not generated (happens in Phase 2)
- Supabase project not yet created by user (needs manual step in deployment.md:2)

## Tests Run
- Verified no `AQ.` leak in `PROJECT_SPEC.md` (grep false), line counts, file structure (`docs/`, `.agent/`)

## Exact Next Step
**Phase 0 — scaffold:** Run `docs/deployment.md:4`:
```bash
npx create-next-app@latest . --typescript --tailwind --app --eslint --import-alias "@/*"
npm install @supabase/supabase-js zod
# create .env.local with 3 keys
git add . && git commit -m "chore: scaffold Next.js + Tailwind"
git push → Vercel import → verify blank deploy
```
Then update `docs/status.md` Phase 0 ✓ and run `docs/testing.md:0`.

## Handoff For Fresh Agent
Read `AGENTS.md` + `PROJECT_SPEC.md` + `docs/architecture.md` + `docs/prompts.md` + this file → continue Phase 0. Do not re-ask product vision — it is in docs. User is non-technical; give copy-paste commands.
