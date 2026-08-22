# 🚀 Supabase Keep-Alive & Health Check Setup Guide

This project includes a complete **health check and automated keep-alive system** designed to keep your Supabase database, Edge Functions, and backend API active 24/7 so that:
1. **Supabase Free Tier NEVER pauses / sleeps** after 7 days of inactivity.
2. **Backend / Edge Functions stay warm** without cold-start delays.

---

## 📋 Available Keep-Alive Methods

| Method | Where It Runs | How It Works | Setup Effort |
| :--- | :--- | :--- | :--- |
| **1. GitHub Actions (Recommended 24/7)** | GitHub Cloud (Free) | Runs every 20 mins via cron to ping Supabase REST API & Edge Functions | 1 minute (Add Secrets) |
| **2. Supabase Edge Function** | Supabase Deno Cloud | Dedicated `/functions/v1/health-check` API endpoint | Deploy via CLI |
| **3. Free External Cron / Uptime Monitor** | UptimeRobot / Cron-job.org | Pings your Supabase URL or Edge Function every 15-30 mins | 2 minutes |
| **4. Express Node.js Server** | Local / Backend Host | Built-in Express server with `/api/health` and background interval | Automatic on `npm run server` |
| **5. React Client Keep-Alive** | User Browser Tab | Background ping every 15 mins while app is open in browser | Pre-integrated in `App.jsx` |
| **6. Supabase SQL RPC** | Inside PostgreSQL | `public.health_check()` function callable via REST API | Run in SQL Editor |

---

## 🛠️ Setup Instructions

### Option 1: GitHub Actions 24/7 Automated Cron (Zero-Cost & Runs Always)
A workflow has been added at [`.github/workflows/supabase-keepalive.yml`](.github/workflows/supabase-keepalive.yml). It automatically pings your Supabase instance every 20 minutes.

1. Go to your GitHub repository on GitHub.com.
2. Go to **Settings** → **Secrets and variables** → **Actions**.
3. Click **New repository secret** and add:
   - `SUPABASE_URL`: Your Supabase project URL (e.g. `https://xyzproject.supabase.co`)
   - `SUPABASE_ANON_KEY`: Your Supabase project `anon` public key
4. *(Optional)* Go to the **Actions** tab in GitHub, select **Supabase Keep-Alive & Health Check**, and click **Run workflow** to test it immediately.

---

### Option 2: Deploy Supabase Edge Function (`health-check`)
An edge function is ready in [`supabase/functions/health-check/index.ts`](supabase/functions/health-check/index.ts).

To deploy it with the Supabase CLI:
```bash
# Login to Supabase CLI if not already done
npx supabase login

# Link your project
npx supabase link --project-ref your-project-ref

# Deploy the health check function
npx supabase functions deploy health-check --no-verify-jwt
```

Once deployed, your health check endpoint will be available at:
```http
GET https://<your-project-ref>.supabase.co/functions/v1/health-check
```
Sample JSON response:
```json
{
  "status": "healthy",
  "message": "Supabase instance is active and keep-alive ping succeeded.",
  "timestamp": "2026-08-22T17:15:00.000Z",
  "database": "connected",
  "latency": {
    "databaseMs": 42,
    "totalMs": 55
  }
}
```

---

### Option 3: Free External Uptime Pingers (UptimeRobot / Cron-Job.org)
You can use any free webhook / uptime pinger to hit your Supabase API every 15–30 minutes:

#### Method A: Using [cron-job.org](https://cron-job.org) (100% Free):
1. Sign up on [cron-job.org](https://cron-job.org).
2. Create a new cron job:
   - **URL**: `https://<your-project-ref>.supabase.co/rest/v1/users?select=id&limit=1` (or your Edge Function URL)
   - **Schedule**: Every 15 or 30 minutes.
   - **Request Headers**:
     - `apikey`: `<YOUR_SUPABASE_ANON_KEY>`
     - `Authorization`: `Bearer <YOUR_SUPABASE_ANON_KEY>`

#### Method B: Using [UptimeRobot](https://uptimerobot.com) (100% Free):
1. Create an HTTP(s) Monitor.
2. Enter your deployed Supabase URL or Edge Function URL.
3. Set Monitoring Interval to **5 minutes** or **15 minutes**.

---

### Option 4: Supabase SQL RPC Health Function
You can run the SQL script in [`supabase/health_check.sql`](supabase/health_check.sql) in your Supabase SQL Editor:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** -> **New query**.
3. Paste the contents of [`supabase/health_check.sql`](supabase/health_check.sql) and click **Run**.
4. You can now execute a direct health check via REST:
```bash
curl -X POST https://<your-project-ref>.supabase.co/rest/v1/rpc/health_check \
  -H "apikey: <YOUR_SUPABASE_ANON_KEY>" \
  -H "Authorization: Bearer <YOUR_SUPABASE_ANON_KEY>"
```

---

### Option 5: Backend Server Keep-Alive Service (`server/`)
If running the backend server locally or deployed to Render/Fly.io/Koyeb:

1. Create a `server/.env` file:
```env
PORT=5000
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-supabase-anon-key>
KEEPALIVE_INTERVAL_MINUTES=15
```

2. Start the server:
```bash
# Run server
npm run server

# Or run both client + server concurrently
npm run dev

# Or run standalone keepalive script
npm run keepalive --workspace=server
```

Endpoints provided:
- `http://localhost:5000/api/health` - Checks database health and latency.
- `http://localhost:5000/api/keepalive` - Manually triggers keepalive ping.

---

### Option 6: Client-Side React Keep-Alive
The client application automatically runs a light background ping every 15 minutes using [`useKeepAlive(15)`](client/src/hooks/useKeepAlive.js) in [`client/src/App.jsx`](client/src/App.jsx).

You can also manually check health anywhere in your React code:
```javascript
import { checkSupabaseHealth } from '@/services/healthCheckService';

const result = await checkSupabaseHealth();
console.log('Health status:', result.status, 'Latency:', result.latencyMs, 'ms');
```
