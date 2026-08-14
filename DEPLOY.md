# Deploy runbook — Leap.ai backend (Render) + frontend wiring (Vercel)

This repo's backend is a Spring Boot app that deploys on Render's free tier as a
Docker service. The frontend (this repo's root) is already live on Vercel and
auto-deploys on push to `main` — it just needs one env var pointed at the
backend once the backend has a URL.

No secrets are in this file. All values come from your local, gitignored `.env`
(sandbox at `/home/projects/makemoney/.env`) or from the provider dashboards.

---

## 1. Create the backend service on Render (manual — no card needed)

### Option A — Blueprint (easiest, uses the committed `render.yaml`)

1. Go to https://dashboard.render.com
2. **New + → Blueprint**
3. Connect the **Thaura644/careerLeap-ai** repo
4. It will read `render.yaml` and propose the `leap-ai-backend` service
5. Render asks for the **sync: false** env vars — paste each value:

| Env var | Value (from your `.env`) |
|---|---|
| `SPRING_DATASOURCE_URL` | `SPRING_DATASOURCE_URL` from `.env` (the `jdbc:postgresql://aws-0-eu-west-2.pooler.supabase.com:5432/postgres` one) |
| `SPRING_DATASOURCE_USERNAME` | `SPRING_DATASOURCE_USERNAME` from `.env` (`postgres.bihgwrcjblwaxbyzedpo`) |
| `SPRING_DATASOURCE_PASSWORD` | `SPRING_DATASOURCE_PASSWORD` from `.env` |
| `JWT_SECRET` | `JWT_SECRET` from `.env` |
| `LEAP_APP_ORIGIN` | `https://career-leap-ai.vercel.app` (already the default; set explicitly to be safe) |
| `LLM_API_KEY` | `LLM_API_KEY` from `.env` (DeepSeek key) |
| `PAYSTACK_PUBLIC_KEY` | `PAYSTACK_PUBLIC_KEY` from `.env` |
| `PAYSTACK_LIVE_SECRET` | `PAYSTACK_LIVE_SECRET` from `.env` |

`SPRING_DATASOURCE_DRIVER` and `PAYMENTS_MODE` are already set in
`render.yaml` (Postgres driver; payments off — checkout stays inert until you
explicitly arm it).

6. **Apply** — Render builds the Docker image and deploys. Free tier: expect a
   few minutes; the service sleeps after inactivity and wakes on request.

### Option B — Manual Web Service

1. **New + → Web Service** → connect **Thaura644/careerLeap-ai**
2. Root directory: `backend`
3. Runtime: **Docker** (it picks up `backend/Dockerfile` automatically)
4. Instance type: **Free**
5. Set the same env vars as Option A, then **Create Web Service**

---

## 2. Point the frontend at the backend

Once the Render service is up you'll get a URL like
`https://leap-ai-backend.onrender.com`.

1. In the Vercel project **career-leap-ai** → **Settings → Environment Variables**,
   add:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://leap-ai-backend.onrender.com/api`
   - Targets: Production, Preview, Development
2. Redeploy (Vercel auto-redeploys on env change, or push an empty commit).

The frontend reads `VITE_API_BASE_URL` at build time (default
`http://localhost:8080/api` for local dev). The backend's CORS already allows
`https://career-leap-ai.vercel.app` by default.

## 3. Verify end-to-end

- Backend health: `https://leap-ai-backend.onrender.com/api/health` → `{"status":"ok"}`
- On the live site: sign up → generate a roadmap → check it persists (Postgres).
  The schema is created automatically by Hibernate on first boot, and the
  content catalog seeds itself.

## 4. Optional, later (revenue)

- Fund the DeepSeek account (platform.deepseek.com) so roadmaps come from the
  real LLM instead of the engine (`source: llm` vs `source: engine`).
- When you're ready to take money: set `PAYMENTS_MODE=live` in Render's env
  (plus real Paystack keys) and make one tiny test payment yourself to confirm
  the webhook flips Pro. The announcement draft in
  `product/launch-announcement.md` (company repo) becomes sendable after that.
