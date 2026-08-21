# Current Task

**Phase:** Phase 1 code done — 2026-08-21 commit 832d521, pushed to origin/main (external-brain-os)
**Owner:** non-technical, $0 free-tier

## What Just Changed (Phase 1)
- Created `lib/supabase/client.ts` (browser) + `lib/supabase/server.ts` (server with cookies) + `lib/supabase.ts` re-export — fixes next/headers error `PROJECT_SPEC.md` would have had with single file
- Installed `@supabase/ssr`
- Created `lib/validators.ts` with Zod schemas `ParseDumpReq/Res` etc per `docs/architecture.md:4`
- Built `app/login/page.tsx:1` — calm premium card (sage accent, 12px, Inter, no red), email/pass, checks placeholder env → friendly "Supabase not configured", else `signInWithPassword` → redirect `/today`, calm error, pulse loading
- Built `app/today/page.tsx:1` — server guard `getUser()` → redirect `/login` if null, else shows placeholder shell + sign-out form (Phase 2 will replace with FocusCard)
- Created `middleware.ts:1` — uses `@supabase/ssr` createServerClient, handles placeholder env, redirects unauth → /login and auth → /today, handles cookies. Note: Next 16 warns to use `proxy` — still works, can migrate later.
- Verified `npm run build` ✓ (6/6 pages, no TS error), committed 9 files, pushed to `https://github.com/xaryncipher/external-brain-os.git` main for A+B.

## What Works
- Build green locally and remote (pushed).
- Login UI renders at `/login` even with placeholder env (shows config message instead of crash).

## What Doesn't / Needs User
- `.env.local` still has placeholders `https://YOUR_PROJECT...` → login will show "Supabase not configured" until you fill real values.
- Supabase tables: you said "Supabase done" but need to verify SQL `PROJECT_SPEC.md:122` actually Ran (green Success). If not, login will succeed but `today` data won't persist later.
- Vercel env not yet set — blank deploy will also show same config message until you add env there.

## Tests Run (Phase 1 partial)
- [x] `npm run build` passed
- [x] `git diff --cached` no secrets
- [ ] Manual login test pending — blocked by placeholder env
- [ ] RLS check pending — needs real Supabase user

## Exact Next Step — YOU (5 mins, no code):
1. Supabase dashboard → Settings → API → copy **Project URL** and **anon public** key
2. On your computer, open `C:\Users\X\Downloads\project\.env.local` in Notepad → replace `YOUR_PROJECT...` with real URL, `YOUR_ANON_KEY` with real anon key, `AIzaYourNewKey` with your new Gemini key (regenerated, per security note)
3. Save → run `npm run dev` → open `http://localhost:3000/login` → login with your Supabase user email/pass you created → should land on `/today` showing your email
4. If that works, go to Vercel → Project `external-brain-os` → Settings → Environment Variables → add same 3 keys → Redeploy

Then say "login works" and I will start Phase 2 (premium UI shell + preview.html gate).

## Handoff For Fresh Agent
Read `AGENTS.md` + `PROJECT_SPEC.md:304` Phase 1-2 + `docs/testing.md:1` + this file. Wait for user "login works" with real env before Phase 2.
