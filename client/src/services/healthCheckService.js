import { supabase } from '../config/supabaseClient';

let keepAliveIntervalId = null;
let lastPingResult = null;

/**
 * Perform an instant health check on the Supabase database
 * @returns {Promise<{status: string, latencyMs: number, timestamp: string, details?: any, error?: string}>}
 */
export async function checkSupabaseHealth() {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();

  try {
    // 1. Try running RPC health check first if created in DB
    const { data: rpcData, error: rpcError } = await supabase.rpc('health_check');

    if (!rpcError && rpcData) {
      const latencyMs = Math.round(performance.now() - startTime);
      const result = {
        status: 'healthy',
        database: 'connected',
        latencyMs,
        timestamp,
        details: rpcData,
      };
      lastPingResult = result;
      return result;
    }

    // 2. Fallback: Query a single record to ensure PostgreSQL query processor is active
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    const latencyMs = Math.round(performance.now() - startTime);

    if (error && error.code !== 'PGRST116') {
      const result = {
        status: 'degraded',
        database: 'reachable_with_warning',
        latencyMs,
        timestamp,
        error: error.message,
      };
      lastPingResult = result;
      return result;
    }

    const result = {
      status: 'healthy',
      database: 'connected',
      latencyMs,
      timestamp,
      details: { query: 'users limit 1', rowCount: data ? data.length : 0 },
    };
    lastPingResult = result;
    return result;
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    const result = {
      status: 'unreachable',
      database: 'disconnected',
      latencyMs,
      timestamp,
      error: err.message || 'Unknown network error',
    };
    lastPingResult = result;
    return result;
  }
}

/**
 * Ping the Supabase Edge Function `health-check` if deployed
 * @returns {Promise<any>}
 */
export async function pingEdgeFunction() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { status: 'error', error: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY' };
  }

  const startTime = performance.now();
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/health-check`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });

    const latencyMs = Math.round(performance.now() - startTime);
    const data = await res.json();
    return {
      status: res.ok ? 'healthy' : 'error',
      httpStatus: res.status,
      latencyMs,
      data,
    };
  } catch (err) {
    return {
      status: 'unreachable',
      latencyMs: Math.round(performance.now() - startTime),
      error: err.message,
    };
  }
}

/**
 * Start an automatic periodic keep-alive background ping
 * @param {number} intervalMinutes - Interval in minutes (default: 15)
 * @param {Function} [onPingCallback] - Optional callback triggered on each ping
 */
export function startKeepAlive(intervalMinutes = 15, onPingCallback = null) {
  if (keepAliveIntervalId) {
    clearInterval(keepAliveIntervalId);
  }

  const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;
  console.log(`[KeepAlive] Service started: Pinging Supabase every ${intervalMinutes} minute(s).`);

  // Immediate initial check
  checkSupabaseHealth().then((result) => {
    if (onPingCallback) onPingCallback(result);
  });

  // Scheduled check
  keepAliveIntervalId = setInterval(async () => {
    console.log(`[KeepAlive] Scheduled keep-alive ping triggering (${new Date().toLocaleTimeString()})...`);
    const result = await checkSupabaseHealth();
    if (onPingCallback) onPingCallback(result);
  }, intervalMs);

  return keepAliveIntervalId;
}

/**
 * Stop the periodic keep-alive background ping
 */
export function stopKeepAlive() {
  if (keepAliveIntervalId) {
    clearInterval(keepAliveIntervalId);
    keepAliveIntervalId = null;
    console.log('[KeepAlive] Service stopped.');
  }
}

/**
 * Get the last recorded ping result
 */
export function getLastPingResult() {
  return lastPingResult;
}

export default {
  checkSupabaseHealth,
  pingEdgeFunction,
  startKeepAlive,
  stopKeepAlive,
  getLastPingResult,
};
