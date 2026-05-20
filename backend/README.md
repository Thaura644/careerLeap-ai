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
