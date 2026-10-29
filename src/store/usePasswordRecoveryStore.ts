import { create } from "zustand";

type PasswordRecoveryState = {
  confirmationMessage: string | null;
  setConfirmationMessage: (message: string) => void;
  clearConfirmationMessage: () => void;
};

export const usePasswordRecoveryStore = create<PasswordRecoveryState>((set) => ({
  confirmationMessage: null,
  setConfirmationMessage: (confirmationMessage) => set({ confirmationMessage }),
  clearConfirmationMessage: () => set({ confirmationMessage: null }),
}));
