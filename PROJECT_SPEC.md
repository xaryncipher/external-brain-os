# External Brain — ADHD-Friendly Life OS (V2 Merged Spec)

## READ THIS FIRST (instructions for the AI coding agent)

You are building V1 of a web app for a person with executive dysfunction / ADHD + addiction-recovery support needs. This spec is the **single source of truth** — merged from `PROJECT_SPEC.md` (V1 Day Planner) + `Master Product Context — Complete Project Vision...md` (2194-line vision doc). **Persistent memory lives in `AGENTS.md` + `docs/*` + `.agent/*` — read those too.**

Build in the phased order at the bottom — do not build everything at once. After each phase, stop and confirm it works before continuing. Prioritize working simplicity over completeness.

**Context window rule:** This file is ~393 lines intentionally. Do NOT re-paste the 2194-line Master doc into prompts. Prompt template for any task: `Read AGENTS.md + PROJECT_SPEC.md + docs/architecture.md + docs/prompts.md → do Phase X`. If you need deeper vision, read Master doc as reference but treat THIS file as decision authority. If conflict, THIS file wins for V1 — note in `docs/decisions.md` and ask user.

The end user is non-technical. They will run terminal commands you give them but cannot debug code themselves. Give explicit, copy-pasteable commands at each phase. You must maintain extensibility so future features (habits, flashcards, quizzes, addiction module, Life Map, Game World, Insights) can be added without breaking V1's UI/performance/beauty — see Section 11 and `docs/architecture.md:6`.

---

## 1. Product summary

**What it is:** A private, single-user web app that acts as an "external brain" — it reduces the distance between *knowing what to do* and *actually doing it*. It is NOT a generic todo app.

**Who it's for:** One person (owner) in V1. No public signup. Single Supabase auth account.

