# Architecture — ADHD Life OS (V1)

> Single source of truth is `PROJECT_SPEC.md`. This file is the technical companion: folders, DB, API contracts, and how to extend without breaking.

## 1. Stack & Hosting ($0)

```
Browser (PWA)  →  Next.js 14 App Router + Tailwind + Inter
                 ↳ Supabase JS client (anon key, RLS)
                 ↳ Server Route Handlers → Gemini 2.0 Flash (GEMINI_API_KEY server-only)
                 ↓
              Vercel (free) deploys from GitHub main
                 ↓
              Supabase (free Postgres + Auth)
```

All AI calls async/non-blocking + loading state. Free tier: Gemini 15 RPM / 1500 RPD / 1M TPM. If limit hit → calm fallback, never crash.

## 2. Folder Structure (scales to V2 without rework)

```
app/
  layout.tsx              # root layout, nav shell, Inter font
  globals.css             # Tailwind base
  (auth)/login/page.tsx
  today/page.tsx          # Now — FocusCard + BrainDump + UpNext (Action Mode)
  tasks/page.tsx          # Backlog + Today toggle
  habits/page.tsx         # Minimal V1
  life-map/page.tsx       # placeholder V1
  learn/page.tsx          # placeholder V1
  insights/page.tsx       # placeholder V1
  game/page.tsx           # placeholder V1
  api/
    parse-dump/route.ts
    triage/route.ts
    breakdown-task/route.ts
    agent/route.ts        # single AI brain + tools
    cope/route.ts
    tasks/route.ts        # GET/POST
    tasks/[id]/route.ts   # PATCH
    habits/route.ts
    habit-logs/route.ts
components/
  ui/                     # tokens only: Button, Card, Input, Modal (reuse everywhere)
  today/FocusCard.tsx
  today/UpNext.tsx
  today/BrainDump.tsx
  today/RescueOverlay.tsx
  tasks/TaskRow.tsx
  habits/HabitRow.tsx
lib/
  supabase.ts             # createClient (anon) + createServerClient (route handlers)
  gemini.ts               # callGemini(prompt, schema) + validateOrFallback + retry
  validators.ts           # Zod schemas (see contracts below)
tailwind.config.js        # tokens from PROJECT_SPEC.md:43 — never inline hex
```

**Rule:** New domain → new folder `app/<domain>/*` + new Supabase table(s). Never mix domains. Shared UI stays in `components/ui`.

## 3. Data Model (Supabase Postgres + RLS)

```mermaid
erDiagram
  auth_users ||--o{ tasks : "user_id"
  auth_users ||--o{ brain_dumps : "user_id"
  auth_users ||--o{ habits : "user_id"
  habits ||--o{ habit_logs : "habit_id"
  tasks }o--o tasks : "parent_task_id (substeps)"

  tasks {
    uuid id PK
    uuid user_id FK
    text title
    text status "todo|in_progress|done"
    bool is_today
    uuid parent_task_id FK "nullable"
    int step_order
    int estimated_minutes "nullable"
    text domain "nullable Health|Work|..."
    timestamptz created_at
    timestamptz completed_at "nullable"
  }
  brain_dumps {
    uuid id PK
    uuid user_id FK
    text raw_text
    jsonb parsed_json "nullable"
    timestamptz created_at
  }
  habits {
    uuid id PK
    uuid user_id FK
    text title
    timestamptz created_at
  }
  habit_logs {
    uuid id PK
    uuid habit_id FK
    uuid user_id FK
    timestamptz completed_at
  }
```

**RLS (already in PROJECT_SPEC.md:163):** Enable RLS on all 4 tables + policy `auth.uid() = user_id` for all operations. V2 tables (`flashcards`, `quizzes`, `urges`) will follow same pattern — additive, never alter V1.

**Indexes:** None needed for single-user V1. Add later: `tasks(user_id, is_today, status)`.

## 4. API Contracts (Zod-validated, server-only Gemini key)

All handlers: `auth.getUser()` → reject 401 if null → validate body with Zod → call Gemini via `lib/gemini.ts` → validate JSON → RLS-guarded DB write → return.

