// hooks/useChronometer.ts
import { useCallback, useEffect, useRef, useState } from 'react';

export type ChronometerStatus = 'idle' | 'running' | 'paused';

export function useChronometer() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [status, setStatus] = useState<ChronometerStatus>('idle');
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0); // ms accumulated before last pause

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    setElapsedMs(accumulatedRef.current + (now - startTimeRef.current));
  }, []);

  /** Start or resume */
  const start = useCallback(() => {
    if (status === 'idle') {
      setStartedAt(new Date().toISOString());
      accumulatedRef.current = 0;
    }
    startTimeRef.current = Date.now();
    setStatus('running');
    clearTimer();
    intervalRef.current = setInterval(tick, 30);
  }, [status, clearTimer, tick]);

  /** Pause */
  const pause = useCallback(() => {
    clearTimer();
    accumulatedRef.current += Date.now() - startTimeRef.current;
    setElapsedMs(accumulatedRef.current);
    setStatus('paused');
  }, [clearTimer]);

  /** Reset — returns the elapsed time for history saving */
  const reset = useCallback((): { durationMs: number; startedAt: string | null } => {
    clearTimer();
    const result = { durationMs: elapsedMs, startedAt };
    setElapsedMs(0);
    accumulatedRef.current = 0;
    setStatus('idle');
    setStartedAt(null);
    return result;
  }, [clearTimer, elapsedMs, startedAt]);

  // Cleanup
  useEffect(() => () => clearTimer(), [clearTimer]);

  return {
    elapsedMs,
    status,
    startedAt,
    start,
    pause,
    reset,
  };
}
