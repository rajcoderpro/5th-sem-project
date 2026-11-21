# WorkForce AI

WorkForce AI is a role-based workforce management application with Admin and Employee workspaces. It includes employee and department management, task management, attendance, leave requests/reviews, employee profile, admin analytics, notifications, and task activity history. The AI recommendation engine is intentionally not enabled yet; the current release is the reliable pre-AI foundation.

## Stack

- Frontend: React, Vite, React Router, Tailwind CSS, GSAP, Framer Motion, Lucide React
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: bcryptjs, JWT in an HTTP-only cookie

## Local setup

### Backend

1. Open `backend`.
2. Run `npm install`.
3. Copy `backend/.env.example` to `backend/.env` and configure `MONGOOSE_URI` and `JWT_SECRET`.
4. Run `npm run seed` only when you want to insert/update the demo dataset.
5. Run `npm run dev`.

The API listens on port `3000` by default and exposes `GET /api/health`.

### Frontend

1. Open `frontend` in another terminal.
2. Run `npm install`.
3. Copy `frontend/.env.example` to `frontend/.env` if the backend is not running at the default URL.
4. Run `npm run dev`.

The Vite development server normally runs at `http://localhost:5173`.

## Roles and account creation

- `ADMIN` users can manage employees, departments, tasks, attendance, and leave requests.
- `EMPLOYEE` users can view assigned tasks, update permitted task statuses, mark attendance, and submit/cancel pending leave requests.
- Public self-registration is disabled. Admins create employee accounts through the employee-management workflow so the User and Employee profile are created together.

## Added reliability and audit features

- MongoDB connection is awaited before the HTTP server starts.
- Protected API requests validate the current account status and role against MongoDB, so suspended users lose access without waiting for JWT expiry.
- Login attempts are rate-limited per IP in the running Node process.
- Security response headers, JSON body size limits, CORS origin allow-listing, centralized API 404/error handling, and graceful shutdown are enabled.
- Notifications are generated for new assignments, employee task review submissions, and leave request/review events. Both roles have a notification inbox and unread counter.
- Task activity events record task creation, assignment/reassignment, detail changes, and status changes, and are visible in admin and employee task views.

The Admin workspace includes analytics, and the Employee workspace includes a read-only profile page. See `backend/README.md` and `backend/TESTING.md` for backend configuration and verification instructions.

## Important deployment notes

- Use HTTPS and a strong, random `JWT_SECRET` of at least 32 characters in production. If the frontend and backend are hosted on different sites, configure `COOKIE_SAME_SITE=none` (HTTPS is then required) and keep the CORS allow-list restricted to your frontend origin.
- Set `NODE_ENV=production` and set `FRONTEND_URL` to the exact deployed frontend origin. For multiple origins, set comma-separated `FRONTEND_URLS`.
- Set `TRUST_PROXY=true` only when exactly one trusted reverse proxy sits in front of the backend.
- The built-in login rate limiter stores counters in process memory. For multi-instance production deployments, replace it with a shared store such as Redis.
- Notifications and task activity are best-effort side effects. A notification/log write failure is recorded on the server and will not roll back a successful business action.
- Use a dedicated test database for verification. Never run demo seeding against production data.
