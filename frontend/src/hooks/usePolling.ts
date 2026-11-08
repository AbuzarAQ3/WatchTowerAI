import { useEffect, useRef, useState, useCallback } from 'react';
import { isMockEnabled } from '../services/config';

export interface UsePollingOptions {
  intervalMs: number;
  onPoll: () => Promise<void>;
  enabled?: boolean;
}

export function usePolling({ intervalMs, onPoll, enabled = true }: UsePollingOptions) {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const onPollRef = useRef(onPoll);
  const isPollingRef = useRef(false);
  const isStoppedRef = useRef(false);

  // Keep latest onPoll in ref so interval doesn't restart on every render
  useEffect(() => {
    onPollRef.current = onPoll;
  }, [onPoll]);

  const executePoll = useCallback(async () => {
    // If polling stopped (e.g. 401), or a poll is already in flight, skip
    if (isStoppedRef.current || isPollingRef.current) return;

    isPollingRef.current = true;
    try {
      await onPollRef.current();
      setIsReconnecting(false);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        // Stop polling on 401; interceptor will handle session expiry/logout
        isStoppedRef.current = true;
      } else {
        // Network/server error during background poll: mark reconnecting without breaking existing UI
        setIsReconnecting(true);
      }
    } finally {
      isPollingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Polling is disabled in mock mode or when explicitly disabled
    if (isMockEnabled() || !enabled) {
      return;
    }

    isStoppedRef.current = false;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        return;
      }
      // When tab becomes visible again, trigger an immediate refresh once
      executePoll();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const timer = setInterval(() => {
      if (!document.hidden) {
        executePoll();
      }
    }, intervalMs);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [intervalMs, enabled, executePoll]);

  return { isReconnecting, setIsReconnecting };
}
