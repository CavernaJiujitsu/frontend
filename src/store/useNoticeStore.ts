import { create } from "zustand";

export type NoticeTone = "info" | "success" | "error";

type Notice = {
  title: string;
  message?: string;
  tone: NoticeTone;
};

type NoticeState = {
  notice: Notice | null;
  show: (notice: Notice) => void;
  hide: () => void;
};

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

export const useNoticeStore = create<NoticeState>((set) => ({
  notice: null,
  show: (notice) => {
    if (dismissTimer) clearTimeout(dismissTimer);
    set({ notice });
    dismissTimer = setTimeout(() => {
      dismissTimer = null;
      set({ notice: null });
    }, notice.tone === "error" ? 6000 : 4500);
  },
  hide: () => {
    if (dismissTimer) clearTimeout(dismissTimer);
    dismissTimer = null;
    set({ notice: null });
  },
}));
