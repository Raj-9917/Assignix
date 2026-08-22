import { useEffect, useState } from 'react';
import { startKeepAlive, stopKeepAlive, checkSupabaseHealth } from '../services/healthCheckService';

/**
 * React hook to automatically run a background keep-alive ping for Supabase
 * @param {number} [intervalMinutes=15] - Interval in minutes (default 15)
 * @param {boolean} [enabled=true] - Whether keepalive is active
 */
export function useKeepAlive(intervalMinutes = 15, enabled = true) {
  const [healthStatus, setHealthStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Start background keepalive
    startKeepAlive(intervalMinutes, (result) => {
      setHealthStatus(result);
    });

    return () => {
      stopKeepAlive();
    };
  }, [intervalMinutes, enabled]);

  const triggerManualCheck = async () => {
    setIsChecking(true);
    try {
      const result = await checkSupabaseHealth();
      setHealthStatus(result);
      return result;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    healthStatus,
    isChecking,
    triggerManualCheck,
  };
}

export default useKeepAlive;
