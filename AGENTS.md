<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Rules for AI Coding Agents (OpenCode, Cursor, Claude, Codex)

This file is the **persistent memory** for any AI session. Read it before touching any code. The project is a private ADHD Life OS for a non-technical owner — reliability > cleverness.

## 1. Inspect Before Edit — Mandatory
1. `Read PROJECT_SPEC.md` (single source of truth) + `docs/architecture.md` + `git status` + `git log --oneline -5`
2. `Read` every file you plan to edit **in full** before editing. Never guess a file's content.
3. If `PROJECT_SPEC.md` and a doc conflict, `PROJECT_SPEC.md` wins for V1 — note conflict in `docs/decisions.md` and ask user.

## 2. Smallest Reasonable Change
- One task, one PR/commit. Never build entire app in one giant prompt.
- Prefer adding a new file over editing a working file (see Extensibility Rules in `PROJECT_SPEC.md:337`).
- If you must touch a shared file (`lib/supabase.ts`, `tailwind.config.js`, `app/layout.tsx`), re-test `/today`, brain dump, and focus mode immediately after.
- Never modify unrelated files to "clean up" while doing a task.

## 3. Safety / Reversibility
- **NEVER** `git reset --hard`, `rm -rf`, mass delete, or overwrite `.env.local`.
- **NEVER** commit `.env.local`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or any secret. Keys live only in Vercel env + local `.env.local`.
- Warn and get confirmation before: deleting work, overwriting important files, destructive git, exposing secrets, creating charges, destroying data.
- All DB changes use migrations — never drop columns in V1, only add.

## 4. Documentation Rules
- After each phase/task, update `.agent/current-task.md` and `.agent/session-handoff.md`:
  - what changed, files changed, tests run, what works / what doesn't, decisions, exact next step.
- A fresh AI session must be able to `Read` repo + handoff and continue without user explanation.
- Keep `docs/status.md` current (phase + checkboxes).

## 5. Coding Conventions
- **Stack:** Next.js App Router + TypeScript + Tailwind (tokens from `tailwind.config.js` only, never inline hex) + Supabase + Gemini server-side only.
- **Style:** Calm premium (sage `#7C9082`, warm gray `#FAFAF8`, Inter, 12px cards). No red, no gamified confetti in Action Mode.
- **Copy:** Calm/plain/second-person/sentence-case. See `PROJECT_SPEC.md:328`.
- **API:** All Gemini calls are server-side Route Handlers, validated with Zod, async/non-blocking with loading state. See `docs/prompts.md` and `docs/architecture.md`.
- **Tests:** Write/update tests where applicable, run them, and report results before claiming done. Single-user, so manual E2E checklist in `docs/testing.md` is the minimum.

## 6. Task Prompt Philosophy (use for every implementation prompt)
Future prompts to you should ask you to:
1. inspect relevant files
2. understand existing behavior
3. make smallest change
4. avoid unrelated mods
5. write/update tests
6. run tests
7. verify results
8. update docs/handoff
9. report what changed + remaining issues
10. commit if user approves

## 7. Context Window Discipline
- Do NOT paste the 2194-line Master doc into prompts. Prompt should say: `Read PROJECT_SPEC.md + docs/architecture.md + docs/prompts.md → do Phase X`.
- Stable product info lives in docs. Temporary task instructions live in the current prompt.

## 8. Failure Handling
- If Gemini fails/rate-limited (15 RPM / 1500 RPD), show calm fallback: "Couldn't process that — try again?" — never raw error dump.
- If task sits incomplete, do not flag punitively — it sits quietly in backlog.

## 9. Checklist Before Claiming Completion
- [ ] Inspected repo & spec before edit
- [ ] Smallest change, no unrelated edits
- [ ] Tests/checklist passed (`docs/testing.md`)
- [ ] `/today` still loads, focus swap works, brain dump works
- [ ] No secrets committed (`git diff --staged` checked)
- [ ] Updated `.agent/current-task.md` + `.agent/session-handoff.md`
- [ ] Reported what changed + next step

*End — Violating these wastes the owner's free-tier tokens and breaks trust. Prefer transparency over hidden behavior.*
