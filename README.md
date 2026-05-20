# Leap.ai - Career Acceleration Platform

Leap.ai is a web application that helps professionals accelerate career growth through AI-guided planning, skills development, and community support. The platform combines personalized recommendations, structured learning workflows, and mentorship-focused experiences in a modern React application.

## Overview

Leap.ai provides a unified experience for:
- AI-assisted career roadmap planning
- Skill gap discovery and development tracking
- Curated learning resources and events
- Community and mentorship engagement
- Dashboard insights for progress visibility

## Core Product Areas

- Marketing site and onboarding journey
- Authentication and account flows
- Personalized dashboard with progress modules
- AI insights and recommendations
- Resources hub and event discovery
- Community and collaboration features
- Settings and account management
- Pro/upgrade experiences

## Technology Stack

- React 18 + TypeScript
- Vite 5 (build and dev tooling)
- Tailwind CSS + shadcn/ui (design system)
- React Router (client-side routing)
- TanStack Query (server state management)
- PWA support via service worker

## Project Structure

```text
src/
  components/        Reusable UI and feature components
  pages/             Route-level application pages
  context/           App-wide state providers
  hooks/             Shared custom hooks
  lib/               Utilities and helper modules
  styles/            Global animation and style assets
public/              Static assets, PWA manifest, service worker
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Application runs locally with Vite hot reload (default: `http://localhost:5173`).

## Backend (Spring Boot)

A backend API is scaffolded in `backend/` using Spring Boot 2.7.x.

```bash
cd backend
mvn spring-boot:run
```

Backend default URL: `http://localhost:8080`

Key endpoints:
- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/dashboard`
- `GET /api/resources`
- `GET /api/community`
- `GET /api/insights`

## Available Scripts

- `npm run dev` - start local development server
- `npm run build` - create production build
- `npm run build:dev` - create development-mode build
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint checks

## Routing Summary

Key routes currently defined in the app:
- `/` (landing page)
- `/login`, `/signup`
- `/onboarding`
- `/dashboard`
- `/resources`
- `/community`
- `/insights`
- `/settings`
- `/upgrade`

## Environment and Configuration

This repository currently runs without required external environment variables for baseline UI flows. If API integrations are introduced, document required variables in a `.env.example` file and keep secrets out of source control.

## Build and Deployment

1. Run lint checks:
   ```bash
   npm run lint
   ```
2. Build for production:
   ```bash
   npm run build
   ```
3. Deploy the generated `dist/` directory to your hosting platform.

## Engineering Standards

- Keep TypeScript strictness and linting clean
- Prefer reusable components under `src/components`
- Co-locate route-specific logic within `src/pages`
- Maintain accessibility and responsive behavior for all new UI

## Contribution Workflow

1. Create a feature branch
2. Implement changes with focused commits
3. Run lint and build checks locally
4. Open a pull request with scope, rationale, and testing notes

## License

No license file is currently included in this repository. Add a project license before external distribution.
