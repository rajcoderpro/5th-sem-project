# Backend verification checklist

Use a dedicated test database and test accounts. Do not run destructive tests on production data.

## Automated tests
- `npm test` — API smoke tests and rate limiter unit tests.

## Authentication and authorization
- Login with valid admin and employee credentials.
- Login with an incorrect password; expect `401`.
- Suspend a user while the user still has a valid JWT; protected requests must return `401`.
- Call an admin endpoint with an employee cookie; expect `403`.
- Call a protected endpoint without a cookie; expect `401`.
- Call `POST /api/auth/register`; expect `403` because employee accounts must be created with an Employee profile.
- Exceed the login request limit from one IP; expect `429` and a `Retry-After` header.

## Notifications
- Assign a task; its new assignee should receive a notification.
- Submit a leave request; active admins should receive a notification.
- Approve or reject a leave request; the employee should receive a notification.
- Submit a task for review; active admins should receive a notification.
- A user must not be able to read or mark another user's notification as read.

## Task activity
- Creating a task records `CREATED`.
- Assigning/reassigning a task records `ASSIGNED` / `REASSIGNED`.
- Updating details and changing status records the corresponding event.
- An employee can read history only for a task assigned to them.
- An admin can read any task's history.

## Existing workflows
Retest employee creation, departments, task creation/assignment/status, leave application/review/cancellation, attendance check-in/check-out, manual absent marking, employee deactivation/reactivation, and both dashboards.
