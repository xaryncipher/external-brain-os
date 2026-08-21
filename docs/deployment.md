# Deployment — $0 Supabase + Vercel + Gemini (non-technical copy-paste)

> V1 is one Next.js app + one Supabase project + one Gemini key. All free.

## 1. Prerequisites (once)
- GitHub account (free)
- Vercel account (sign in with GitHub, free)
- Supabase account (you have it) + Google AI Studio key (you have it — remember to regenerate the exposed one)

## 2. Supabase Setup (copy-paste, 3 minutes)

1. `supabase.com` → New Project → pick region near you → set DB password (save it).
2. Wait 2 mins for project green → left menu → **SQL Editor** → **New Query** → paste **entire** SQL from `PROJECT_SPEC.md:122` (tasks + brain_dumps + habits + habit_logs + RLS) → **Run**. Should say "Success, no rows returned."
3. **Table Editor** → verify 4 tables appear.
4. **Authentication** → **Users** → **Add user** → `Create new user` → enter your email + password → **Create** (this is the single V1 owner). Check "Auto Confirm" if shown.
5. **Project Settings** → **API** → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Do NOT copy `service_role` — never needed V1.

## 3. Gemini Key (regenerate because pasted key was exposed)

1. `aistudio.google.com` → **Get API Key** → delete the old `AQ...` key → **Create new key** → copy it.
2. This becomes `GEMINI_API_KEY` (server-only).

## 4. Local Run (before Vercel, optional but recommended)

```bash
npx create-next-app@latest . --typescript --tailwind --app --eslint --import-alias "@/*"
# when prompted, allow overwrite? Only if directory empty — else create in ./app
npm install @supabase/supabase-js
npm install -D zod
# create .env.local
```
Create `.env.local` in project root (never commit):
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyYOUR_ANON_KEY
GEMINI_API_KEY=AIzaYourNewKey
```
Then:
```bash
npm run dev
# open http://localhost:3000/login
```

## 5. GitHub + Vercel Deploy (copy-paste)

```bash
git init
git add .
git commit -m "feat: V1 scaffold"
# create empty repo on github.com (no README), then:
git remote add origin https://github.com/YOU/life-os.git
git push -u origin main
```

Vercel:
1. `vercel.com` → **Add New Project** → Import your GitHub repo → Framework **Next.js** (auto).
2. **Environment Variables** → add the same 3 keys from `.env.local` → **Deploy**.
3. Wait build green → visit `https://your-project.vercel.app/login` → login with Supabase user → should land on `/today`.

## 6. Preview Gate (how you see design before logic)

- After Phase 2, file `preview.html` is generated in repo root (Tailwind CDN). Double-click locally to open — no server. Approve colors/spacing before we wire logic. Tell agent: "Move accent lighter" or "More padding on cards" → agent patches `tailwind.config.js` only.

## 7. Updates (daily use)

```bash
git pull          # if agent pushed
npm run dev       # test locally
git add -A && git commit -m "fix: description" && git push   # Vercel auto-deploys
```

## 8. Cost Guardrails (stay $0)

| Service | Free limit | V1 usage (~single user) | Action if near limit |
|---|---|---|---|
| Supabase | 500MB DB | ~5MB | Export JSON from Settings, no action |
| Vercel | 100GB bandwidth | ~1GB | No action |
| Gemini | 1500 req/day | ~50/day | App shows "Couldn't process" banner, never charges — wait 1h or retry. |

Monitor: Supabase Dashboard → Usage; Gemini → AI Studio → Usage.

## 9. Rollback / No-Lock-In

- All data exportable via Settings → `Export JSON` (tasks+habits).
- DB never drops columns (migration only adds) — safe downgrade.
- To move off Vercel, `npm run build` works on Netlify/Cloudflare Pages.

## 10. Troubleshooting (non-technical)

- **Login fails:** Check Supabase → Auth → Users → your email is **Confirmed**.
- **Tasks not saving:** Check Supabase → Table Editor → RLS enabled and policy `auth.uid() = user_id` exists (SQL re-run).
- **AI says "Couldn't process":** Gemini rate limit or key wrong → wait 60s, check Vercel → Settings → Env `GEMINI_API_KEY` matches new key → Redeploy.

*End — after deploy, record URL in docs/status.md and .agent/session-handoff.md.*
