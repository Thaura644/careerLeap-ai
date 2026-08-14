# Career Leap Backend (Spring Boot)

Spring Boot 2.7 backend with **real persistence (JPA), real auth (BCrypt + JWT),
real payments (Paystack, gated), and real AI** (LLM when configured, otherwise a
deterministic engine). No mock data, no demo sessions, no placeholder logic.

## Prerequisites

- Java 17+
- Maven 3.8+

## Run

```bash
cd backend
mvn spring-boot:run
```

Backend default URL: `http://localhost:8080`

## Persistence

Local/dev uses a **file-backed H2 database** (`./data/leapai.mv.db`) so data
survives restarts with zero setup. Production should point at **Postgres**:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/leapai \
SPRING_DATASOURCE_USERNAME=leapai \
SPRING_DATASOURCE_PASSWORD=xxx \
SPRING_DATASOURCE_DRIVER=org.postgresql.Driver \
mvn spring-boot:run
```

Schema is created/updated automatically (`ddl-auto=update`). The content catalog
(resources, events, community groups) is seeded once on first boot. User data —
accounts, goals, conversations, roadmaps, bookmarks, plan grants — is real,
per-user, and persisted.

## Auth

Passwords are **BCrypt-hashed**; logins issue **signed JWTs** (`JWT_SECRET` env,
dev default documented in `.env.example`). Protected endpoints reject missing or
invalid tokens with a 401 — there are no demo accounts.

- `POST /api/auth/signup` — `{fullName, email, password}`
- `POST /api/auth/login` — `{email, password}`
- `GET /api/auth/me` — current user (Bearer token)
- `PUT /api/auth/profile` — save the career profile (onboarding)

## API Endpoints

- `GET /api/health`
- `GET /api/dashboard` — real numbers (goals, completions, roadmap, events)
- `GET /api/resources` — seeded library + per-user bookmark/completion state
- `POST /api/resources/{id}/bookmark` · `POST /api/resources/{id}/complete`
- `GET /api/community` — seeded groups
- `GET /api/goals` · `POST /api/goals` · `PUT /api/goals/{id}` · `DELETE /api/goals/{id}`
- `GET /api/insights` — derived from the user's real profile/roadmap/goals
- `POST /api/insights/roadmap` — generate **and persist** a roadmap
- `POST /api/insights/recommendations` — library scored against the profile
- `POST /api/ai/chat` — career coach (LLM or engine; persisted conversations)
- `GET/POST /api/ai/conversations` · `GET /api/ai/conversations/{id}`
- `GET /api/payments/status` — armed? + plans (public)
- `POST /api/payments/verify` — Paystack verify, grants the plan on the user record
- `GET /api/payments/me` — is the authenticated user Pro?

## Payments (Paystack, gated)

The /upgrade checkout stays **disabled until the human arms it**: set
`PAYMENTS_MODE=live` (default `off`). Keys: `PAYSTACK_PUBLIC_KEY` (browser popup)
and `PAYSTACK_SECRET_KEY` (server-only, falls back to `PAYSTACK_LIVE_SECRET`).
Verified charges grant the plan on the user's **database record** — durable, not
in-memory. Plans/prices are defined once in `PaymentService.status()` (kobo, NGN).

## Real AI (LLM or engine)

| Variable | Default | Purpose |
|---|---|---|
| `LLM_API_KEY` | *(unset)* | Provider key. When unset (or on failure), **real deterministic logic** runs instead: the `RoadmapEngine` for roadmaps and a retrieval responder over the user's own data for chat. Both are marked `"source": "engine"` — never "mock". |
| `LLM_BASE_URL` | `https://api.deepseek.com` | Any OpenAI-compatible provider. |
| `LLM_MODEL` | `deepseek-chat` | Model id on the provider. |
| `LLM_TIMEOUT_SECONDS` | `60` | Request timeout. |

Roadmap generation (persists the result):

```bash
curl -X POST http://localhost:8080/api/insights/roadmap \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"currentRole":"Senior Frontend Developer","targetRole":"Staff Engineer","timeframe":"12 months","focusAreas":["System Design","Leadership"]}'
```

## Example Requests

Signup → token:

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Ada Lovelace","email":"ada@example.com","password":"StrongPass1!"}'
```

Dashboard (auth required):

```bash
curl http://localhost:8080/api/dashboard -H "Authorization: Bearer <token>"
```

## Notes

- CORS is enabled for local Vite dev (`http://localhost:*`) and the production
  origin (override with `LEAP_APP_ORIGIN`).
- No `MockDataService` remains — every endpoint reads/writes real data.
