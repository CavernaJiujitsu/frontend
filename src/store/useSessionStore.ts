import { create } from "zustand";
import type { UserRole } from "@/api/services/auth.service";

export type Session = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  roles: UserRole[];
  practitionerId?: string;
  teacherId?: string;
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