**Core problem (from Master #1-#4):** ADHD/executive dysfunction makes it hard to (a) turn vague intentions into concrete steps, (b) decide what to do next, (c) start, (d) resist distraction/high-stimulation escape (including porn/NSFW addiction patterns), (e) return after setbacks without shame. Knowing is not enough — initiation is the bottleneck.

**V1 is successful iff these 5 Core Systems work (Master #51):**
1. **Now → Next Tiny Action** — answers "WHAT SHOULD I DO RIGHT NOW?" with one concrete step
2. **Activation / Rescue Mode** — when stuck/frozen/avoiding, guides via microscopic steps + pattern interrupt
3. **Adaptive Focus Mode** — one task at a time, adapts session length (5m → flow), stays quiet in flow
4. **AI Planning Layer** — natural-language control for entire system (brain dump + bulk list triage + task→habit/flashcard inference)
5. **Smart Tasks & Habits** — minimal-admin tasks + recurring habits, non-punishing progress

**Explicitly V1 minimal:** addiction urge log is a *lightweight V1 sub-feature* inside Tasks/Habits (see 6.5), not a full addiction program. **Full addiction analytics, Life Map editor, Game World simulation, full Learn platform, advanced Insights, recurring calendar sync, notifications/push, mobile native app, tags/projects — all V2 placeholder only (Section 12).** Build nav placeholders but do not implement their internals in V1.

---

## 2. Design philosophy (merged: calm Action + rich Exploration)

Every choice must reduce cognitive load. Use the **Two-Mode Rule** (Master #47-48 + #74):

- **Action Mode** (`/today`, Focus, Rescue): **Minimal & calm** — low stimulation so the user can *act*. Generous whitespace, muted palette, one accent, subtle motion only.
- **Exploration Mode** (`Life Map`, `Game World`, `Insights`, `Learn` placeholders): May be richer (colorful, animated, HUD) — but V1 placeholders only.

### Visual style tokens — single source of truth (Tailwind config)

```js
// tailwind.config.js — design tokens, never hardcode hex inline
colors: {
  bg: '#FAFAF8',           // warm off-white background
  surface: '#FFFFFF',
  text: '#2B2B28',         // near-black warm gray (not pure black)
  muted: '#6B7280',
  accent: '#7C9082',       // sage green — calmer than blue, chosen in V1
  accentHover: '#6A7D70',
  warning: '#D6A15C',      // amber for "needs attention" — NEVER red
  border: '#E8E6E0',
}
fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
borderRadius: { card: '12px', button: '10px' }
spacing: { cardPad: '20px' } // min 16-24px around cards
```

- **Typography:** Inter, 16-18px body, line-height 1.6-1.7, less density > more text.
- **Motion:** 150-250ms fade/slide only. No bounce/confetti in Action Mode.
- **No red anywhere** for warnings/failure. No streak-breaking, no "you failed" visuals.
- **No dark patterns:** no fake urgency, no red badges. Copy is calm/plain (Section 10).
- **Premium feel = Notion whitespace + Headspace gentleness + Linear restraint.** V2 Game World can add glow/HUD, but Action Mode stays calm.

**ADHD-specific rules:**
- One obvious next action per screen, never a wall of options.
- Fast to start (ONE TAP → START), hard to get lost in.
- Show "Today" only by default — don't avalanche backlog. Collapsed "up next" list only.

---

## 3. Tech stack (all free-tier, $0 default)

| Layer | Choice | Why | Free-tier limit |
|---|---|---|---|
| Frontend | **Next.js 14+** (React, App Router) + **Tailwind CSS** | Free, huge ecosystem, Vercel-native, AI agents know it well, builds premium look fast | Unlimited |
| DB + Auth | **Supabase** (free tier) | Free Postgres + Auth (email/password single user) + RLS | 500MB DB, 50k MAU |
| AI | **Google Gemini 2.0 Flash** via Google AI Studio | User already has key, free tier sufficient for personal use | ~15 RPM, 1500 RPD, 1M TPM |
| Hosting | **Vercel** (free) | Free Next.js hosting, GitHub auto-deploy | 100GB bandwidth |
| VCS | **GitHub** | Required for Vercel | Free |
| Preview | Single `preview.html` Tailwind CDN file for design approval pre-build | Zero build needed | — |

**Supabase guideline — what you do with your free account (explicit steps for non-technical):**

1. Create project at `supabase.com` → get `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Settings → API)
2. SQL Editor → paste SQL from Section 5 → Run
3. Authentication → Users → Create user → your email/password (single owner account, no signup page needed beyond `/login`)
4. Keep `service_role` key secret — never use client-side. V1 uses `anon` key only.

**Environment variables (`.env.local`, never commit, never put in spec):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=            # server-side only, read by /api/* routes
```

> **Key security:** The Gemini key you pasted in chat was exposed and must be regenerated in AI Studio (Delete old → Create new). Spec and repo contain only the placeholder name `GEMINI_API_KEY`, never the real value. All Gemini calls happen in Next.js Route Handlers server-side, never in browser JS.

---

## 4. Information architecture / pages

Preferred nav (Master #43) — build **all 7 items as nav shells** so V1 is future-ready, but only 3 have real functionality in V1:

| Route | V1 behavior |
|---|---|
| **`/login`** | Real. Simple email/password via Supabase auth. No signup flow. |
| **`/today` (Now)** | **Real — default after login.** Brain dump (collapsible), Focus card (one task large), collapsed "up next", quiet link to backlog. This is the Action Mode screen. |
| **`/tasks`** | Real. Backlog + Today toggle, CRUD, move to Today, breakdown trigger. |
| **`/habits`** | **Real minimal** (part of System 5). Create habit, log completion, non-punishing count ("3 today" not streak-shame). No advanced analytics in V1. |
| **`/life-map`** | **Placeholder V1.** Static page: "Life Map coming soon — your 8 domains (Health, Work, Learning, Personal Growth, Digital Behavior, Creative, Life Maintenance, Relationships) will live here." No editor yet — avoids scope creep. |
| **`/learn`** | **Placeholder V1.** "Flashcards & Quizzes — AI will generate from your tasks/notes. Coming soon." |
| **`/insights`** | **Placeholder V1.** "Insights — momentum & patterns. Coming soon." |
| **`/game`** | **Placeholder V1.** "Game World — visual world grows with real progress. Coming soon." |
| **`/more` or Settings** | Real minimal: Logout + theme toggle + data export JSON. No full settings page. |

No sidebar dashboard-with-widgets. Bottom nav on mobile, top quiet nav on desktop. `Now` is always the home.

---

## 5. Data model (Supabase / Postgres)

```sql
-- tasks — top-level tasks and subtask steps
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  status text not null default 'todo', -- 'todo' | 'in_progress' | 'done'
  is_today boolean not null default false,
  parent_task_id uuid references tasks(id), -- null = top-level; set = breakdown subtask
  step_order integer default 0,
  estimated_minutes integer,
  domain text, -- nullable, one of 8 Life Map domains for future grouping
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- brain_dumps — log raw input -> parsed result for debugging
create table brain_dumps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  raw_text text not null,
  parsed_json jsonb,
  created_at timestamptz default now()
);

-- habits — V1 minimal (Master #51 System 5 includes habits)
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  created_at timestamptz default now()
);
create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  completed_at timestamptz default now()
);

-- V2 tables NOT created in V1 (flashcards, quizzes, life_map_nodes, urges detailed) — see Section 12

-- RLS — user only sees own rows
alter table tasks enable row level security;
create policy "Users own tasks" on tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
alter table brain_dumps enable row level security;
create policy "Users own dumps" on brain_dumps for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
alter table habits enable row level security;
create policy "Users own habits" on habits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
alter table habit_logs enable row level security;
create policy "Users own habit_logs" on habit_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Indexes to add later as needed — not required for V1 single-user volume.

---

## 6. Core features — detailed behavior

### 6.1 Brain dump → task parsing (System 4, V1)
- User types/pastes messy text ("ugh call dentist, mom bday gift, report due friday").
- Submit → `POST /api/parse-dump` → Gemini extracts tasks → **Confirmation list** (checkboxes) before save → "Add to backlog" or "Add to today". Never auto-fill Today (prevents overwhelm).
- Save also logs to `brain_dumps` for debugging.

**Gemini prompt — parse-dump (perfected version in `docs/prompts.md:1` — use that copy):**
```
You are helping someone with ADHD turn a messy brain dump into clear tasks.
Extract distinct tasks. For each:
- short, action-oriented title (verb-first, <8 words)
- do not merge unrelated tasks, do not invent tasks
Return ONLY valid JSON: {"tasks": [{"title": "..."}]}
Text: """{{user_input}}"""
```
Validate with `ParseDumpRes` (`lib/validators.ts`), strip fences via `safeJsonParse` (`docs/prompts.md:6`), temp 0.3. On fail → retry once → calm fallback.

### 6.1b Large messy list triage (Master #22 — V1 AI must handle 300-item pastes)
This is the SAME brain dump, but with bulk-classification. If input > ~500 chars or >10 lines, use triage prompt instead of simple parse. It classifies each item and proposes disposition without auto-committing.

**Gemini prompt — triage (perfected version in `docs/prompts.md:2`):**
```
You parse a huge messy list (up to 400 items) from someone with executive dysfunction.
For each item, classify as: task (finite action), habit (recurring behavior), goal (long-term outcome), project (collection), or avoid (thing to avoid/distraction). Also suggest bucket: RIGHT NOW / TODAY / THIS WEEK / LATER / OPTIONAL/DREAMS and if it belongs to a habit or could become a flashcard.
Group duplicates/related items. Estimate urgency/importance. Detect overload and limit RIGHT NOW to max 3.
Return ONLY JSON: {"items":[{"title":"...","type":"task|habit|goal|project|avoid","bucket":"RIGHT NOW|TODAY|THIS WEEK|LATER|OPTIONAL","reason":"..."}]}
Text: """{{user_input}}"""
```
Validate with `TriageRes`, few-shot included in `docs/prompts.md:2`. Cache not needed; debounce 1.5s.
UI shows grouped confirmation table (type + bucket editable) → user confirms → creates tasks/habits accordingly (habits go to `habits` table). This satisfies "AI categorizes and auto-adds to tasks/habits/flashcards/quizzes" without inventing flashcards in V1 — flashcards rows are deferred to V2 but classification is shown.

### 6.2 Task breakdown (vague → tiny steps)
- Click "Break this down" on any task → `POST /api/breakdown-task` → shows 2-5 steps (each <5min) → user accepts/edits/discards → saves as subtasks with `parent_task_id`.

**Prompt (perfected version in `docs/prompts.md:3`):**
```
You help someone with executive dysfunction start a task that feels too big.
Break into 2-5 tiny concrete first steps (<5 min each), ordered, specific verbs (not "plan").
Task: "{{task_title}}"
Return ONLY JSON: {"steps": [{"title": "...", "estimated_minutes": 5}]}
```
Validate with `BreakdownRes`, cache 1h same title to save Gemini quota (`docs/prompts.md:7`).

### 6.3 Focus mode (System 3 — Adaptive)
- `/today` shows ONE task prominent (top of Today list or `in_progress`). Others minimized below (small scroll list).
- Click minimized task → swaps into focus.
- Buttons: **Stuck / Still on it / Done**.
  - Done → mark complete, gentle fade-out, next promotes.
  - Still on it → keep focus, log timestamp (no shame).
  - Stuck → trigger 6.2 breakdown OR offer swap ("No problem — break into smaller steps or switch for now?").
- **Adaptation (Master #19):** Start 5m session if user struggles (recent Stucks), extend to 10m when momentum, then *stop interrupting* when in flow (hide timer prompts). Never rigid 25m Pomodoro unless user prefers.

### 6.4 Activation / Rescue Mode (System 2 — Master #14-#17, was missing in V1 spec)
Dedicated screen/state reachable from Now when stuck (explicit button "I'm stuck" + auto-suggestion after 2x Stuck or 3 postponements).

Sequence: `Detect stuck → Pattern interrupt → Microscopic physical step → Immediate feedback → Next tiny step → Momentum → Gradually increase challenge`.

- **Stuck detection signals (probabilistic, need 2+):** repeated postponements, long inactivity, lack of interaction, repeated abandonment, explicit "I'm stuck", historical avoidance. No single threshold.
- **Pattern interrupt options (safe only):** visual change, novelty, movement prompt ("put feet on floor"), reframing, micro-challenge. No harmful shock.
- **Adaptive difficulty (Master #7):**
  - Severe freeze: "Put your feet on the floor." → "Stand up." → "Walk to bathroom."
  - Building momentum: "Brush teeth." → "Continue morning routine."
  - System never forces full chain — picks entry point based on observed state.
- **Escalation if ignored:** 1) smaller reminder → 2) smaller action → 3) adaptive question → 4) new strategy → 5) distraction interrupt → 6) accountability nudge if enabled → 7) safe urgency (countdown) → 8) recovery/replan if task is inappropriate. Always distinguish "refusing" vs "genuinely cannot initiate".
- **UI:** Full-screen calm overlay, one micro-step large, single "Done / Need smaller step" button, progress dots (not shame). Uses same calm tokens as Action Mode.

### 6.5 Non-punishing progress + Recovery (Master #34-#37)
- **Never:** red, broken streaks, "you failed", "missed X days", all-or-nothing framing.
- Completion indicator: neutral "3 done today". Incomplete tasks sit quietly in backlog.
- **If streak-like needed:** show "momentum" (gentle fill, not binary broken/maintained), preserve history, emphasize recovery.
- **Breakage handling:** warm welcome back, tiny action, comeback animation, adaptive recovery plan, then normal operation. Never avalanche "you missed 147 things" — instead "You're returning, not starting from zero." Tasks have resting state "Not now, not never" with preserved progress.
- **Addiction/urge lightweight V1:** Inside `/tasks` or a small "Digital Behavior" card, a neutral `Urge log` button: user taps "Had urge" → logs timestamp + optional trigger text → app shows coping micro-step from coping prompt (breath/walk/delay 2min) — no shame, no counter that resets to zero punitively. Full addiction program + charts deferred to V2, but data is preserved via extra `domain='Digital Behavior'` tasks + future `urges` table.

**Coping micro-prompt (perfected version in `docs/prompts.md:4`):**
```
Give a 60-second, non-judgmental coping micro-step for an urge (porn/NSFW or distraction). Calm, practical, no shame, no medical claims. One specific action (<30 words).
Context: "{{trigger_text}}"
Return ONLY JSON: {"step": "..."}
```

### 6.6 Single centralized AI Brain (Master #45 + PROJECT_SPEC #12.2 — reconciled)

**Decision: One AI orchestration layer, not per-feature AI.** This answers "single section vs per part?"

- One route: `POST /api/agent` — receives `message` (chat or pasted list) + current context (today tasks, habits, pending).
- Tool definitions (function calling) covering every domain:
  ```json
  [
    {"name":"create_task","params":{"title":"string","is_today":"boolean"}},
    {"name":"update_task","params":{"id":"string","status":"string"}},
    {"name":"delete_task","params":{"id":"string"}},
    {"name":"create_habit","params":{"title":"string"}},
    {"name":"log_habit","params":{"habit_id":"string"}},
    {"name":"breakdown_task","params":{"task_id":"string"}},
    {"name":"create_flashcard_draft","params":{"front":"string","back":"string"}},
    {"name":"create_quiz_draft","params":{"title":"string","questions":"array"}}
  ]
  ```
  In V1, flashcard/quiz tools return drafts shown as preview only (not saved to DB until V2 tables exist) — this prevents breaking.
- **System prompt** includes tone rules (Section 10), autonomy handling (Master #29: Manual= suggest+confirm, Guided= auto-org but confirm destructive, Autopilot= auto-maintain, Rescue= directive). V1 defaults to **Guided** (auto but destructive deletes always confirm).
- **Why single:** can reason across domains ("this is both a task and habit"), easier to extend (add tool in one place), consistent tone, and bulk paste classification (6.1b) is the same agent with a triage prompt variant.
- **Per-module "sections"** exist as reusable prompt templates (parse-dump, breakdown, coping, triage) that the single agent calls — so you get per-part specialization without per-part separate chatbots. This is the user-requested spec: single section with full access + per-part tool templates.

---

## 7. API routes (Next.js Route Handlers — server-side Gemini key) — full contracts in `docs/architecture.md:4` + `lib/validators.ts`

- `POST /api/parse-dump` — raw text → parsed tasks (confirmation before save) — validate `ParseDumpReq/Res`
- `POST /api/triage` — big list → classified items (CONFIRM before save) — can be merged into parse-dump with length check — validate `TriageReq/Res`
- `POST /api/breakdown-task` — {task_id, title} → steps — validate `BreakdownReq/Res`
- `POST /api/agent` — {message, context} → tool calls + natural response (conversational CRUD for tasks/habits/flashcards/quizzes drafts) — validate `AgentReq/Res` (`docs/prompts.md:5` system prompt)
- `POST /api/tasks` — create task(s) — validate `CreateTaskReq`
- `PATCH /api/tasks/:id` — update status/is_today — validate `PatchTaskReq`
- `GET /api/tasks?today=true|false`
- `POST /api/habits` + `POST /api/habit-logs` + `GET /api/habits`
- `POST /api/cope` — trigger coping micro-step (optional, can be via agent)
- All routes verify Supabase auth via `auth.getUser()`, enforce RLS, never expose GEMINI_API_KEY to client. Error matrix: 429/500/timeout/invalid JSON → 200 + `{error:"Couldn't process that — try again?"}` + calm banner (see `docs/architecture.md:4` + `docs/prompts.md:6`). Gemini helper = `callGemini(prompt, schema)` with strip+fence+Zod+retry.

---

## 8. How you see the design BEFORE building (user request) — see `docs/deployment.md:6`

1. **Tailwind tokens (Section 2 + `tailwind.config.js`)** are the single premium source — no ad-hoc hex.
2. After Phase 0 scaffold, we generate a **static `preview.html`** (Tailwind CDN) showing: Now/Focus card, Brain dump + confirmation list, Backlog, Habit row, Rescue micro-step overlay, placeholder nav. Open by double-clicking — no server needed. You approve or request color/spacing changes before Phase 2 logic.
3. The implemented `/today` (Phase 2) must visually match `preview.html` exactly — this is the "premium polished" gate. Checklist in `docs/testing.md:2`.

---

## 9. Build plan — phases (stop & confirm each before next) — checklist per phase in `docs/testing.md`, deploy steps in `docs/deployment.md`

**Phase 0 — scaffold**
`npx create-next-app@latest` (TS + Tailwind + App Router + ESLint) → push GitHub → connect Vercel → verify blank deploy. Copy `.env.local` template. Update `.agent/current-task.md` + `docs/status.md`.

**Phase 1 — Supabase + Auth**
Run Section 5 SQL → create manual owner user → build `/login` → confirm login→`/today` redirect, RLS blocks unauthenticated. Pass `docs/testing.md:1`.

**Phase 2 — static UI shell (premium gate)**
Build `/today` layout + `preview.html` with mock data first (no DB). Get sage palette, Inter, spacing, Focus card, collapsed list, habit row, rescue overlay, and 7-nav placeholders right. Confirm desktop+mobile + your design approval. Pass `docs/testing.md:2`.

**Phase 3 — real data (Tasks & Habits)**
Wire `/today` + `/tasks` + `/habits` to Supabase. CRUD, move to Today, habit log, gentle progress count. Confirm without AI. Pass `docs/testing.md:3`.

**Phase 4 — AI integration**
Build `/api/parse-dump` + `/api/triage` + `/api/breakdown-task` + coping + `/api/agent` (single brain). Wire brain dump confirmation + "Break down" + chat CRUD + bulk paste triage. Test with messy + 50-line pastes. Verify tool drafts don't break when flashcard table absent. Use `docs/prompts.md` perfected prompts + `lib/validators.ts`. Pass `docs/testing.md:4`.

**Phase 5 — polish & guardrails**
Loading states (soft pulse, not spinner), empty states ("No tasks today — calm & inviting"), mobile pass, error handling for Gemini, rescue flow manual test, export JSON. Pass `docs/testing.md:5-6`.

**Do not start Phase N+1 until Phase N is confirmed working + checklist signed off + you approve preview where relevant. Record in `.agent/current-task.md`.**

---

## 10. Copy/tone guidelines (for all UI text + AI responses)

- Calm, plain, second person ("your tasks"), sentence case button verbs ("Add to today").
- No exclamation, no gamified praise ("You're crushing it!!"), no confetti, no guilt ("You missed...").
- On AI uncertainty/failure: "Couldn't process that — try again?" not error dump.
- Addiction/urge copy: supportive, non-judgmental, never shaming, no medical claims.

---

## 11. Extensibility rules — how an AI agent upgrades WITHOUT breaking V1 (your request) — see `docs/architecture.md:6` + `AGENTS.md:2`

This is how future AI sessions add flashcards/quizzes/Life Map etc. without regressions:

1. **Additive only:** Never modify a working file to add a new feature if a new file will do. New domain → new folder under `/app` + new Supabase table(s) — never mix tasks+habits in one file/table. If shared file must change (layout, supabase client, theme), make the smallest change and immediately re-test `/today`, focus, and brain dump.
2. **One domain, one folder:** `app/tasks/*`, `app/habits/*`, `app/flashcards/*`, `app/quizzes/*`, `app/life-map/*`, `app/game/*`, `app/insights/*`. Shared UI lives in `components/ui/*`.
3. **Design tokens, not one-offs:** All colors/spacing/type come from `tailwind.config.js` (Section 2). New feature screen automatically looks premium because it reuses tokens — no inline hex.
4. **Single AI brain, additive tools:** To add a new feature (e.g., addiction detailed tracker), add new Supabase table + add new tool definitions to `/api/agent` — do NOT create a parallel `/api/addiction-agent`. Bulk paste triage automatically picks up new tools.
5. **Performance guardrail:** Every new Gemini call is async/non-blocking with loading state — never freeze UI.
6. **Confirmation before destructive:** Deletes/auto-scheduling always show confirmation (same pattern as brain dump). V2 flashcards/quizzes drafts are preview-only until DB exists.
7. **Regression check after every feature:** Does `/today` load, does focus swap, does brain dump parse, does habit log work, do placeholders still render? If any regresses, fix before continuing.
8. **One-paragraph plan before coding:** Agent writes what screen(s) a new feature touches and gets user thumbs-up before coding — do not silently redesign existing screens.

Following these, running `/api/agent` with a prompt "Add flashcards from my notes" will generate drafts without touching `/today` styling or task logic.

---

## 12. V2 roadmap (design now, do NOT build until V1 confirmed — Master #51-#53)

Schema must not block these later:

- **Habits** — already V1 minimal; V2 adds frequency, streak-alternative momentum, "Not now, not never" resting, and Insights correlation.
- **Addiction / Digital Behavior module** — explicit V2 extension: `urges` table (id, user_id, trigger, coping_step, created_at), non-punishing momentum view, trigger patterns, opt-in accountability (AI/trusted person/community — Master #30, privacy explicit). V1's lightweight urge log + Digital Behavior domain tasks are the seed.
- **Flashcards** — `flashcards` (id, user_id, deck, front, back, next_review_at, source_task_id) + spaced repetition.
- **Quizzes** — `quizzes` (id, user_id, title, questions jsonb, source).
- **Learn platform** — notes → AI summarization → flashcard/quiz generation (uses same `/api/agent` draft tools, now persisted).
- **Life Map** — hybrid: Life Areas → Goals → Projects → Tasks/Habits. Editor for 8 domains, "Not now, not never" parking, resume conditions.
- **Game World** — personal base, regions grow with real progress, no permanent destruction on absence, comeback celebration.
- **Insights** — consistency, procrastination patterns, focus, momentum, charts — not V1.
- **AI Coach** — autonomy modes Manual/Guided/Autopilot/Rescue (Master #29), coach personalities (supportive/tough/strategist/playful — Master #31), adaptive difficulty fully wired.

V1 placeholders ensure nav does not need redesign later.

---

## 13. Security & free-cost constraints

- $0 default, no hidden billing. Mark any paid API before using — none needed for V1.
- **Gemini key:** Store only in Vercel env + local `.env.local`. Rotate the exposed key immediately in AI Studio (Delete old → Create new). Spec never contains the real value.
- **Privacy (Master #50):** Sensitive data (behavior, urges, triggers) is opt-in, minimal cloud, RLS enforced, user controls sharing. No medical diagnosis claims.
- **Inspect before editing, smallest change, test before claiming completion** (Master #60-63).

---

## 14. Appendix — decisions preserved from Master (why V1 looks this way)

This appendix compresses 2194 lines of rationale so future agents understand *intent* without re-reading the full Master doc. Do not re-litigate these without user approval:

- Central principle: reduce distance intention→action. If a feature adds admin burden or dashboard overwhelm, question it (Master #2, #56-57).
- Origin insight: user can know exactly what to do and still not start — hence Rescue Mode & adaptive difficulty, not just reminders (Master #3-4).
- Behavioral model: intention→decision→activation→action→momentum→completion→recovery with adaptive intervention engine (Master #5-6).
- Prioritization: urgency+importance+consequences+long-term+state+deadlines+behavior+variety (variety avoids boredom but never overrides safety — Master #27).
- Autonomy, accountability, coach personalities, urgency (safe/reversible), "Not now not never", failure-as-information, comeback, world behavior — all deferred or lightweight in V1 but preserved as design intent for V2 (Master #29-#40).
- Originality: do not just clone Habitica/TickTick/Todoist — combine execution support + activation + focus + AI planning as adaptive system (Master #40-41).
- Methodology: plan→small task→inspect→implement→test→verify→document→commit (Master #62-63). UX-first: wireframes/preview before architecture lock (Master #63).

*End — V2 Merged Spec. This file + Master Product Context together are the project memory. Changes to product direction must ask the user.*
