// hooks/useCountdown.ts
import { useCallback, useEffect, useRef, useState } from 'react';

export type CountdownStatus = 'idle' | 'running' | 'paused' | 'finished';

interface UseCountdownOptions {
  onFinish?: () => void;
}

export function useCountdown(options?: UseCountdownOptions) {
  const [totalMs, setTotalMs] = useState(0);       // Total duration
  const [remainingMs, setRemainingMs] = useState(0); // Current remaining
  const [status, setStatus] = useState<CountdownStatus>('idle');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Tick — uses wall-clock for accuracy (not interval drift)
  const tick = useCallback(() => {
    const now = Date.now();
    const remaining = Math.max(0, endTimeRef.current - now);
    setRemainingMs(remaining);

    if (remaining <= 0) {
      clearTimer();
      setStatus('finished');
      options?.onFinish?.();
    }
  }, [clearTimer, options]);

  /** Set the countdown duration (doesn't start it) */
  const configure = useCallback((ms: number) => {
    clearTimer();
    setTotalMs(ms);
    setRemainingMs(ms);
    setStatus('idle');
  }, [clearTimer]);

  /** Start or resume */
  const start = useCallback(() => {
    if (remainingMs <= 0) return;
    clearTimer();
    endTimeRef.current = Date.now() + remainingMs;
    setStatus('running');
    intervalRef.current = setInterval(tick, 50); // 50ms for smooth UI
  }, [remainingMs, clearTimer, tick]);

  /** Pause */
  const pause = useCallback(() => {
    clearTimer();
    // Snapshot remaining from wall clock
    const remaining = Math.max(0, endTimeRef.current - Date.now());
    setRemainingMs(remaining);
    setStatus('paused');
  }, [clearTimer]);

  /** Reset to configured duration */
  const reset = useCallback(() => {
    clearTimer();
    setRemainingMs(totalMs);
    setStatus('idle');
  }, [clearTimer, totalMs]);

  /** Progress 0→1 (0 = full, 1 = finished) */
  const progress = totalMs > 0 ? 1 - remainingMs / totalMs : 0;

  // Cleanup on unmount
  useEffect(() => () => clearTimer(), [clearTimer]);

  return {
    totalMs,
    remainingMs,
    status,
    progress,
    configure,
    start,
    pause,
    reset,
  };
}
