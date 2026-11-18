# Frontend Authentication Implementation Task

**Project**: Watchtower
**Backend**: Django 6.1 + `django-allauth` Headless + DRF
**Frontend**: React (Vite)
**Backend Base URL (dev)**: `http://localhost:8000`
**Headless API Root**: `http://localhost:8000/_allauth/app/v1`
**Priority**: P0 — blocks all authenticated features

---

## 1. Context

The backend is fully wired and tested. It exposes a **JSON REST API** for all authentication concerns via `django-allauth` headless mode. The frontend is responsible for **all UI and UX** of authentication — rendering forms, storing the session token, navigating between screens, and handling multi-step flows.

**Crucially**, this is **not** a typical JWT auth system. There is no `Authorization: Bearer` header. Instead, allauth headless returns a **session token** in the response body, which the frontend must store and send back as an **`X-Session-Token`** header on every subsequent request. The token is invalidated server-side on logout.

We currently have rudimentary Login and Signup pages. This task is to **review, refactor, and complete** the entire auth layer so it correctly implements the contract described below.

---

## 2. Backend API Reference

### 2.1 Response Envelope

All responses share this shape:

**Success:**
```json
{
  "status": 200,
  "data": { "...": "..." },
  "meta": {
    "is_authenticated": true,
    "session_token": "25oeftedgi073g3bnr6ypkg4fso3f20h"
  }
}
```

**Validation error:**
```json
{
  "status": 400,
  "errors": [
    { "message": "This field is required.", "code": "required", "param": "username" }
  ]
}
```

**Pending flow / unauthenticated:**
```json
{
  "status": 401,
  "data": {
    "flows": [
      { "id": "login" },
      { "id": "signup" },
      { "id": "verify_email", "is_pending": true }
    ]
  },
  "meta": { "is_authenticated": false, "session_token": "..." }
}
```

**IMPORTANT**: A `401` does **not** always mean "wrong credentials." It can mean "authentication is incomplete — there is a pending flow." The frontend must inspect `data.flows` to distinguish.

### 2.2 Endpoints

| Method | Endpoint | Auth required | Purpose |
|---|---|---|---|
| GET | `/config` | No | Get auth config (login methods, signup open, social providers) |
| POST | `/auth/signup` | No | Register |
| POST | `/auth/login` | No | Log in |
| GET | `/auth/session` | Yes | Get current session state |
| DELETE | `/auth/session` | Yes | Log out |
| POST | `/auth/email/verify` | No | Verify email via key |
| POST | `/auth/email/verify/code` | Yes | Verify email via code (future) |
| POST | `/auth/password/request` | No | Request password reset |
| POST | `/auth/password/reset` | No | Reset password with key |
| POST | `/auth/provider/redirect` | No | Begin social login (future) |
| POST | `/auth/provider/token` | No | Social login with token (future) |

### 2.3 Request / Response Contract per Endpoint

#### `GET /_allauth/app/v1/config`
No body. Returns available login methods and enabled providers.
```json
{
  "status": 200,
  "data": {
    "account": {
      "login_methods": ["username"],
      "is_open_for_signup": true,
      "email_verification_by_code_enabled": false,
      "login_by_code_enabled": false,
      "authentication_method": "username"
    },
    "socialaccount": { "providers": [] }
  }
}
```
**Use this on app boot** to decide whether to show signup links, social buttons, etc.

---

#### `POST /_allauth/app/v1/auth/signup`
**Request body:**
```json
{ "username": "abuzar", "email": "abuzar@example.com", "password": "StrongPass123!" }
```
**Success (verification optional):**
```json
{ "status": 200, "data": { "user": {...} }, "meta": { "is_authenticated": true, "session_token": "..." } }
```
**Success (verification mandatory):**
```json
{ "status": 401, "data": { "flows": [{ "id": "verify_email", "is_pending": true }] }, "meta": { "is_authenticated": false, "session_token": "..." } }
```
**Error (400):**
```json
{ "status": 400, "errors": [{ "param": "username", "code": "required", "message": "This field is required." }] }
```

---

#### `POST /_allauth/app/v1/auth/login`
**Request body:**
```json
{ "username": "abuzar", "password": "StrongPass123!" }
```
**Success:** Same envelope as signup success.
**Wrong credentials:** `400` with `errors` array.
**Pending verification:** `401` with `verify_email` in `data.flows`.

---

#### `GET /_allauth/app/v1/auth/session`
Header: `X-Session-Token: <token>`
**Success:** `200` with `data.user` and `meta.is_authenticated: true`.
**Invalid/expired:** `401` with `flows: [{id: "login"}, {id: "signup"}]`.

---

#### `DELETE /_allauth/app/v1/auth/session`
Header: `X-Session-Token: <token>`
**Success:** `200`. Server-side session is destroyed. **The token is now invalid.**

---

