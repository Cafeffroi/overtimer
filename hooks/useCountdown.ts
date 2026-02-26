// hooks/useCountdown.ts
import { useCallback, useEffect, useRef, useState } from "react";

export type CountdownStatus = "idle" | "running" | "paused" | "finished";

interface UseCountdownOptions {
  onFinish?: () => void;
}

export function useCountdown(options?: UseCountdownOptions) {
  const [totalMs, setTotalMs] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [status, setStatus] = useState<CountdownStatus>("idle");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);
  const totalMsRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    const remaining = Math.max(0, endTimeRef.current - now);
    setRemainingMs(remaining);

    if (remaining <= 0) {
      clearTimer();
      setStatus("finished");
      options?.onFinish?.();
    }
  }, [clearTimer, options]);

  /** Set the countdown duration (doesn't start it) */
  const configure = useCallback(
    (ms: number) => {
      clearTimer();
      totalMsRef.current = ms;
      setTotalMs(ms);
      setRemainingMs(ms);
      setStatus("idle");
    },
    [clearTimer],
  );

  /** Start or resume */
  const start = useCallback(() => {
    if (remainingMs <= 0) return;
    clearTimer();
    endTimeRef.current = Date.now() + remainingMs;
    setStatus("running");
    intervalRef.current = setInterval(tick, 50);
  }, [remainingMs, clearTimer, tick]);

  /** Pause */
  const pause = useCallback(() => {
    clearTimer();
    const remaining = Math.max(0, endTimeRef.current - Date.now());
    setRemainingMs(remaining);
    setStatus("paused");
  }, [clearTimer]);

  /** Reset to configured duration */
  const reset = useCallback(() => {
    clearTimer();
    setRemainingMs(totalMsRef.current);
    setStatus("idle");
  }, [clearTimer]);

  /** Restart — reset + start immediately in one call */
  const restart = useCallback(() => {
    clearTimer();
    const total = totalMsRef.current;
    setRemainingMs(total);
    endTimeRef.current = Date.now() + total;
    setStatus("running");
    intervalRef.current = setInterval(tick, 50);
  }, [clearTimer, tick]);

  const progress = totalMs > 0 ? 1 - remainingMs / totalMs : 0;

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
    restart,
  };
}
