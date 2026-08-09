import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type CurrencyCode, detectCountry } from "@/utils/currency";

interface CurrencyStore {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  toggleCurrency: () => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: detectCountry(),
      setCurrency: (currency) => set({ currency }),
      toggleCurrency: () => {
        const current = get().currency;
        set({ currency: current === "USD" ? "INR" : "USD" });
      },
    }),
    {
      name: "oryntal-currency",
      merge: (persisted, current) => {
        const raw = persisted as { currency?: unknown } | null;
        const currency =
          raw?.currency === "INR" || raw?.currency === "USD"
            ? raw.currency
            : current.currency;
        return { ...current, currency };
      },
    }
  )
);