#### `POST /_allauth/app/v1/auth/email/verify`
**Request body:**
```json
{ "key": "Mw:1xGNue:QBwJ0ZVjmxK2wY9YegWphUkqH6qvmp0WWF5d-uXf2I4" }
```
**Success:**
```json
{ "status": 200, "data": { "user": {...} }, "meta": { "is_authenticated": true, "session_token": "..." } }
```
**Invalid / expired key:**
```json
{ "status": 400, "errors": [{ "param": "key", "code": "invalid", "message": "Invalid key." }] }
```

---

## 3. Architecture

### 3.1 Token Storage

Store the session token in **`localStorage`** under the key `wt_session_token`.

Wrap access in a helper module (`src/lib/token.ts`):
- `getToken(): string | null`
- `setToken(token: string): void`
- `clearToken(): void`

Never access `localStorage` directly in components. Wrap in `try/catch` to handle private browsing mode or storage quotas gracefully.

> **Production note:** For MVP/dev, `localStorage` is fine. Add a `// TODO: Migrate to httpOnly cookie session strategy before production release` comment so we remember to switch when moving to staging.

---

### 3.2 Axios Client Configuration

Configure a single Axios instance in `src/lib/api.ts`:

- `baseURL`: `import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"` (or empty string if using Vite proxy — see Section 5.12).
- Default headers: `Content-Type: application/json`.
- **Do not** set `withCredentials: true` unless you know why (we are using token auth, not cookies).

Add two interceptors:

1. **Request interceptor:**
   - Read token via `getToken()`.
   - If present, set `config.headers["X-Session-Token"] = token`.
   - If not present, do not send the header.

2. **Response interceptor:**
   - On `401 Unauthorized`:
     - Inspect `error.response.data`.
     - If `data.flows` exists and has any flow where `is_pending === true` (e.g. `verify_email`), **do not clear the token** and do not force-logout. Return rejected promise so the caller can handle it.
     - If `data.flows` contains only unauthenticated baseline flows (`login`, `signup`) or no pending flow, the session is truly dead:
       - Call `clearToken()`.
       - Update auth store state to `unauthenticated`.
       - Redirect to `/login` (use window.location or emit an event the router listens to).

---

### 3.3 Auth State Store

Use Zustand (`src/store/auth.ts`) or React Context. State shape:

```ts
interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  pendingFlows: string[];
  pendingEmail: string | null; // email waiting for verification

  // Actions
  login: (credentials) => Promise<AuthResult>;
  signup: (data) => Promise<AuthResult>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}
```

Result type:
```ts
type AuthResult =
  | { kind: "success"; user: User }
  | { kind: "error"; errors: ApiError[] }
  | { kind: "pending"; flows: string[] };
```

---

### 3.4 Route Guards

Create two route wrappers in `src/components/`:

1. `<ProtectedRoute>`:
   - If `status === "loading"`, render a full-screen loading spinner (not a flash of the login page).
   - If `status === "authenticated"`, render `<Outlet />` (or children).
   - Otherwise, `<Navigate to="/login" replace state={{ from: location }} />`.

2. `<PublicOnlyRoute>` (for `/login` and `/signup`):
   - If `status === "loading"`, render spinner.
   - If `status === "authenticated"`, `<Navigate to="/dashboard" replace />`.
   - Otherwise, render children.

---

## 4. Required Screens and Flows

### 4.1 Flow Diagram

```
           ┌──────────┐
           │  Signup  │
           └────┬─────┘
                │
         verification
         required?
         /        \
       YES         NO
       /            \
      v              v
┌───────────┐   ┌───────────┐
│ Verify    │   │ Dashboard │<──┐
│ Pending   │   └───────────┘   │
└─────┬─────┘                   │
      │ email link clicked      │
      v                         │
┌───────────┐                   │
│ Verify    │                   │
│ Confirm   │───success─────────┤
└─────┬─────┘                   │
      │ error                   │
      v                         │
┌───────────┐   ┌───────────┐   │
│   Login   │──>│ Authenti- │───┘
└───────────┘   │  cated    │
                └───────────┘
```

---

## 5. Detailed Implementation Checklist

### 5.1 Token Helper (`src/lib/token.ts`)
- [ ] Implement `getToken()`, `setToken()`, `clearToken()`.
- [ ] Add `try/catch` around all `localStorage` access.
- [ ] Add the production TODO comment from Section 3.1.

### 5.2 Axios Client (`src/lib/api.ts`)
- [ ] Export configured Axios instance.
- [ ] Attach request interceptor for `X-Session-Token`.
- [ ] Attach response interceptor for 401 handling with pending-flow check.

### 5.3 Auth Store (`src/store/auth.ts`)
- [ ] Define state interface and types.
- [ ] Implement `login()` action.
- [ ] Implement `signup()` action.
- [ ] Implement `logout()` action.
- [ ] Implement `restoreSession()` action.

