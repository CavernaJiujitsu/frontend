import { create } from "zustand";

export type Session = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
};

interface SessionState {
  session: Session | null;
  setSession: (session: Session) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
}));
