# WorkForce AI Backend

## Requirements
- Node.js 20 or newer
- MongoDB Atlas or a MongoDB replica-set deployment (employee creation uses a transaction)

## Setup
1. Run `npm install`.
2. Copy `.env.example` to `.env` and fill in `MONGOOSE_URI` and a random `JWT_SECRET` (at least 32 characters in production).
3. Set `FRONTEND_URL` to the exact frontend origin.
4. Run `npm run seed` only when you intentionally want to add/update the demo records.
5. Run `npm run dev` for development or `npm start` for production.

The API waits for MongoDB before accepting HTTP requests. `GET /api/health` reports the API and database connection state.

## Security notes
- Authentication cookies are HTTP-only. Use HTTPS in production (`NODE_ENV=production`). If the frontend and backend are on different sites, set `COOKIE_SAME_SITE=none`; the cookie will then require HTTPS.
- Public self-registration is disabled. Administrators create employee accounts so every employee user has a corresponding Employee profile.
- Every protected request reloads the user's current role and account status from MongoDB. Suspending an account therefore revokes access even if its JWT has not expired.
- Login requests are rate-limited per client IP in this Node process. For multiple backend instances, replace the in-memory limiter with a shared store. When running behind a reverse proxy, set `TRUST_PROXY=true` only if the deployment has exactly one trusted proxy in front of this service.
- `FRONTEND_URL` or `FRONTEND_URLS` may contain a comma-separated list of allowed origins in local or multi-origin deployments. Keep this list restricted to trusted frontend origins.

## Tests
Run `npm test`. The automated suite covers API smoke checks and the in-memory login rate limiter. Run the workflow checklist in `TESTING.md` against a dedicated test database before deployment.

## New endpoints
- `GET /api/notifications` — current user notifications, pagination, and unread count.
- `PATCH /api/notifications/:id/read` — mark one owned notification as read.
- `PATCH /api/notifications/read-all` — mark all notifications for the current user as read.
- `GET /api/tasks/:id/activities` — task history for admins or the employee currently assigned to the task.
