import { create } from "zustand";

export const LOADING_KEYS = ["nearby-gyms", "schedule-classes"] as const;

export type LoadingKey = (typeof LOADING_KEYS)[number];

interface LoadingState {
  /** Contador por chave — requests sobrepostas não apagam o loading cedo. */
  counters: Record<LoadingKey, number>;
  show: (key: LoadingKey) => void;
  hide: (key: LoadingKey) => void;
  reset: (key: LoadingKey) => void;
}

const initialCounters: Record<LoadingKey, number> = {
  "nearby-gyms": 0,
  "schedule-classes": 0,
};

/**
 * Gerenciador centralizado de loading das listagens. A tela que dispara a
 * requisição chama `show(key)` antes e `hide(key)` no `finally` — o
 * componente de loading apenas observa `isLoading(key)`.
 */
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

/** Seletor — a tela assina só a própria chave, sem re-render cruzado. */
export function isLoadingKey(key: LoadingKey) {
  return (state: LoadingState) => state.counters[key] > 0;
}