### 5.4 Session Restoration on App Boot (`src/App.tsx`)
- [ ] On mount, if `getToken()` returns a token, call `restoreSession()`.
- [ ] If `GET /auth/session` returns 200, set `user` and `status = "authenticated"`.
- [ ] If `GET /auth/session` returns 401, call `clearToken()` and set `status = "unauthenticated"`.
- [ ] While `status === "loading"`, do not render routes (prevent redirect loop).

### 5.5 Login Page (`src/pages/Login.tsx`)
- [ ] Form with `username` and `password` fields.
- [ ] Loading state on submit button (disable while in flight).
- [ ] Display field errors from `errors[]` under the corresponding input.
- [ ] Display non-field errors at the top of the form.
- [ ] If response is `pending` with `verify_email`, navigate to `/verify-email/pending`.
- [ ] If response is `success`, navigate to `location.state?.from || "/dashboard"`.
- [ ] Link to `/signup`.

### 5.6 Signup Page (`src/pages/Signup.tsx`)
- [ ] Form with `username`, `email`, `password`.
- [ ] Submit button loading state.
- [ ] Field-level and non-field error display.
- [ ] If response has `flows` containing `verify_email`, navigate to `/verify-email/pending` with email state.
- [ ] If response has `meta.is_authenticated: true`, navigate to `/dashboard`.
- [ ] Link to `/login`.

### 5.7 Email Verification Route (`src/pages/VerifyEmail.tsx`)
- [ ] Mounted at `/account/verify-email/:key`.
- [ ] On mount, grab `:key` from params and `POST /auth/email/verify` with `{ key }`.
- [ ] States to handle:
  - **Loading:** "Verifying your email..."
  - **Success:** "Email verified! Redirecting..." (auto-navigate to `/dashboard` if authenticated, else `/login`).
  - **Error (invalid/expired key):** "This verification link is invalid or has expired." with a link to login or request a new one.

### 5.8 Route Configuration (`src/App.tsx`)
- [ ] Wrap private routes (`/dashboard`, `/cameras`, `/incidents`, `/alerts`, `/settings`) with `<ProtectedRoute>`.
- [ ] Wrap public auth routes (`/login`, `/signup`) with `<PublicOnlyRoute>`.
- [ ] Add `/verify-email/pending` and `/account/verify-email/:key` routes.

### 5.9 Logout Flow
- [ ] Call `DELETE /auth/session`.
- [ ] Call `clearToken()`.
- [ ] Set `status = "unauthenticated"`, `user = null`.
- [ ] Ensure token is cleared even if network fails.
- [ ] Navigate to `/login`.

### 5.10 Pending Verification Screen (`src/pages/VerifyEmailPending.tsx`)
- [ ] Route `/verify-email/pending`.
- [ ] Displays email address, instructions.
- [ ] Resend email placeholder button.
- [ ] If accessed without pending flow, redirect to `/login`.

### 5.11 Error Rendering (`src/components/FormErrors.tsx`)
- [ ] Renders field-level and banner errors.
- [ ] Accessibility: `aria-invalid`.

### 5.12 Vite Proxy
- [ ] Proxy `/_allauth` and `/api` to `http://localhost:8000`.

---

## 6. Test Plan

### Unit tests (Vitest + React Testing Library)
- Token helper: set/get/clear, handles localStorage throwing.
- Auth store: state transitions for login success, error, and pending flow.
- Form error rendering: param-mapped and banner errors.

---

## 7. Acceptance Criteria

- [ ] No `X-Session-Token` header is sent when no token exists.
- [ ] Every authenticated request carries `X-Session-Token`.
- [ ] No request sends a `Cookie` or CSRF token.
- [ ] Refreshing the page while logged in preserves the session (no flash of login page).
- [ ] `401` responses with pending flows do **not** trigger auto-logout.
- [ ] `401` responses without pending flows **do** trigger logout.
- [ ] All form errors from `errors[]` are rendered against the correct field.
- [ ] Login button is disabled during in-flight requests.
- [ ] Logout clears token even if the network call fails.
- [ ] The verify-email route renders success, expired, and malformed-key states.
- [ ] No console errors or unhandled promise rejections during any flow.
- [ ] Axios instance is the **only** way the app talks to the backend (no stray `fetch` calls).

---

## 8. Out of Scope (leave seams)

- Social login UI.
- MFA UI.
- Password reset UI.
- Changing email / managing connected accounts.
- Production token storage migration (httpOnly cookies).
- Refresh token rotation.

---

## 9. Resources

- Backend OpenAPI spec: `http://localhost:8000/_allauth/openapi.html`
- django-allauth headless docs: `https://docs.allauth.org/en/latest/headless/`

---

## 10. Definition of Done

- All Phase 1 and Phase 2 checkboxes complete.
- All acceptance criteria pass.
