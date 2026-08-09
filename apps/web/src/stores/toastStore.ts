import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (type: ToastType, message: string) => void;
  dismiss: (id: number) => void;
}

let toastSeq = 0;
const TOAST_DURATION = 3500;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (type, message) => {
    const id = ++toastSeq;
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, TOAST_DURATION);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(type: ToastType, message: string) {
  useToastStore.getState().push(type, message);
}
