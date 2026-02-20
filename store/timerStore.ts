// store/timerStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Types ───────────────────────────────────────────────────────

export interface SavedTimer {
  id: string;
  title: string;
  durationMs: number; // total duration in ms
  startCount: number; // number of times this timer was started
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
  // Saved timer presets
  savedTimers: SavedTimer[];
  addTimer: (title: string, durationMs: number) => string;
  removeTimer: (id: string) => void;
  updateTimer: (id: string, updates: Partial<Pick<SavedTimer, 'title' | 'durationMs'>>) => void;
  incrementStartCount: (id: string) => void;
  resetStartCount: (id: string) => void;

  // Chronometer history (last 10)
  chronometerHistory: ChronometerSession[];
  addChronometerSession: (durationMs: number, startedAt: string) => void;
  clearChronometerHistory: () => void;

  // Preferences
  seeThrough: boolean;
  toggleSeeThrough: () => void;
  showStartCount: boolean;
  toggleShowStartCount: () => void;
}

// ── Helper ──────────────────────────────────────────────────────

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

// ── Store ───────────────────────────────────────────────────────

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      // ── Saved Timers ──────────────────────────────────────

      savedTimers: [],

      addTimer: (title, durationMs) => {
        const id = generateId();
        set((state) => ({
          savedTimers: [
            ...state.savedTimers,
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
      },

      removeTimer: (id) =>
        set((state) => ({
          savedTimers: state.savedTimers.filter((t) => t.id !== id),
        })),

      updateTimer: (id, updates) =>
        set((state) => ({
          savedTimers: state.savedTimers.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      incrementStartCount: (id) =>
        set((state) => ({
          savedTimers: state.savedTimers.map((t) =>
            t.id === id
              ? { ...t, startCount: t.startCount + 1, lastUsedAt: new Date().toISOString() }
              : t
          ),
        })),

      resetStartCount: (id) =>
        set((state) => ({
          savedTimers: state.savedTimers.map((t) =>
            t.id === id ? { ...t, startCount: 0 } : t
          ),
        })),

      // ── Chronometer History ───────────────────────────────

      chronometerHistory: [],

      addChronometerSession: (durationMs, startedAt) =>
        set((state) => ({
          chronometerHistory: [
            {
              id: generateId(),
              durationMs,
              startedAt,
              endedAt: new Date().toISOString(),
            },
            ...state.chronometerHistory,
          ].slice(0, 10), // Keep only last 10
        })),

      clearChronometerHistory: () => set({ chronometerHistory: [] }),

      // ── Preferences ───────────────────────────────────────

      seeThrough: false,
      toggleSeeThrough: () => set((state) => ({ seeThrough: !state.seeThrough })),

      showStartCount: true,
      toggleShowStartCount: () =>
        set((state) => ({ showStartCount: !state.showStartCount })),
    }),
    {
      name: 'float-timer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
