import { create } from "zustand";

export const LOADING_KEYS = ["nearby-gyms", "schedule-classes"] as const;

export type LoadingKey = (typeof LOADING_KEYS)[number];

interface LoadingState {
  counters: Record<LoadingKey, number>;
  show: (key: LoadingKey) => void;
  hide: (key: LoadingKey) => void;
  reset: (key: LoadingKey) => void;
}

const initialCounters: Record<LoadingKey, number> = {
  "nearby-gyms": 0,
  "schedule-classes": 0,
};

export const useLoadingStore = create<LoadingState>((set) => ({
  counters: initialCounters,

  show: (key) =>
    set((state) => ({
      counters: { ...state.counters, [key]: state.counters[key] + 1 },
    })),

  hide: (key) =>
    set((state) => ({
      counters: {
        ...state.counters,
        [key]: Math.max(0, state.counters[key] - 1),
      },
    })),

  reset: (key) =>
    set((state) => ({ counters: { ...state.counters, [key]: 0 } })),
}));

export function isLoadingKey(key: LoadingKey) {
  return (state: LoadingState) => state.counters[key] > 0;
}
