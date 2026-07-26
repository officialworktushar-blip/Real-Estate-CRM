import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GuestStore {
  isGuest: boolean;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
}

export const useGuestStore = create<GuestStore>()(
  persist(
    (set) => ({
      isGuest: false,
      enterGuestMode: () => set({ isGuest: true }),
      exitGuestMode: () => set({ isGuest: false }),
    }),
    { name: "oryntal-guest" }
  )
);
