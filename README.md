# Local EHR Honeypot

A local-only medical EHR demo built with Next.js 14, TypeScript, Tailwind CSS, Clerk-ready configuration, PostgreSQL in Docker, and ipapi.co geolocation for honeypot telemetry.

## What It Includes

- Real EHR dashboard at `/dashboard`
- Honeypot dashboard at `/fake-ehr`
- Admin security console at `/admin/security`
- Login flow at `/login`
- Patient APIs at `/api/patients`
- PostgreSQL tables:
  - `users`
  - `patients`
  - `login_attempts`
  - `security_logs`
- 10 fake patient records inserted on first database initialization
- Silent redirect to `/fake-ehr` for suspicious login behavior
- Geolocation lookup through `ipapi.co` inside `/api/log-attempt`

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start PostgreSQL:

   ```bash
   docker-compose up
   ```

3. In another terminal, start Next.js:

   ```bash
   npm run dev
   ```

4. Open:

   ```text
   http://localhost:3000
   ```

## Environment

All variables are in `.env.local`.

```env
DATABASE_URL=postgres://ehr_user:ehr_password@localhost:5432/ehr_local
EHR_SESSION_SECRET=change-this-local-secret
EHR_DEMO_PASSWORD=LocalOnly!234
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_replace_me
CLERK_SECRET_KEY=sk_test_replace_me
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Replace the Clerk keys with local/development Clerk keys when you connect this to a Clerk application. The requested honeypot credential workflow is handled by `/api/login`; the local demo keeps authorization in the requested `users` table.

## Demo Users

The database initializer creates these users:

```text
admin@stcatherine.local
doctor@stcatherine.local
nurse@stcatherine.local
locked@stcatherine.local
```

Use this password for authorized users:

```text
LocalOnly!234
```

Only `admin@stcatherine.local` can view `/admin/security`.

## Security Behavior

`middleware.ts` checks `/api/login` for:

- SQL injection patterns
- More than 5 login requests per minute from one IP
- Automated or unusual user agents
- Malformed headers or body
- Hidden honeypot form fields

Suspicious requests are silently redirected to `/fake-ehr` and logged through `/api/log-attempt`.

`/api/login` handles credential attempts:

- Correct authorized user and password: redirects to `/dashboard`, resets the IP attempt counter
- Wrong attempt 1 or 2: returns to `/login` with `Incorrect credentials`
- Wrong attempt 3: silently redirects to `/fake-ehr` and logs to `security_logs`
- Counters reset automatically after 24 hours

## Notes

- This is intentionally local-only and does not deploy cloud infrastructure.
- `ipapi.co` will return local placeholders for `127.0.0.1` and `::1`.
- If you change `db/init.sql` after the first container start, remove the Docker volume and start again:

  ```bash
  docker-compose down -v
  docker-compose up
  ```
