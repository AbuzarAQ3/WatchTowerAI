# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


---

## Frontend Setup & Integration Guide

### Prerequisites
- Node.js 18+
- npm (or pnpm)

### Installation
```bash
npm install
```

### Environment Configuration (.env / .env.local)
Create a `.env` or `.env.local` file inside the `frontend/` directory with the following variables:

```env
# Base URL pointing to Django REST Framework and django-allauth headless endpoints
VITE_API_BASE_URL=http://localhost:8000

# Mock Mode Configuration:
# 'true'  = Use isolated in-memory mock data with simulated latencies (recommended for UI/dev prototyping)
# 'false' = Connect to real live backend API with X-Session-Token session authentication
VITE_USE_MOCK=false
```

### Development & Build Commands
- `npm run dev`: Starts local Vite development server with Hot Module Replacement (HMR).
- `npm test`: Runs Vitest test suites.
- `npm test -- --run`: Runs all test suites once without watch mode.
- `npm run build`: Generates optimized production build in `dist/`.
- `npm run preview`: Previews the production build locally.

### Switching Between Mock Mode and Real API Mode
1. **Mock Mode (`VITE_USE_MOCK=true`)**:
   - Useful for standalone UI design, prototyping, and component development without running a Django backend.
   - Provides realistic simulated data for cameras, incidents, alerts, and system telemetry metrics.
2. **Real API Mode (`VITE_USE_MOCK=false`)**:
   - Connects directly to the Django backend specified in `VITE_API_BASE_URL`.
   - All `/api/` surveillance endpoints (cameras, incidents, alerts, stats) and `/_allauth/app/v1/` headless auth routes communicate with the live server.
   - Axios request interceptors automatically append the `X-Session-Token` header to DRF requests when an operator session is active.
   - Axios response interceptors handle 401 unauthenticated session expiry, clearing the token and redirecting to `/login` when no pending flows exist.
   - List endpoints follow DRF pagination (`next` link) up to a safety cap of 20 pages while retaining security token scoping.
