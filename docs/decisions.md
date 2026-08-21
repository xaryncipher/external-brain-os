# Decisions Log

| Date | Decision | Why | Alternatives Rejected |
|---|---|---|---|
| 2026-08-21 | V1 = Next.js + Tailwind + Supabase + Gemini + Vercel (all free) | User has Supabase free + Gemini key, needs $0, non-technical. Web PWA works on Android via PWA before native wrapper. | Native Android (needs Kotlin, complex) deferred to V2 |
| 2026-08-21 | Design: sage `#7C9082` + warm gray `#FAFAF8` calm Action Mode; rich Exploration placeholders only | Master asked for cute+futuristic+dark+premium blend → reconciled via Two-Mode Rule (Section 2) to avoid cognitive overload when acting. | All-dark gamified UI rejected for Action Mode (creates overwhelm) |
| 2026-08-21 | Single AI Brain (`/api/agent` + tools) vs per-feature AI | Single can reason across tasks/habits/flashcards, cheaper, consistent tone, bulk triage reuses same. | Per-feature AI rejected (fragmented, 4x cost, inconsistent) |
| 2026-08-21 | Addiction = lightweight urge log V1, full program V2 | User wants porn/NSFW quit support but full program would explode scope. Seed with `domain='Digital Behavior'` + coping step. | Full addiction tracker in V1 rejected (would break 5-system focus) |
| 2026-08-21 | Habits promoted to V1 minimal (from Master 5 systems) | Master defines 5 systems including Smart Tasks & Habits; flashcards/quizzes stay V2 draft-only. | Deferring habits to V2 rejected (violates Master #51) |
| 2026-08-21 | Master doc 2194 lines kept as reference, not source of truth | 2194 lines blows context window; 393-line PROJECT_SPEC is source of truth for prompts. | Pasting Master each prompt rejected (token burn) |
| 2026-08-21 | API key never in repo, server-only handlers | User leaked key in chat; security requires placeholder + regeneration. | Client-side Gemini call rejected (exposes key) |

*Add new rows when future spec conflicts arise — preserve rationale.*
