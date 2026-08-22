import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pingSupabase } from './keepalive.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const INTERVAL_MINUTES = parseInt(process.env.KEEPALIVE_INTERVAL_MINUTES || '15', 10);

app.use(cors());
app.use(express.json());

// In-memory status tracker
const healthState = {
  serverStartedAt: new Date().toISOString(),
  lastPingTime: null,
  lastPingStatus: 'none',
  lastPingLatencyMs: 0,
  totalPingsSent: 0,
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Assignix API & Health Server',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      keepalive: '/api/keepalive',
    },
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const startTime = Date.now();
  const dbResult = await pingSupabase();
  
  // Update state
  healthState.lastPingTime = dbResult.timestamp;
  healthState.lastPingStatus = dbResult.success ? 'healthy' : 'failed';
  healthState.lastPingLatencyMs = dbResult.latencyMs;
  healthState.totalPingsSent += 1;

  const totalDuration = Date.now() - startTime;

  res.status(dbResult.success ? 200 : 503).json({
    status: dbResult.success ? 'healthy' : 'degraded',
    message: dbResult.success 
      ? 'Server and Supabase database are alive and healthy' 
      : 'Database connection failed or credentials missing',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      connected: dbResult.success,
      latencyMs: dbResult.latencyMs,
      error: dbResult.error || null,
      warning: dbResult.warning || null,
    },
    serverLatencyMs: totalDuration,
    keepAliveStats: {
      configuredIntervalMinutes: INTERVAL_MINUTES,
      totalPingsSent: healthState.totalPingsSent,
      lastPingTime: healthState.lastPingTime,
    },
  });
});

// Manual trigger keepalive endpoint
app.get('/api/keepalive', async (req, res) => {
  const result = await pingSupabase();
  healthState.lastPingTime = result.timestamp;
  healthState.lastPingStatus = result.success ? 'healthy' : 'failed';
  healthState.lastPingLatencyMs = result.latencyMs;
  healthState.totalPingsSent += 1;

  res.json({
    message: 'Manual Keep-Alive ping executed',
    result,
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Assignix Server running on http://localhost:${PORT}`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`⚡ Keep-Alive:   http://localhost:${PORT}/api/keepalive`);
  console.log(`⏱ Background Ping: Every ${INTERVAL_MINUTES} minute(s)`);
  console.log(`====================================================`);

  // Run an initial ping after 2 seconds
  setTimeout(() => {
    pingSupabase().then((res) => {
      healthState.lastPingTime = res.timestamp;
      healthState.lastPingStatus = res.success ? 'healthy' : 'failed';
      healthState.lastPingLatencyMs = res.latencyMs;
      healthState.totalPingsSent += 1;
    });
  }, 2000);

  // Set recurring keepalive interval (e.g. every 15 or 30 minutes)
  const intervalMs = INTERVAL_MINUTES * 60 * 1000;
  setInterval(async () => {
    console.log(`⏰ [Scheduler] Running scheduled ${INTERVAL_MINUTES}-minute keep-alive ping...`);
    const res = await pingSupabase();
    healthState.lastPingTime = res.timestamp;
    healthState.lastPingStatus = res.success ? 'healthy' : 'failed';
    healthState.lastPingLatencyMs = res.latencyMs;
    healthState.totalPingsSent += 1;
  }, intervalMs);
});
