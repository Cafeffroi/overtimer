// store/timerStore.ts
// Drop-in replacement for Zustand using React Context + AsyncStorage.
// All components keep using useTimerStore() exactly the same way.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Types ───────────────────────────────────────────────────────

export interface SavedTimer {
  id: string;
  title: string;
  durationMs: number;
  startCount: number;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface ChronometerSession {
  id: string;
  durationMs: number;
  startedAt: string;
  endedAt: string;
}

interface TimerState {
  savedTimers: SavedTimer[];
  chronometerHistory: ChronometerSession[];
  seeThrough: boolean;
  showStartCount: boolean;
}

interface TimerActions {
  addTimer: (title: string, durationMs: number) => string;
  removeTimer: (id: string) => void;
  updateTimer: (
    id: string,
    updates: Partial<Pick<SavedTimer, "title" | "durationMs">>,
  ) => void;
  incrementStartCount: (id: string) => void;
  resetStartCount: (id: string) => void;
  addChronometerSession: (durationMs: number, startedAt: string) => void;
  clearChronometerHistory: () => void;
  toggleSeeThrough: () => void;
  toggleShowStartCount: () => void;
}

type TimerStore = TimerState & TimerActions;

// ── Helpers ─────────────────────────────────────────────────────

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

const STORAGE_KEY = "float-timer-storage";

const defaultState: TimerState = {
  savedTimers: [],
  chronometerHistory: [],
  seeThrough: false,
  showStartCount: true,
};

// ── Context ─────────────────────────────────────────────────────

const TimerContext = createContext<TimerStore | null>(null);

// ── Provider ────────────────────────────────────────────────────

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TimerState>(defaultState);
  const [loaded, setLoaded] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setState((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  // Persist to AsyncStorage on change
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }
  }, [state, loaded]);

  // ── Actions ─────────────────────────────────────────────────

  const addTimer = useCallback((title: string, durationMs: number): string => {
    const id = generateId();
    setState((s) => ({
      ...s,
      savedTimers: [
        ...s.savedTimers,
        {
          id,
          title,
          durationMs,
          startCount: 0,
          createdAt: new Date().toISOString(),
          lastUsedAt: null,
        },
      ],
    }));
    return id;
  }, []);

  const removeTimer = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      savedTimers: s.savedTimers.filter((t) => t.id !== id),
    }));
  }, []);

  const updateTimer = useCallback(
    (
      id: string,
      updates: Partial<Pick<SavedTimer, "title" | "durationMs">>,
    ) => {
      setState((s) => ({
        ...s,
        savedTimers: s.savedTimers.map((t) =>
          t.id === id ? { ...t, ...updates } : t,
        ),
      }));
    },
    [],
  );

  const incrementStartCount = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      savedTimers: s.savedTimers.map((t) =>
        t.id === id
          ? {
              ...t,
              startCount: t.startCount + 1,
              lastUsedAt: new Date().toISOString(),
            }
          : t,
      ),
    }));
  }, []);

  const resetStartCount = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      savedTimers: s.savedTimers.map((t) =>
        t.id === id ? { ...t, startCount: 0 } : t,
      ),
    }));
  }, []);

  const addChronometerSession = useCallback(
    (durationMs: number, startedAt: string) => {
      setState((s) => ({
        ...s,
        chronometerHistory: [
          {
            id: generateId(),
            durationMs,
            startedAt,
            endedAt: new Date().toISOString(),
          },
          ...s.chronometerHistory,
        ].slice(0, 10),
      }));
    },
    [],
  );

  const clearChronometerHistory = useCallback(() => {
    setState((s) => ({ ...s, chronometerHistory: [] }));
  }, []);

  const toggleSeeThrough = useCallback(() => {
    setState((s) => ({ ...s, seeThrough: !s.seeThrough }));
  }, []);

  const toggleShowStartCount = useCallback(() => {
    setState((s) => ({ ...s, showStartCount: !s.showStartCount }));
  }, []);

  const store: TimerStore = {
    ...state,
    addTimer,
    removeTimer,
    updateTimer,
    incrementStartCount,
    resetStartCount,
    addChronometerSession,
    clearChronometerHistory,
    toggleSeeThrough,
    toggleShowStartCount,
  };

  return React.createElement(TimerContext.Provider, { value: store }, children);
}

// ── Hook (drop-in replacement for Zustand's useTimerStore) ──────

export function useTimerStore<T = TimerStore>(
  selector?: (state: TimerStore) => T,
): T {
  const store = useContext(TimerContext);
  if (!store) {
    throw new Error("useTimerStore must be used within a TimerProvider");
  }
  if (selector) {
    return selector(store);
  }
  return store as unknown as T;
}
