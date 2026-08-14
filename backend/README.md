# Career Leap Backend (Spring Boot)

This backend uses a mature Spring Boot stack (2.7.x) with simple in-memory responses so it is easy to extend with AI coding tools.

## Prerequisites

- Java 17+
- Maven 3.8+

## Run

```bash
cd backend
mvn spring-boot:run
```

Backend default URL: `http://localhost:8080`

## API Endpoints

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/dashboard`
- `GET /api/resources`
- `GET /api/community`
- `GET /api/insights`
- `POST /api/ai/chat` — chat with the Leap.ai career coach (real LLM when configured)
- `POST /api/insights/roadmap` — generate a personalized career roadmap from a profile JSON

## Real AI (LLM)

The AI endpoints call a real LLM (OpenAI-compatible chat completions) when configured.
Environment variables (read automatically by Spring):

| Variable | Default | Purpose |
|---|---|---|
| `LLM_API_KEY` | *(unset)* | Provider API key. **When unset, responses fall back to mock data and are marked `"source": "mock"`** so mock output is never presented as real AI. |
| `LLM_BASE_URL` | `https://api.deepseek.com` | Any OpenAI-compatible provider (OpenRouter, OpenAI, Groq, …). |
| `LLM_MODEL` | `deepseek-chat` | Model id on the provider. |
| `LLM_TIMEOUT_SECONDS` | `60` | Request timeout. |

Example (DeepSeek):

```bash
LLM_API_KEY=sk-... mvn spring-boot:run
```

Roadmap generation request:

```bash
curl -X POST http://localhost:8080/api/insights/roadmap \
  -H "Content-Type: application/json" \
  -d '{"currentRole":"Senior Frontend Developer","targetRole":"Staff Engineer","timeframeMonths":12,"focusAreas":["System Design","Leadership"]}'
```

## Example Requests

Login:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Dashboard:

```bash
curl http://localhost:8080/api/dashboard
```

## Notes

- CORS is enabled for `http://localhost:5173` to support the Vite frontend.
- Data is mocked in `MockDataService`; replace with database/repository logic when ready.