```ts
// lib/validators.ts — exact schemas the agent must use
import { z } from "zod";

export const ParseDumpReq = z.object({ raw_text: z.string().min(1).max(20000) });
export const ParseDumpRes = z.object({ tasks: z.array(z.object({ title: z.string().min(1).max(80) })).min(1) });

export const TriageReq = z.object({ raw_text: z.string().min(10).max(50000) });
export const TriageRes = z.object({
  items: z.array(z.object({
    title: z.string().max(80),
    type: z.enum(["task","habit","goal","project","avoid"]),
    bucket: z.enum(["RIGHT NOW","TODAY","THIS WEEK","LATER","OPTIONAL"]),
    reason: z.string().max(120)
  }))
});

export const BreakdownReq = z.object({ task_id: z.string().uuid(), title: z.string().min(1).max(120) });
export const BreakdownRes = z.object({ steps: z.array(z.object({ title: z.string().max(80), estimated_minutes: z.number().int().min(1).max(15) })).min(2).max(5) });

export const AgentReq = z.object({ message: z.string().min(1).max(10000), context: z.object({ todayTitles: z.array(z.string()).max(20) }).optional() });
export const AgentRes = z.object({
  reply: z.string().max(2000),
  tool_calls: z.array(z.object({
    name: z.enum(["create_task","update_task","delete_task","create_habit","log_habit","breakdown_task","create_flashcard_draft","create_quiz_draft"]),
    args: z.record(z.any())
  })).max(20),
  needs_confirmation: z.boolean()
});

export const CreateTaskReq = z.object({ title: z.string().min(1).max(120), is_today: z.boolean().default(false), parent_task_id: z.string().uuid().nullable().optional(), domain: z.string().max(30).nullable().optional() });
export const PatchTaskReq = z.object({ status: z.enum(["todo","in_progress","done"]).optional(), is_today: z.boolean().optional(), completed_at: z.string().nullable().optional() });
```

**Gemini helper contract** (`lib/gemini.ts`):
```ts
export async function callGemini(prompt: string, schema: z.ZodType, opts?: { retries?: number }): Promise<z.infer<typeof schema>>;
// - never sends GAMINI_API_KEY to client
// - timeout 8s, retry 1 on 429/500 with backoff
// - strips markdown fences, JSON.parse, Zod validate, throws typed error on fail
```

**Error handling matrix** (all routes):
| Gemini failure | 429 rate-limit | 500/timeout | Invalid JSON | Auth fail |
|---|---|---|---|---|
| Return 200 with `{ error: "Couldn't process that — try again?" }` + client shows calm banner | Same + `retry_after` hint | Same | Log + fallback | 401 |

## 5. Component Contracts (so premium look never drifts)

**Tokens source:** `tailwind.config.js` — `bg #FAFAF8, surface, text #2B2B28, muted, accent #7C9082, warning #D6A15C, border #E8E6E0, rounded 12px, Inter`.

- `FocusCard` props: `{ task: Task | null, onStuck, onDone, onStill }` — one large task, 3 buttons sentence-case, soft 200ms fade when Done promotes next. Empty state: "No tasks for today — add one or take a breath."
- `BrainDump` props: `{ onParsed }` — collapsible textarea, submit shows spinner pulse (not block), confirmation list (checkboxes) before save.
- `RescueOverlay` props: `{ open, step: string, onDone, onSmaller }` — full-screen calm, one micro-step 24px, progress dots neutral.
- `TaskRow` / `HabitRow` — 16px pad, border, accent check, no red.

**Two-Mode Rule:** Action screens (`/today`) never show exploration richness; placeholder screens never load heavy AI.

## 6. Extensibility (how to add V2 without breaking V1)

1. Add new table via migration (e.g., `flashcards`) + RLS.
2. Add new tool to `AgentReq` tools array in `lib/validators.ts` + handle in `agent/route.ts`.
3. Add new `app/<domain>/*` folder reusing `components/ui`.
4. Never edit `FocusCard` props to add flashcard fields — compose new card.

## 7. Performance & Security Guardrails

- Every Gemini call async, with skeleton/pulse, never freeze UI.
- `lib/supabase.ts` uses `anon` on client, `auth.getUser()` on server — never `service_role` client-side.
- No secrets in repo; verify with `git diff --staged | grep -i key` before commit.
- Single-user volume → no pagination needed V1; add later.

## 8. Build Order

Must follow `PROJECT_SPEC.md:304` Phase 0→5. After each phase run `docs/testing.md` checklist.

*End — update this file when folders/tables/contracts change, and note reason in docs/decisions.md.*
