import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env if present
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const INTERVAL_MINUTES = parseInt(process.env.KEEPALIVE_INTERVAL_MINUTES || '15', 10);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('⚠️ [KeepAlive] Warning: SUPABASE_URL or SUPABASE_ANON_KEY is not defined in environment variables.');
}

const supabase = (SUPABASE_URL && SUPABASE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;

/**
 * Execute a single ping to the Supabase database
 */
export async function pingSupabase() {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();

  if (!supabase) {
    console.log(`[${timestamp}] ❌ Keep-Alive Ping skipped: Supabase credentials missing.`);
    return { success: false, error: 'Credentials missing', latencyMs: 0, timestamp };
  }

  try {
    // Attempt a lightweight database query on the users table
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (error && error.code !== 'PGRST116') {
      console.log(`[${timestamp}] ⚠️ Keep-Alive Ping responded with query warning (${latencyMs}ms): ${error.message}`);
      return { success: true, warning: error.message, latencyMs, timestamp };
    }

    console.log(`[${timestamp}] ✅ Keep-Alive Ping successful! Supabase DB is active (Latency: ${latencyMs}ms).`);
    return { success: true, latencyMs, timestamp };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    console.error(`[${timestamp}] ❌ Keep-Alive Ping failed (${latencyMs}ms):`, err.message);
    return { success: false, error: err.message, latencyMs, timestamp };
  }
}

// If executed directly (e.g. `node keepalive.js` or `npm run keepalive`)
const isDirectExecution = process.argv[1] && (process.argv[1].endsWith('keepalive.js') || process.argv[1].includes('keepalive'));

if (isDirectExecution) {
  console.log(`🚀 [KeepAlive] Starting automated Supabase keep-alive worker...`);
  console.log(`⏱ [KeepAlive] Configured interval: Every ${INTERVAL_MINUTES} minute(s).`);

  // Run immediate initial ping
  pingSupabase();

  // Schedule recurring ping every X minutes
  const intervalMs = INTERVAL_MINUTES * 60 * 1000;
  setInterval(() => {
    pingSupabase();
  }, intervalMs);
}
